import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import HistoryScreen from '../(tabs)/history';

// ─────────────────────────────
// 🔧 Mock the API
// ─────────────────────────────
jest.mock('../../lib/api', () => ({
  fetchSubmissions: jest.fn(),
}));

import { fetchSubmissions } from '../../lib/api';
const mockedFetchSubmissions = fetchSubmissions as jest.Mock;

// ─────────────────────────────
// 🔧 Mock AppContext
// ─────────────────────────────
jest.mock('../../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

import { useAppContext } from '../../context/AppContext';
const mockedUseAppContext = useAppContext as jest.Mock;

// ─────────────────────────────
// 🧪 Test Suite
// ─────────────────────────────
describe('HistoryScreen', () => {
  const mockSetSubmissions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAppContext.mockReturnValue({
      submissions: [],
      setSubmissions: mockSetSubmissions,
    });
  });

  // ─────────────────────────────
  it('renders submissions when API succeeds', async () => {
    const mockData = {
      submissions: [
        { 
          id: '1', 
          extractedText: 'PHOTON-2025-001', 
          status: 'processed',
          extractionSuccess: true,
          quality: 'good',
          thumbnailUrl: 'thumb-1.png',
          createdAt: '2025-01-30T12:00:00Z'
        },
        { 
          id: '2', 
          extractedText: 'PHOTON-2025-002', 
          status: 'expired',
          extractionSuccess: true,
          quality: 'fair',
          thumbnailUrl: 'thumb-2.png',
          createdAt: '2025-01-30T12:00:00Z'
        },
      ],
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1
    };
    
    mockedFetchSubmissions.mockResolvedValue(mockData);

    mockedUseAppContext.mockReturnValue({
      submissions: mockData.submissions,
      setSubmissions: mockSetSubmissions,
    });

    render(<HistoryScreen />);

    // Search for just the extracted text values, not the full label
    expect(await screen.findByText('PHOTON-2025-001')).toBeTruthy();
    expect(await screen.findByText('PHOTON-2025-002')).toBeTruthy();

    expect(mockedFetchSubmissions).toHaveBeenCalledWith(1, 10);
    expect(mockSetSubmissions).toHaveBeenCalledWith(mockData.submissions);
  
  });

  // ─────────────────────────────
  it('shows empty state when no submissions exist', async () => {
    mockedFetchSubmissions.mockResolvedValue({
      submissions: [],
      totalPages: 1,
    });

    mockedUseAppContext.mockReturnValue({
      submissions: [],
      setSubmissions: mockSetSubmissions,
    });

    render(<HistoryScreen />);

    expect(await screen.findByText('No submissions yet.')).toBeTruthy();
    expect(screen.getByText('Pull down to refresh.')).toBeTruthy();

    expect(mockedFetchSubmissions).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────
  it('displays error UI when API fails', async () => {
    mockedFetchSubmissions.mockRejectedValueOnce(new Error('Network failure'));

    mockedUseAppContext.mockReturnValue({
      submissions: [],
      setSubmissions: mockSetSubmissions,
    });

    render(<HistoryScreen />);

    // Error UI should appear
    expect(
      await screen.findByText('Failed to Load Submissions')
    ).toBeTruthy();

    expect(screen.getByText('Network failure')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();

    // Ensure submissions were NOT set
    expect(mockSetSubmissions).not.toHaveBeenCalledWith(expect.any(Array));
  });
});