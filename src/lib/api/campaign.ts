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
      talent_id: { _id: string; email: string; full_legal_name?: string; username?: string } | string;
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

  invite: async (
    campaignId: string,
    payload: { talent_id: string; message?: string },
  ): Promise<{ _id: string; status: string }> => {
    const response = await apiClient.post(`/campaigns/${campaignId}/invite`, payload);
    return response.data;
  },

  getInvites: async (campaignId: string): Promise<
    Array<{
      _id: string;
      campaign_id: string;
      talent_id: { _id: string; email: string; full_legal_name?: string; username?: string; professions?: string[] } | string;
      status: string;
      created_at: string;
    }>
  > => {
    const response = await apiClient.get(`/campaigns/${campaignId}/invites`);
    return response.data;
  },

  getAnalytics: async (campaignId: string): Promise<{
    applications_over_time: Array<{ date: string; count: number }>;
    status_breakdown: { pending: number; accepted: number; rejected: number };
    total_applications: number;
    total_invites: number;
    accepted_invites: number;
    declined_invites: number;
    response_rate: number;
  }> => {
    const response = await apiClient.get(`/campaigns/${campaignId}/analytics`);
    return response.data;
  },

  getDemographics: async (campaignId: string): Promise<{
    gender: Record<string, number>;
    professions: Array<{ name: string; count: number }>;
    locations: Array<{ city: string; count: number }>;
  }> => {
    const response = await apiClient.get(`/campaigns/${campaignId}/analytics/demographics`);
    return response.data;
  },

  exportCsv: async (campaignId: string, campaignName: string): Promise<void> => {
    const response = await apiClient.get(`/campaigns/${campaignId}/export`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = campaignName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.download = `${safeName}-applicants-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  acceptInvite: async (inviteId: string): Promise<{ _id: string; status: string }> => {
    const response = await apiClient.patch(`/campaigns/invites/${inviteId}/accept`);
    return response.data;
  },

  declineInvite: async (inviteId: string): Promise<{ _id: string; status: string }> => {
    const response = await apiClient.patch(`/campaigns/invites/${inviteId}/decline`);
    return response.data;
  },

  getDashboardStats: async (): Promise<{
    active_campaigns: number;
    total_applications_this_week: number;
    response_rate: number;
    pending_reviews: number;
  }> => {
    const response = await apiClient.get('/campaigns/dashboard/stats');
    return response.data;
  },

  getTalentView: async (campaignId: string): Promise<
    Campaign & {
      my_invite: { _id: string; status: string; message?: string; created_at: string } | null;
      my_application: { _id: string; status: string; message?: string; created_at: string } | null;
    }
  > => {
    const response = await apiClient.get(`/campaigns/${campaignId}/talent-view`);
    return response.data;
  },
};
