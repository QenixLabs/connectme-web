import { apiClient } from "./client";

export interface RecruiterProfile {
  _id: string;
  user_id: string;
  slug: string;
  company_name: string;
  company_website?: string;
  company_email_domain?: string;
  linkedin_company_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  x_url?: string;
  company_size?: string;
  industry?: string;
  headline?: string;
  about?: string;
  founded_year?: number;
  location?: { country?: string; state?: string; city?: string };
  specialties?: string[];
  languages?: string[];
  position?: string;
  profile_photo?: string;
  banner_image_url?: string;
  banner_tags?: string[];
  motto?: string;
  casting_categories?: string[];
  team_values?: { title: string; description: string }[];
  cta_headline?: string;
  cta_subheadline?: string;
  cta_image_url?: string;
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
  instagram_url?: string;
  youtube_url?: string;
  x_url?: string;
  company_size?: string;
  industry?: string;
  headline?: string;
  about?: string;
  founded_year?: number;
  location?: { country?: string; state?: string; city?: string };
  specialties?: string[];
  languages?: string[];
  position?: string;
  profile_photo?: string;
  banner_image_url?: string;
  banner_tags?: string[];
  motto?: string;
  casting_categories?: string[];
  team_values?: { title: string; description: string }[];
  cta_headline?: string;
  cta_subheadline?: string;
  cta_image_url?: string;
}

export interface PublicRecruiterProfile {
  user_id: string;
  slug: string;
  company_name: string;
  profile_photo?: string;
  company_website?: string;
  linkedin_company_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  x_url?: string;
  company_size?: string;
  industry?: string;
  headline?: string;
  about?: string;
  founded_year?: number;
  location?: { country?: string; state?: string; city?: string };
  specialties?: string[];
  languages?: string[];
  position?: string;
  banner_image_url?: string;
  banner_tags?: string[];
  motto?: string;
  casting_categories?: string[];
  team_values?: { title: string; description: string }[];
  cta_headline?: string;
  cta_subheadline?: string;
  cta_image_url?: string;
  verification_status: "pending" | "basic" | "enterprise" | "trusted_partner";
  trust_score: number;
  verification_tier: number;
  active_plan?: string | null;
  member_since?: string | null;
  active_campaigns_count: number;
  completed_campaigns_count: number;
  total_talents_count: number;
  average_rating: number;
  total_reviews_count: number;
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
  cover_image_url?: string;
  created_at: string;
}

export interface PublicCampaignsResponse {
  data: PublicCampaignSummary[];
  total: number;
}

export interface PublicTeamMember {
  _id: string;
  name: string;
  role: string;
  photo?: string;
  linkedin_url?: string;
  bio?: string;
}

export interface PublicReview {
  _id: string;
  rating: number;
  content: string;
  author_name: string;
  author_photo?: string;
  author_role?: string;
  campaign_id?: string;
  created_at: string;
}

export interface PublicReviewsResponse {
  data: PublicReview[];
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

  uploadBanner: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/recruiters/upload/banner", formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data as { relativePath: string; signedUrl: string };
  },

  uploadAsset: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/recruiters/upload/asset", formData, {
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

  getPublicTeam: async (slug: string) => {
    const response = await apiClient.get(`/recruiters/public/${slug}/team`);
    return response.data as PublicTeamMember[];
  },

  getPublicReviews: async (slug: string, page?: number, limit?: number) => {
    const params: Record<string, number> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const response = await apiClient.get(`/recruiters/public/${slug}/reviews`, { params });
    return response.data as PublicReviewsResponse;
  },

  saveRecruiter: async (slug: string) => {
    const response = await apiClient.post(`/recruiters/${slug}/save`);
    return response.data as { saved: boolean };
  },

  unsaveRecruiter: async (slug: string) => {
    const response = await apiClient.delete(`/recruiters/${slug}/save`);
    return response.data as { saved: boolean };
  },

  getRecruiterSaveStatus: async (slug: string) => {
    const response = await apiClient.get(`/recruiters/${slug}/save/status`);
    return response.data as { is_saved: boolean };
  },
};
