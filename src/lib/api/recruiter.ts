import { apiClient } from './client';

export interface RecruiterPublicProfile {
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
  verification_status: string;
  trust_score: number;
  verification_tier: number;
  active_plan: string | null;
  member_since: string | null;
  active_campaigns_count: number;
}

export interface PublicCampaign {
  _id: string;
  name: string;
  description?: string;
  role_type?: string;
  location?: { city: string; state?: string };
  budget_range?: { min: number; max: number; currency: string };
  deadline?: string;
  applications_count: number;
  created_at: string;
}

export const recruiterApi = {
  getMyProfile: async (): Promise<{
    _id: string;
    user_id: string;
    company_name: string;
    company_website?: string;
    company_email_domain: string;
    linkedin_company_url?: string;
    company_size?: string;
    specialties?: string[];
    position?: string;
    profile_photo?: string;
    verification_status: string;
    active_plan: string | null;
    created_at: string;
    updated_at: string;
  }> => {
    const response = await apiClient.get('/recruiters/me');
    return response.data;
  },

  checkSlugAvailability: async (slug: string): Promise<{ available: boolean }> => {
    const response = await apiClient.get(`/recruiters/slug/${slug}/available`);
    return response.data;
  },

  updateProfile: async (payload: {
    slug?: string;
    company_name?: string;
    company_website?: string;
    linkedin_company_url?: string;
    company_size?: string;
    specialties?: string[];
    position?: string;
    profile_photo?: string;
  }): Promise<{
    _id: string;
    company_name: string;
    company_website?: string;
    linkedin_company_url?: string;
    company_size?: string;
    specialties?: string[];
    position?: string;
    profile_photo?: string;
  }> => {
    const response = await apiClient.patch('/recruiters/me', payload);
    return response.data;
  },

  uploadProfilePhoto: async (file: File): Promise<{ relativePath: string; signedUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/recruiters/upload/profile-photo', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  getPublicProfile: async (slug: string): Promise<RecruiterPublicProfile> => {
    const response = await apiClient.get(`/recruiters/public/${slug}`);
    return response.data;
  },

  getPublicCampaigns: async (
    slug: string,
    limit?: number,
  ): Promise<{ data: PublicCampaign[]; total: number }> => {
    const response = await apiClient.get(`/recruiters/public/${slug}/campaigns`, {
      params: { limit },
    });
    return response.data;
  },
};
