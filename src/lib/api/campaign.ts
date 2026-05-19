import { apiClient } from './client';

export interface Campaign {
  _id: string;
  recruiter_id: string;
  name: string;
  description?: string;
  role_type?: string;
  industry?: string;
  location?: { city?: string; state?: string };
  dates?: { start?: string; end?: string };
  budget_range?: { min?: number; max?: number; currency?: string };
  requirements?: {
    skills?: string[];
    languages?: string[];
    gender?: string;
    age_range?: { min?: number; max?: number };
  };
  visibility: string;
  deadline?: string;
  status: string;
  applications_count: number;
  created_at: string;
}

export const campaignApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    industry?: string;
    role_type?: string;
    gender?: string;
    location_city?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ data: Campaign[]; nextCursor: string | null }> => {
    const response = await apiClient.get('/campaigns', { params });
    return response.data;
  },

  apply: async (
    campaignId: string,
    payload: { message?: string },
  ): Promise<{ _id: string; status: string }> => {
    const response = await apiClient.post(`/campaigns/${campaignId}/apply`, payload);
    return response.data;
  },

  create: async (payload: {
    name: string;
    description?: string;
    role_type?: string;
    industry?: string;
    location?: { city?: string; state?: string };
    dates?: { start?: string; end?: string };
    budget_range?: { min?: number; max?: number; currency?: string };
    requirements?: {
      skills?: string[];
      languages?: string[];
      gender?: string;
      age_range?: { min?: number; max?: number };
      attributes?: string;
    };
    visibility: string;
    deadline?: string;
    status: string;
  }): Promise<Campaign> => {
    const response = await apiClient.post('/campaigns', payload);
    return response.data;
  },

  getById: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    payload: Partial<
      Omit<Campaign, '_id' | 'recruiter_id' | 'applications_count' | 'created_at'>
    >,
  ): Promise<Campaign> => {
    const response = await apiClient.patch(`/campaigns/${id}`, payload);
    return response.data;
  },

  getApplications: async (
    campaignId: string,
  ): Promise<
    Array<{
      _id: string;
      campaign_id: string;
      talent_id: { _id: string; email: string } | string;
      message?: string;
      status: string;
      created_at: string;
    }>
  > => {
    const response = await apiClient.get(`/campaigns/${campaignId}/applications`);
    return response.data;
  },

  updateApplicationStatus: async (
    campaignId: string,
    applicationId: string,
    status: string,
  ): Promise<{ _id: string; status: string }> => {
    const response = await apiClient.patch(
      `/campaigns/${campaignId}/applications/${applicationId}`,
      { status },
    );
    return response.data;
  },
};
