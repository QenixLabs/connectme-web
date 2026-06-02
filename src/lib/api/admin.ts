import { apiClient } from './client';

export interface DashboardStats {
  total_artists: number;
  total_brands: number;
  total_admins: number;
  pending_verifications: number;
  active_campaigns: number;
  pending_reports: number;
  resolved_today: number;
  suspended_users: number;
  high_priority_reports: number;
  avg_resolution_hours: number;
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
  priority: string;
  conversation_id?: string;
  message_id?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  action_taken?: string;
  resolved_at?: string;
  created_at: string;
}

export interface PaginatedReports {
  reports: ReportItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface MessageContextItem {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_photo?: string;
  content: string;
  message_type: string;
  created_at: string;
}

export interface ReportDetail {
  report: ReportItem;
  reportedMessage: MessageContextItem | null;
  previousMessages: MessageContextItem[];
  nextMessages: MessageContextItem[];
}

export interface UserHistory {
  user: {
    _id: string;
    email: string;
    role: string;
    status: string;
    verification_tier: number;
    trust_score: number;
    created_at: string;
  };
  reports_against_user: ReportItem[];
  moderation_actions: Array<{
    _id: string;
    action_type: string;
    reason: string;
    duration?: number;
    admin_id: { _id: string; email: string };
    created_at: string;
  }>;
  warning_count: number;
  suspension_count: number;
  current_status: string;
  verification_tier: number;
}

export interface AdminUser {
  _id: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  auth_provider?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  verification_tier: number;
  trust_score: number;
  display_name: string;
  username?: string;
  profile_photo?: string;
  report_count: number;
  created_at: string;
  last_active_at?: string;
}

export interface PaginatedUsers {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UserDetail {
  user: AdminUser;
  profile: any;
  report_count: number;
  verification: any;
}

export interface AdminNote {
  _id: string;
  user_id: string;
  admin_id: { _id: string; email: string };
  content: string;
  created_at: string;
}

export interface UserActivity {
  user: AdminUser;
  message_count: number;
  recent_campaigns: any[];
  recent_moderation_actions: any[];
  recent_reports: any[];
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

  getUserHistory: async (id: string): Promise<UserHistory> => {
    const response = await apiClient.get(`/admin/users/${id}/history`);
    return response.data;
  },

  getReports: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  }): Promise<PaginatedReports> => {
    const response = await apiClient.get('/admin/reports', { params });
    return response.data;
  },

  updateReportStatus: async (id: string, status: string, adminNotes?: string): Promise<ReportItem> => {
    const response = await apiClient.patch(`/admin/reports/${id}/status`, { status, adminNotes });
    return response.data;
  },

  updateReportNotes: async (id: string, adminNotes: string): Promise<ReportItem> => {
    const response = await apiClient.patch(`/admin/reports/${id}/notes`, { adminNotes });
    return response.data;
  },

  updateReportPriority: async (id: string, priority: string): Promise<ReportItem> => {
    const response = await apiClient.patch(`/admin/reports/${id}/priority`, { priority });
    return response.data;
  },

  takeReportAction: async (id: string, actionType: string, reason: string, duration?: number): Promise<{ report: ReportItem }> => {
    const response = await apiClient.patch(`/admin/reports/${id}/action`, { actionType, reason, duration });
    return response.data;
  },

  getReportById: async (id: string): Promise<ReportDetail> => {
    const response = await apiClient.get(`/admin/reports/${id}`);
    return response.data;
  },

  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    signup_from?: string;
    signup_to?: string;
    last_active_from?: string;
    last_active_to?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PaginatedUsers> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<UserDetail> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id: string, status: string, reason?: string, duration_days?: string): Promise<unknown> => {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status, reason, duration_days });
    return response.data;
  },

  warnUser: async (id: string, reason: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/users/${id}/warn`, { reason });
    return response.data;
  },

  suspendUser: async (id: string, reason: string, duration_days: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/users/${id}/suspend`, { reason, duration_days });
    return response.data;
  },

  banUser: async (id: string, reason: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/users/${id}/ban`, { reason });
    return response.data;
  },

  unrestrictUser: async (id: string, reason?: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/users/${id}/unrestrict`, { reason });
    return response.data;
  },

  getUserNotes: async (id: string): Promise<AdminNote[]> => {
    const response = await apiClient.get(`/admin/users/${id}/notes`);
    return response.data;
  },

  addUserNote: async (id: string, content: string): Promise<AdminNote> => {
    const response = await apiClient.post(`/admin/users/${id}/notes`, { content });
    return response.data;
  },

  getUserActivity: async (id: string): Promise<UserActivity> => {
    const response = await apiClient.get(`/admin/users/${id}/activity`);
    return response.data;
  },
};
