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

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface DashboardActivity {
  days: number;
  signups: TimeSeriesPoint[];
  reports_created: TimeSeriesPoint[];
  reports_resolved: TimeSeriesPoint[];
  campaigns_created: TimeSeriesPoint[];
  verifications_submitted: TimeSeriesPoint[];
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

export interface AdminUserSubscription {
  plan_key: string;
  plan_display_name: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface AdminUserSubscriptionDetail {
  subscription: {
    _id: string;
    user_id: string;
    plan_key: string;
    status: string;
    razorpay_subscription_id?: string | null;
    current_period_start?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end: boolean;
    cancellation_reason?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null;
  plan: {
    _id: string;
    key: string;
    display_name: string;
    description: string;
    price: number;
    interval: string;
  } | null;
}

export interface AdminUserInvoice {
  _id: string;
  razorpay_invoice_id: string;
  amount: number;
  currency: string;
  status: string;
  period_start?: string | null;
  period_end?: string | null;
  created_at?: string;
}

export interface PaginatedAdminUserInvoices {
  data: AdminUserInvoice[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
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
  subscription: AdminUserSubscription | null;
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  professions?: string[];
  skills?: { name: string; proficiency: string; order: number }[];
  availability?: string;
  languages?: { name: string; fluency: string }[];
  accents?: string[];
  gender?: string;
  analytics?: {
    profile_views_7d: number;
    profile_views_30d: number;
    shortlist_count: number;
  };
  company_name?: string;
  company_size?: string;
  specialties?: string[];
  verification_status?: string;
  message_quota?: { used: number; limit: number };
  campaign_quota?: { used: number; limit: number };
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
  profile: {
    username?: string;
    professions?: string[];
    headline?: string;
    location?: { city?: string; country?: string };
    privacy_mode?: string;
    company_name?: string;
    company_website?: string;
    specialties?: string[];
    position?: string;
    verification_status?: string;
  } | null;
  report_count: number;
  verification: Record<string, unknown> | null;
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
  recent_campaigns: Array<{ _id: string; name: string; status: string }>;
  recent_moderation_actions: Array<{ _id: string; action_type: string; created_at: string; reason?: string; admin_id?: { email?: string } }>;
  recent_reports: Array<{ _id: string; reason: string; status: string; reporter_id?: { email?: string }; created_at: string }>;
}

export interface PaginatedModerationActions {
  actions: Array<{ _id: string; action_type: string; reason: string; duration?: number; admin_id?: { email?: string }; created_at: string }>;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AppealItem {
  _id: string;
  user_id: { _id: string; email: string; role: string; status: string };
  moderation_action_id?: string;
  type: string;
  reason: string;
  status: string;
  admin_response?: string;
  reviewed_by?: { _id: string; email: string };
  reviewed_at?: string;
  created_at: string;
}

export interface AuditLogItem {
  _id: string;
  actor_id?: string;
  actor_type: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SubscriptionItem {
  _id: string;
  user_id: string;
  plan_key: string;
  plan_family_key?: string;
  status: string;
  razorpay_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at?: string;
  user?: {
    _id: string;
    email: string;
    role: string;
    display_name: string;
  };
}

export interface PaginatedSubscriptions {
  data: SubscriptionItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateMigrationInput {
  subscription_id: string;
  to_plan_key: string;
  effective_at: string;
  reason: string;
}

export interface SubscriptionAnalytics {
  active_subscriptions: number;
  counts_by_status: Record<string, number>;
  counts_by_plan: Array<{ plan_key: string; display_name: string; count: number }>;
  mrr_paise: number;
  mrr_inr: number;
  total_revenue_paise: number;
  total_revenue_inr: number;
  recent_subscriptions: Array<{ date: string; count: number }>;
  recent_cancellations: Array<{ date: string; count: number }>;
  recent_scheduled_cancellations: Array<{ date: string; count: number }>;
  cancellation_reasons: Array<{ reason: string; count: number }>;
}

export interface PaginatedAppeals {
  appeals: AppealItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PendingPortfolioItem {
  portfolio_id: string;
  user_id: string;
  item_id: string;
  type: string;
  category: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  ai_moderation_status: string;
  view_count: number;
  created_at: string;
  user_email: string;
  user_name: string;
  user_role: string;
  username?: string;
  profile_photo?: string;
}

export interface PortfolioItem {
  id: string;
  type: string;
  category: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  is_pinned: boolean;
  embed_url?: string;
  ai_moderation_status: string;
  moderation_notes?: string;
  view_count: number;
  created_at: string;
}

export interface PortfolioTalent {
  portfolio_id: string;
  user_id: string;
  items: PortfolioItem[];
  created_at: string;
  updated_at: string;
  user_email: string;
  user_name: string;
  user_role: string;
  user_status: string;
  username?: string;
  profile_photo?: string;
}

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/dashboard-stats');
    return response.data;
  },

  getDashboardActivity: async (days = 7): Promise<DashboardActivity> => {
    const response = await apiClient.get('/admin/dashboard-stats/activity', {
      params: { days },
    });
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
    verification_tier?: number;
    is_email_verified?: boolean;
    is_phone_verified?: boolean;
    auth_provider?: string;
    trust_score_min?: number;
    trust_score_max?: number;
    report_count_min?: number;
    report_count_max?: number;
    sort_by?: string;
    sort_order?: string;
    city?: string;
    state?: string;
    country?: string;
    availability?: string;
    profession?: string;
    skill?: string;
    language?: string;
    gender?: string;
    recruiter_verification_status?: string;
    company_size?: string;
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

  updateVerificationTier: async (id: string, reason: string, tier: number): Promise<unknown> => {
    const response = await apiClient.post(`/admin/users/${id}/verification-tier`, { reason, tier: tier.toString() });
    return response.data;
  },

  markUserSafe: async (id: string, reason?: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/users/${id}/mark-safe`, { reason });
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

  getUserModerationActions: async (id: string, params: { page?: number; limit?: number }): Promise<PaginatedModerationActions> => {
    const response = await apiClient.get(`/admin/users/${id}/moderation-actions`, { params });
    return response.data;
  },

  getAppeals: async (params: { status?: string; page?: number; limit?: number }): Promise<PaginatedAppeals> => {
    const response = await apiClient.get('/appeals', { params });
    return response.data;
  },

  updateAppealStatus: async (id: string, status: string, adminResponse?: string): Promise<AppealItem> => {
    const response = await apiClient.patch(`/appeals/${id}/status`, { status, admin_response: adminResponse });
    return response.data;
  },

  getAuditLogs: async (params: {
    page?: number;
    limit?: number;
    action?: string;
    actor_type?: string;
    target_type?: string;
    target_id?: string;
    actor_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PaginatedAuditLogs> => {
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
  },

  updateUserPassword: async (id: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/admin/users/${id}/password`, { password });
    return response.data;
  },

  getSubscriptionAnalytics: async (): Promise<SubscriptionAnalytics> => {
    const response = await apiClient.get('/admin/subscriptions/analytics');
    return response.data;
  },

  getUserSubscription: async (id: string): Promise<AdminUserSubscriptionDetail> => {
    const response = await apiClient.get(`/admin/subscriptions/${id}`);
    return response.data;
  },

  getUserInvoices: async (id: string, params?: { page?: number; limit?: number }): Promise<PaginatedAdminUserInvoices> => {
    const response = await apiClient.get(`/admin/subscriptions/${id}/invoices`, { params });
    return response.data;
  },

  getSubscriptions: async (params?: { page?: number; limit?: number; status?: string; plan_key?: string; plan_family_key?: string }): Promise<PaginatedSubscriptions> => {
    const response = await apiClient.get('/admin/subscriptions', { params });
    return response.data;
  },

  createMigration: async (payload: CreateMigrationInput): Promise<{ message: string; data: { _id: string } }> => {
    const response = await apiClient.post('/admin/subscriptions/migrations', payload);
    return response.data;
  },

  getActiveSubscriptionCount: async (planKey: string): Promise<{ count: number }> => {
    const response = await apiClient.get('/admin/subscriptions/count-by-plan', { params: { plan_key: planKey } });
    return response.data;
  },

  bulkCreateMigrations: async (payload: { from_plan_key: string; to_plan_key: string; effective_at: string; reason: string }): Promise<{ message: string; data: { count: number } }> => {
    const response = await apiClient.post('/admin/subscriptions/bulk-migrate', payload);
    return response.data;
  },

  getAllPortfoliosByTalent: async (): Promise<PortfolioTalent[]> => {
    const response = await apiClient.get('/admin/portfolio/talents');
    return response.data;
  },

  getPendingPortfolioItems: async (): Promise<PendingPortfolioItem[]> => {
    const response = await apiClient.get('/admin/portfolio/items');
    return response.data;
  },

  approvePortfolioItem: async (userId: string, itemId: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/portfolio/${userId}/items/${itemId}/approve`);
    return response.data;
  },

  rejectPortfolioItem: async (userId: string, itemId: string, reason: string): Promise<unknown> => {
    const response = await apiClient.post(`/admin/portfolio/${userId}/items/${itemId}/reject`, { reason });
    return response.data;
  },
};
