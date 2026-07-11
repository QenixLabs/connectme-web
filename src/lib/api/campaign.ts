import { apiClient } from './client';

export interface CampaignQuestion {
  _id: string;
  campaign_id: string;
  question_text: string;
  question_type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean';
  options: string[];
  is_required: boolean;
  order: number;
}

export interface Campaign {
  _id: string;
  recruiter_id: string;
  name: string;
  description?: string;
  role_type?: string;
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
  is_budget_disclosed?: boolean;
  is_unpaid?: boolean;
  visibility: string;
  deadline?: string;
  status: string;
  applications_count: number;
  scheduled_publish_at?: string;
  auto_close_on_deadline?: boolean;
  questions?: CampaignQuestion[];
  specialties?: string[];
  cover_image_url?: string;
  created_at: string;
  my_application?: { _id: string; status: string; created_at?: string; answers?: Array<{ question_id: string; question_text: string; answer: string }> } | null;
  is_bookmarked?: boolean;
}

export const campaignApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    role_type?: string;
    gender?: string;
    location_city?: string;
    skills?: string;
    languages?: string;
    applied?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ data: Campaign[]; nextCursor: string | null }> => {
    const response = await apiClient.get('/campaigns', { params });
    return response.data;
  },

  apply: async (
    campaignId: string,
    payload: { message?: string; answers?: Array<{ question_id: string; answer: string }> },
  ): Promise<{ _id: string; status: string }> => {
    const response = await apiClient.post(`/campaigns/${campaignId}/apply`, payload);
    return response.data;
  },

  create: async (payload: {
    name: string;
    description?: string;
    role_type?: string;
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
      answers?: Array<{ question_id: string; question_text: string; answer: string }>;
      is_shortlisted?: boolean;
      note?: { _id: string; note_text?: string; rating?: number } | null;
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

  getAnalytics: async (campaignId: string, range?: { from?: string; to?: string }): Promise<{
    applications_over_time: Array<{ date: string; count: number }>;
    status_breakdown: { pending: number; accepted: number; rejected: number };
    total_applications: number;
    total_invites: number;
    accepted_invites: number;
    declined_invites: number;
    response_rate: number;
  }> => {
    const response = await apiClient.get(`/campaigns/${campaignId}/analytics`, { params: range });
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
    shortlisted_count: number;
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

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },

  publish: async (id: string): Promise<Campaign> => {
    const response = await apiClient.post(`/campaigns/${id}/publish`);
    return response.data;
  },

  close: async (id: string): Promise<Campaign> => {
    const response = await apiClient.post(`/campaigns/${id}/close`);
    return response.data;
  },

  reopen: async (id: string): Promise<Campaign> => {
    const response = await apiClient.post(`/campaigns/${id}/reopen`);
    return response.data;
  },

  clone: async (id: string): Promise<Campaign> => {
    const response = await apiClient.post(`/campaigns/${id}/clone`);
    return response.data;
  },

  bulkInvite: async (
    campaignId: string,
    payload: { talent_ids: string[]; message?: string },
  ): Promise<{ successful: string[]; failed: Array<{ talent_id: string; reason: string }> }> => {
    const response = await apiClient.post(`/campaigns/${campaignId}/bulk-invite`, payload);
    return response.data;
  },

  bulkUpdateApplicationStatus: async (
    campaignId: string,
    applicationIds: string[],
    status: string,
  ): Promise<{ updated: number }> => {
    const response = await apiClient.patch(`/campaigns/${campaignId}/applications/bulk`, {
      application_ids: applicationIds,
      status,
    });
    return response.data;
  },

  withdrawApplication: async (campaignId: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${campaignId}/apply`);
  },

  bookmark: async (campaignId: string): Promise<void> => {
    await apiClient.post(`/campaigns/${campaignId}/bookmark`);
  },

  unbookmark: async (campaignId: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${campaignId}/bookmark`);
  },

  getBookmarks: async (): Promise<Campaign[]> => {
    const response = await apiClient.get('/campaigns/bookmarks');
    return response.data;
  },

  getRecommendations: async (limit?: number): Promise<Campaign[]> => {
    const response = await apiClient.get('/campaigns/recommendations', { params: { limit } });
    return response.data;
  },

  addToShortlist: async (campaignId: string, applicationId: string): Promise<void> => {
    await apiClient.post(`/campaigns/${campaignId}/applications/${applicationId}/shortlist`);
  },

  removeFromShortlist: async (campaignId: string, applicationId: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${campaignId}/applications/${applicationId}/shortlist`);
  },

  upsertApplicantNote: async (
    campaignId: string,
    applicationId: string,
    payload: { note_text?: string; rating?: number },
  ): Promise<{ _id: string; note_text?: string; rating?: number }> => {
    const response = await apiClient.post(`/campaigns/${campaignId}/applications/${applicationId}/notes`, payload);
    return response.data;
  },

  deleteApplicantNote: async (campaignId: string, applicationId: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${campaignId}/applications/${applicationId}/notes`);
  },

  getApplicantDetails: async (
    campaignId: string,
    applicationId: string,
  ): Promise<{ note?: { _id: string; note_text?: string; rating?: number } | null; is_shortlisted: boolean }> => {
    const response = await apiClient.get(`/campaigns/${campaignId}/applications/${applicationId}/details`);
    return response.data;
  },

  uploadMedia: async (
    campaignId: string,
    formData: FormData,
  ): Promise<{ cover_image_url: string }> => {
    const response = await apiClient.post(`/campaigns/${campaignId}/media`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  deleteMedia: async (campaignId: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${campaignId}/media`);
  },

  getTeam: async (campaignId: string): Promise<{
    campaign: Campaign;
    members: Array<{
      _id: string;
      user_id: { _id: string; email: string; full_legal_name?: string; username?: string };
      role: string;
      status: string;
      invited_by: { _id: string; email: string; full_legal_name?: string; username?: string };
    }>;
  }> => {
    const response = await apiClient.get(`/campaigns/${campaignId}/team`);
    return response.data;
  },

  inviteTeamMember: async (campaignId: string, email: string, role: string): Promise<any> => {
    const response = await apiClient.post(`/campaigns/${campaignId}/team/invite`, { email, role });
    return response.data;
  },

  updateTeamMemberRole: async (campaignId: string, memberId: string, role: string): Promise<any> => {
    const response = await apiClient.patch(`/campaigns/${campaignId}/team/${memberId}/role`, { role });
    return response.data;
  },

  removeTeamMember: async (campaignId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${campaignId}/team/${memberId}`);
  },

  getTemplates: async (): Promise<Array<{ _id: string; name: string; template_data: Record<string, unknown>; created_at: string }>> => {
    const response = await apiClient.get('/campaigns/templates');
    return response.data;
  },

  saveTemplate: async (name: string, campaignId: string): Promise<any> => {
    const response = await apiClient.post('/campaigns/templates', { name, campaign_id: campaignId });
    return response.data;
  },

  useTemplate: async (templateId: string): Promise<Campaign> => {
    const response = await apiClient.post(`/campaigns/templates/${templateId}/use`);
    return response.data;
  },
};
