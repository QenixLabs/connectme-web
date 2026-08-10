import { apiClient } from "./client";

export interface RecruiterProfile {
  _id: string;
  user_id: string;
  slug: string;
  company_name: string;
  company_website?: string;
  company_email_domain?: string;
  linkedin_company_url?: string;
  company_size?: string;
  industry?: string;
  headline?: string;
  about?: string;
  founded_year?: number;
  location?: { country?: string; state?: string; city?: string };
  specialties?: string[];
  position?: string;
  profile_photo?: string;
  verification_status: "pending" | "basic" | "enterprise" | "trusted_partner";
  verification_docs?: string[];
  message_quota: { used: number; limit: number };
  campaign_quota: { used: number; limit: number };
  created_at: string;
  updated_at: string;
}

export interface UpdateRecruiterProfilePayload {
  slug?: string;
  company_name?: string;
  company_website?: string;
  linkedin_company_url?: string;
  company_size?: string;
  industry?: string;
  headline?: string;
  about?: string;
  founded_year?: number;
  location?: { country?: string; state?: string; city?: string };
  specialties?: string[];
  position?: string;
  profile_photo?: string;
}

export interface PublicRecruiterProfile {
  user_id: string;
  slug: string;
  company_name: string;
  profile_photo?: string;
  company_website?: string;
  linkedin_company_url?: string;
  company_size?: string;
  industry?: string;
  headline?: string;
  about?: string;
  founded_year?: number;
  location?: { country?: string; state?: string; city?: string };
  specialties?: string[];
  position?: string;
  verification_status: "pending" | "basic" | "enterprise" | "trusted_partner";
  trust_score: number;
  verification_tier: number;
  active_plan?: string | null;
  member_since?: string | null;
  active_campaigns_count: number;
}

export interface PublicCampaignSummary {
  _id: string;
  name: string;
  description?: string;
  role_type?: string;
  location?: { city?: string; state?: string };
  budget_range?: { min?: number; max?: number; currency?: string };
  deadline?: string;
  applications_count: number;
  created_at: string;
}

export interface PublicCampaignsResponse {
  data: PublicCampaignSummary[];
  total: number;
}

export const recruiterApi = {
  getMyProfile: async () => {
    const response = await apiClient.get("/recruiters/me");
    return response.data as RecruiterProfile;
  },

  updateProfile: async (payload: UpdateRecruiterProfilePayload) => {
    const response = await apiClient.patch("/recruiters/me", payload);
    return response.data as RecruiterProfile;
  },

  uploadProfilePhoto: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/recruiters/upload/profile-photo", formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data as { relativePath: string; signedUrl: string };
  },

  checkSlugAvailability: async (slug: string): Promise<boolean> => {
    const response = await apiClient.get(`/recruiters/slug/${slug}/available`);
    const body = response.data as { available: boolean };
    return body.available;
  },

  getPublicProfile: async (slug: string) => {
    const response = await apiClient.get(`/recruiters/public/${slug}`);
    return response.data as PublicRecruiterProfile;
  },

  getPublicCampaigns: async (slug: string, limit?: number) => {
    const params = limit ? { limit } : undefined;
    const response = await apiClient.get(`/recruiters/public/${slug}/campaigns`, { params });
    return response.data as PublicCampaignsResponse;
  },
};
