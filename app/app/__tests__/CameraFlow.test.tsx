import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { uploadImage } from '@/lib/api';
import CameraScreen from '../(tabs)/index';
import PreviewScreen from '../preview';
import { useAppContext } from '../../context/AppContext';

// ──────────────────────────────────────────────
// 🧩 Mock dependencies
// ──────────────────────────────────────────────
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('../../components/CameraView', () => ({
  CameraView: ({ onCapture }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="mock-camera-capture" onPress={() => onCapture('file://mock-image.jpg')}>
        <Text>Capture Photo</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../lib/api', () => ({
  uploadImage: jest.fn(),
}));

// ──────────────────────────────────────────────
// 🧪 Test Suite: Camera → Preview → Results Flow
// ──────────────────────────────────────────────
describe('Camera to Preview Flow (Photon Decode)', () => {
  const mockSetSelectedImage = jest.fn();
  const mockAddSubmission = jest.fn();
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAppContext as jest.Mock).mockReturnValue({
      setSelectedImage: mockSetSelectedImage,
      selectedImage: 'file://mock-image.jpg',
      addSubmission: mockAddSubmission,
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
    });
  });

  // ──────────────────────────────────────────────
  it('captures image and navigates to preview screen', async () => {
    const { getByTestId } = render(<CameraScreen />);

    fireEvent.press(getByTestId('mock-camera-capture'));

    await waitFor(() => {
      expect(mockSetSelectedImage).toHaveBeenCalledWith('file://mock-image.jpg');
      expect(mockPush).toHaveBeenCalledWith('/preview');
    });
  });

  // ──────────────────────────────────────────────
  it('allows user to cancel and go back from preview', async () => {
    const { getByText } = render(<PreviewScreen />);

    fireEvent.press(getByText('Retake'));

    await waitFor(() => {
      expect(mockSetSelectedImage).toHaveBeenCalledWith(null);
      expect(mockBack).toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────
  it('submits image successfully and navigates to results', async () => {
    const mockResponse = {
      id: 'test-id-123',
      status: 'processed',
      extractedText: 'PHOTON-2025-001',
      extractionSuccess: true,
      quality: 'good',
      thumbnailUrl: 'thumb-123.png',
      processedAt: '2025-01-30T12:00:00Z',
      approach: 'original_rgba',
      message: 'Image processed successfully',
    };

    (uploadImage as jest.Mock).mockResolvedValue(mockResponse);

    const { getByText } = render(<PreviewScreen />);
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      // API call
      expect(uploadImage).toHaveBeenCalledWith('file://mock-image.jpg');

      // Stored submission
      expect(mockAddSubmission).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id-123',
          status: 'processed',
          extractedText: 'PHOTON-2025-001',
        })
      );

      // Navigation to results
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/results',
        params: {
          extractedText: "PHOTON-2025-001",
          extractionSuccess: "true",
          processedAt: "2025-01-30T12:00:00Z",
          quality: "good",
          status: "processed",
          id: "test-id-123",
          thumbnailUrl: "thumb-123.png",
          localImageUri: "file://mock-image.jpg",
        },
      });
    });
  });

  // ──────────────────────────────────────────────
  it('shows error alert if upload fails', async () => {
    const mockAlert = jest.spyOn(Alert, 'alert');
    const networkErrorMessage = 'Network error. Please check your connection and try again.';

    (uploadImage as jest.Mock).mockRejectedValue(new Error(networkErrorMessage));

    const { getByText } = render(<PreviewScreen />);
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Upload Failed', networkErrorMessage);
    });
  });
});