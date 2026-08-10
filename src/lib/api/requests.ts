import { apiClient } from "./client";

export interface EnrichedUserProfile {
  _id: string;
  email: string;
  role: string;
  full_legal_name?: string;
  username?: string;
  profile_photo?: string;
  company_name?: string;
  company_website?: string;
  company_size?: string;
  position?: string;
  verification_status?: string;
  specialties?: string[];
  slug?: string;
}

export interface CollaborationRequest {
  _id: string;
  participant_ids: string[];
  requester_id: EnrichedUserProfile;
  receiver_id: EnrichedUserProfile;
  status: "pending" | "messaging_only" | "accepted" | "rejected";
  message?: string;
  reason?: "collaboration" | "mentorship" | "referral";
  created_at: string;
  updated_at: string;
}

export interface MyRequestsResponse {
  sent: CollaborationRequest[];
  received: CollaborationRequest[];
}

export const requestsApi = {
  getMyRequests: async () => {
    const response = await apiClient.get("/collaboration-requests");
    return response.data as MyRequestsResponse;
  },

  createRequest: async (data: {
    receiver_id: string;
    message?: string;
    reason?: string;
  }) => {
    const response = await apiClient.post("/collaboration-requests", data);
    return response.data as CollaborationRequest;
  },

  acceptRequest: async (id: string) => {
    const response = await apiClient.patch(`/collaboration-requests/${id}/accept`);
    return response.data as CollaborationRequest;
  },

  rejectRequest: async (id: string) => {
    const response = await apiClient.patch(`/collaboration-requests/${id}/reject`);
    return response.data as CollaborationRequest;
  },
};
