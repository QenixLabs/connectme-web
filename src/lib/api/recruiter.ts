import { apiClient } from './client';

export const recruiterApi = {
  getMyProfile: async (): Promise<{
    _id: string;
    user_id: string;
    company_name: string;
    company_website?: string;
    company_email_domain: string;
    linkedin_company_url?: string;
    company_size?: string;
    industry?: string;
    position?: string;
    verification_status: string;
    subscription_tier: string;
    created_at: string;
    updated_at: string;
  }> => {
    const response = await apiClient.get('/recruiters/me');
    return response.data;
  },

  updateProfile: async (payload: {
    company_name?: string;
    company_website?: string;
    linkedin_company_url?: string;
    company_size?: string;
    industry?: string;
    position?: string;
  }): Promise<{
    _id: string;
    company_name: string;
    company_website?: string;
    linkedin_company_url?: string;
    company_size?: string;
    industry?: string;
    position?: string;
  }> => {
    const response = await apiClient.patch('/recruiters/me', payload);
    return response.data;
  },
};
