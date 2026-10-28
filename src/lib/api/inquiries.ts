import { apiClient } from "./client";

export type ServiceInquiryStatus = "new" | "responded" | "closed";

export interface ServiceInquiry {
  id: string;
  requester_id: string;
  provider_id: string;
  service_id: string | null;
  description: string;
  requested_date: string | null;
  location: string | null;
  budget: { amount: number; currency: string } | null;
  status: ServiceInquiryStatus;
  conversation_id: string;
  viewer_role: "requester" | "provider";
  created_at: string;
  updated_at: string;
}

export interface CreateServiceInquiryPayload {
  provider_slug?: string;
  service_id?: string;
  description: string;
  requested_date?: string;
  location?: string;
  budget?: { amount: number; currency: string };
  idempotency_key: string;
}

export interface ServiceInquiryQuery {
  status?: ServiceInquiryStatus;
  page?: number;
  limit?: number;
}

export interface ServiceInquiriesResponse {
  data: ServiceInquiry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const serviceInquiriesApi = {
  create: async (payload: CreateServiceInquiryPayload) => {
    const response = await apiClient.post("/service-inquiries", payload);
    return response.data as { inquiry: ServiceInquiry };
  },

  getMine: async (params?: ServiceInquiryQuery) => {
    const response = await apiClient.get("/service-inquiries/mine", { params });
    return response.data as ServiceInquiriesResponse;
  },

  getIncoming: async (params?: ServiceInquiryQuery) => {
    const response = await apiClient.get("/service-inquiries/incoming", {
      params,
    });
    return response.data as ServiceInquiriesResponse;
  },

  getOne: async (id: string) => {
    const response = await apiClient.get(
      `/service-inquiries/${encodeURIComponent(id)}`,
    );
    return response.data as {
      inquiry: ServiceInquiry;
      viewer_role: "requester" | "provider";
    };
  },

  update: async (
    id: string,
    payload: {
      description?: string;
      requested_date?: string | null;
      location?: string | null;
      budget?: { amount: number; currency: string } | null;
      status?: ServiceInquiryStatus;
    },
  ) => {
    const response = await apiClient.patch(
      `/service-inquiries/${encodeURIComponent(id)}`,
      payload,
    );
    return response.data as { inquiry: ServiceInquiry };
  },
};
