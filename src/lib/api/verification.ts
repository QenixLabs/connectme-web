import { apiClient } from './client';
import type { AxiosError } from 'axios';

export interface VerificationRecord {
  _id: string;
  user_id: string;
  type: string;
  status: string;
  submitted_docs: { type: string; url: string }[];
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocResponse {
  type: string;
  download_url: string;
  expires: number;
}

export interface VerificationStatusResponse {
  verification: VerificationRecord | null;
  docs: VerificationDocResponse[];
}

export const verificationApi = {
  createVerification: async (type: 'talent_id' | 'recruiter_company'): Promise<VerificationRecord> => {
    const response = await apiClient.post('/verifications', { type });
    return response.data;
  },

  addVerificationDoc: async (
    verificationId: string,
    file: File,
    docType: string,
  ): Promise<VerificationRecord> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    const response = await apiClient.post(`/verifications/${verificationId}/docs`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  getVerificationStatus: async (userId: string): Promise<VerificationStatusResponse | null> => {
    try {
      const response = await apiClient.get(`/verifications/user/${userId}`);
      return response.data as VerificationStatusResponse;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) return null;
      throw err;
    }
  },

  removeVerificationDoc: async (verificationId: string, docIndex: number): Promise<VerificationRecord> => {
    const response = await apiClient.delete(`/verifications/${verificationId}/docs/${docIndex}`);
    return response.data;
  },
};
