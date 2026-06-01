import { apiClient } from './client';

export interface DashboardStats {
  total_artists: number;
  total_brands: number;
  total_admins: number;
  pending_verifications: number;
  active_campaigns: number;
}

export interface PendingVerificationItem {
  _id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: string;
  username?: string;
  profile_photo?: string;
  type: string;
  status: string;
  submitted_docs: { type: string; url: string }[];
  docs: { type: string; download_url: string; expires: number }[];
  created_at: string;
}

export interface ReportItem {
  _id: string;
  reporter_id: {
    _id: string;
    email: string;
    full_legal_name?: string;
    username?: string;
    company_name?: string;
    role?: string;
  };
  reported_id: {
    _id: string;
    email: string;
    full_legal_name?: string;
    username?: string;
    company_name?: string;
    role?: string;
  };
  reason: string;
  details?: string;
  status: string;
  conversation_id?: string;
  created_at: string;
}

export interface PaginatedReports {
  reports: ReportItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/dashboard-stats');
    return response.data;
  },

  getPendingVerifications: async (): Promise<PendingVerificationItem[]> => {
    const response = await apiClient.get('/admin/verifications/pending');
    return response.data;
  },

  approveVerification: async (id: string, reviewNotes?: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/verifications/${id}/approve`, { review_notes: reviewNotes });
    return response.data;
  },

  rejectVerification: async (id: string, reviewNotes: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/verifications/${id}/reject`, { review_notes: reviewNotes });
    return response.data;
  },

  getUsers: async (page = 1, limit = 20, role?: string): Promise<{ users: unknown[]; total: number; page: number; limit: number; total_pages: number }> => {
    const response = await apiClient.get('/admin/users', { params: { page, limit, role } });
    return response.data;
  },

  getReports: async (page = 1, limit = 20, status?: string): Promise<PaginatedReports> => {
    const response = await apiClient.get('/admin/reports', { params: { page, limit, status } });
    return response.data;
  },

  updateReportStatus: async (id: string, status: string): Promise<ReportItem> => {
    const response = await apiClient.patch(`/admin/reports/${id}/status`, { status });
    return response.data;
  },
};
