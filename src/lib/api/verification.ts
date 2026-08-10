import { apiClient } from "./client";

export interface VerificationDoc {
  type: string;
  url: string;
  download_url?: string;
  expires?: number;
}

export interface Verification {
  _id: string;
  user_id: string;
  type: "talent_id" | "recruiter_company";
  status: "pending" | "auto_approved" | "manual_review" | "approved" | "rejected";
  submitted_docs: VerificationDoc[];
  ocr_data?: Record<string, unknown>;
  face_match_score?: number;
  liveness_score?: number;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export const verificationApi = {
  getForUser: async (userId: string) => {
    const response = await apiClient.get(`/verifications/user/${userId}`);
    return response.data as Verification | null;
  },

  create: async (type: "talent_id" | "recruiter_company" = "talent_id") => {
    const response = await apiClient.post("/verifications", { type });
    return response.data as Verification;
  },

  uploadDoc: async (
    verificationId: string,
    file: File,
    docType: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);
    const response = await apiClient.post(
      `/verifications/${verificationId}/docs`,
      formData,
      {
        headers: { "Content-Type": undefined },
        params: { doc_type: docType },
      },
    );
    return response.data as { type: string; download_url: string; expires: number };
  },

  removeDoc: async (verificationId: string, docIndex: number) => {
    const response = await apiClient.delete(
      `/verifications/${verificationId}/docs/${docIndex}`,
    );
    return response.data as { message: string };
  },
};
