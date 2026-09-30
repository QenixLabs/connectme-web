import { apiClient } from "./client";

export type CollabPostStatus = "open" | "closed";
export type ViewerInterest = "none" | "pending" | "connected";

export interface CollabPostOwner {
  username?: string;
  full_legal_name?: string;
  profile_photo?: string;
  professions?: string[];
  is_verified?: boolean;
}

export interface CollabPost {
  _id: string;
  owner_id: string;
  title: string;
  description: string;
  looking_for: string[];
  location?: { city?: string; state?: string };
  status: CollabPostStatus;
  interested_count: number;
  created_at?: string;
  updated_at?: string;
  owner: CollabPostOwner;
  viewer_interest: ViewerInterest;
}

export interface CollabPostsParams {
  search?: string;
  looking_for?: string;
  city?: string;
  status?: CollabPostStatus;
  page?: number;
  limit?: number;
}

export interface CollabPostsResponse {
  data: CollabPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateCollabPostPayload {
  title: string;
  description: string;
  looking_for?: string[];
  location_city?: string;
  location_state?: string;
}

export interface ExpressInterestResponse {
  post: CollabPost;
  wasAccepted: boolean;
  conversationId?: string;
}

export const collabPostsApi = {
  listFeed: async (params: CollabPostsParams = {}) => {
    const response = await apiClient.get("/collab-posts", { params });
    return response.data as CollabPostsResponse;
  },

  listMine: async (params: CollabPostsParams = {}) => {
    const response = await apiClient.get("/collab-posts/mine", { params });
    return response.data as CollabPostsResponse;
  },

  getOne: async (id: string) => {
    const response = await apiClient.get(`/collab-posts/${id}`);
    return response.data as CollabPost;
  },

  create: async (payload: CreateCollabPostPayload) => {
    const response = await apiClient.post("/collab-posts", payload);
    return response.data as CollabPost;
  },

  update: async (id: string, payload: Partial<CreateCollabPostPayload>) => {
    const response = await apiClient.patch(`/collab-posts/${id}`, payload);
    return response.data as CollabPost;
  },

  close: async (id: string) => {
    const response = await apiClient.post(`/collab-posts/${id}/close`);
    return response.data as CollabPost;
  },

  reopen: async (id: string) => {
    const response = await apiClient.post(`/collab-posts/${id}/reopen`);
    return response.data as CollabPost;
  },

  remove: async (id: string) => {
    const response = await apiClient.delete(`/collab-posts/${id}`);
    return response.data as { deleted: boolean };
  },

  expressInterest: async (id: string, message?: string) => {
    const response = await apiClient.post(`/collab-posts/${id}/interested`, { message });
    return response.data as ExpressInterestResponse;
  },
};
