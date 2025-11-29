// The single source of truth for a submission's structure in the mobile app.
export interface Submission {
  id: string;
  extractedText: string | null;
  extractionSuccess: boolean;
  quality: "good" | "fair" | "poor" | null;
  thumbnailUrl: string | null;
  status: "pending" | "processed" | "failed";
  createdAt: string;

  localImageUri?: string;
}

// Response from the backend when an image is uploaded
export interface SubmissionUploadResponse {
  id: string;
  status: "processed" | "error";
  extractedText: string | null;
  extractionSuccess: boolean;
  quality: "good" | "fair" | "poor" | null;
  processedAt: string;
  thumbnailUrl?: string;
  message?: string;
  approach?: string; // optional: which preprocessing strategy succeeded
}

// Paginated response for the submissions list
export interface PaginatedSubmissionsResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  submissions: Submission[];
}