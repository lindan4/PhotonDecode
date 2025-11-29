import axios, { AxiosError } from "axios";
import { SubmissionUploadResponse, PaginatedSubmissionsResponse } from "./types";
import { BASE_URL } from "@/constants";

// Use the unified base path
const API_BASE_URL = `${BASE_URL}/api`;

const client = axios.create({ baseURL: API_BASE_URL });

/**
 * Handles API errors and checks for offline status.
 * @param error The error object from Axios.
 */
const handleError = (error: AxiosError) => {
  if (!error.response) {
    console.error("Network Error:", error.message);
    throw new Error("Network error. Please check your connection and try again.");
  }

  const serverError = (error.response.data as { error?: string })?.error;
  if (serverError) {
    console.error("Server Error:", serverError);
    throw new Error(serverError);
  }

  console.error("API Error:", error.message);
  throw new Error("An unexpected error occurred. Please try again.");
};

/**
 * Uploads an image file to the backend for text extraction.
 */
export const uploadImage = async (uri: string): Promise<SubmissionUploadResponse> => {
  const formData = new FormData();
  formData.append("image", {
    uri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any);

  try {
    // ✅ Updated endpoint path
    const { data } = await client.post("/submissions/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    handleError(error as AxiosError);
    return Promise.reject(error);
  }
};

/**
 * Fetches a paginated list of uploaded submissions.
 */
export const fetchSubmissions = async (
  page = 1,
  limit = 10
): Promise<PaginatedSubmissionsResponse> => {
  try {
    // ✅ Updated endpoint path
    const { data } = await client.get("/submissions", { params: { page, limit } });
    return data;
  } catch (error) {
    handleError(error as AxiosError);
    return Promise.reject(error);
  }
};

export default client;