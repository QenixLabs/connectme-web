import { apiClient } from './client';

export interface DashboardStats {
  total_artists: number;
  total_brands: number;
  total_admins: number;
  total_providers: number;
  active_talents_30d: number;
  active_recruiters_30d: number;
  active_providers_30d: number;
  total_campaigns: number;
  total_applications: number;
  accepted_applications: number;
  pending_applications: number;
  profile_views_7d: number;
  profile_views_30d: number;
  pending_verifications: number;
  verified_verifications: number;
  rejected_verifications: number;
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
  recruiter_campaigns_created: TimeSeriesPoint[];
  applications_submitted: TimeSeriesPoint[];
  verifications_submitted: TimeSeriesPoint[];
  verifications_approved: TimeSeriesPoint[];
  verifications_rejected: TimeSeriesPoint[];
}

export interface VerificationCounts {
  total: number;
  verified: number;
  unverified: number;
  manual_review: number;
  pending: number;
  rejected: number;
  not_started: number;
  email_verified: number;
  phone_verified: number;
}

export interface VerificationOverviewUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  username?: string;
  role: string;
  status: string;
  verification_tier: number;
  is_verified: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  document_status: string;
  document_count: number;
  created_at?: string;
  verification: {
    _id: string;
    type: string;
    status: string;
    review_notes?: string;
    reviewed_by?: string;
    created_at?: string;
    updated_at?: string;
    docs: { type: string; download_url: string; expires: number }[];
  } | null;
}

export interface VerificationOverviewQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  verification?: string;
  document_status?: string;
  tier?: number;
}

export interface VerificationOverview {
  summary: VerificationCounts;
  by_role: (VerificationCounts & { role: string })[];
  users: VerificationOverviewUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
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
    slug?: string;
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

export interface AdminSubscriptionRecord {
    _id: string;
    user_id: string;
    plan_key: string;
    status: string;
    razorpay_subscription_id?: string | null;
    current_period_start?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end: boolean;
    cancellation_reason?: string | null;
    cancelled_at?: string | null;
    created_at?: string;
    updated_at?: string;
    expires_at?: string | null;
    grace_period_ends_at?: string | null;
    scheduled_cancellation_at?: string | null;
    scheduled_plan_key?: string | null;
    scheduled_change_at?: string | null;
    plan_display_name: string;
    access_status: string;
    billing_cycle: string;
    billing_cycle_inferred: boolean;
}

export type SubscriptionOverrideAction = "grant" | "upgrade" | "downgrade" | "extend" | "revoke";

export interface SubscriptionOverrideInput {
  action: SubscriptionOverrideAction;
  plan_key?: string;
  reason: string;
  ends_at: string;
  expected_revision: string;
  billing_acknowledged: boolean;
}

export interface AdminSubscriptionOverride {
  _id: string;
  action: SubscriptionOverrideAction;
  plan_key: string;
  reason: string;
  starts_at: string;
  ends_at: string;
  superseded_at: string | null;
  created_at: string;
  admin_id: { _id: string; email: string } | string | null;
  before: { effective?: { plan_display_name?: string; plan_key?: string | null } };
  billing_consequences: string;
}

export interface AdminUserSubscriptionDetail {
  subscription: AdminSubscriptionRecord | null;
  subscription_history?: AdminSubscriptionRecord[];
  paid_subscription: AdminSubscriptionRecord | null;
  plan: { key: string; display_name: string } | null;
  effective: {
    plan_key: string | null;
    plan_display_name: string;
    status: string;
    source: "free" | "paid" | "admin_granted" | "admin_revoked" | "unbilled";
    expires_at: string | null;
  };
  active_override: AdminSubscriptionOverride | null;
  history: AdminSubscriptionOverride[];
  usage: Array<{ key: string; label: string; used: number; limit: number }>;
  available_plans: Array<{ key: string; display_name: string; monthly_price: number }>;
  can_override: boolean;
  revision: string;
  as_of: string;
  expiry_policy: string;
  billing_consequences: string;
}

export interface AdminUpgradeCandidate {
  _id: string;
  email: string;
  role: "talent" | "recruiter" | "provider";
  display_name: string;
  trust_score: number;
  last_active_at: string;
  activity_score: number;
  selection_weight: number;
}

export interface AdminUpgradeCandidatePage {
  candidates: AdminUpgradeCandidate[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  scoring: string;
}

export interface SubscriptionOfferInput {
  plan_key: string;
  duration_days: number;
  reason: string;
  expected_revision: string;
  billing_acknowledged: boolean;
}

export interface AdminUserInvoice {
  _id: string;
  razorpay_invoice_id: string;
  razorpay_payment_id?: string;
  invoice_number?: string | null;
  amount: number;
  amount_paid?: number | null;
  currency: string;
  status: string;
  period_start?: string | null;
  period_end?: string | null;
  paid_at?: string | null;
  pdf_url?: string | null;
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
  business_name?: string;
  provider_type?: string;
  categories?: string[];
  accepting_inquiries?: boolean;
  onboarding_completed?: boolean;
}

export interface AdminUserOverview {
  total: number;
  active: number;
  recently_active: number;
  verified: number;
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
    slug?: string;
    professions?: string[];
    headline?: string;
    about?: string;
    location?: { city?: string; country?: string };
    privacy_mode?: string;
    company_name?: string;
    company_website?: string;
    contact_name?: string;
    company_size?: string;
    industry?: string;
    industries?: string[];
    founded_year?: number;
    years_in_business?: string;
    languages?: string[];
    casting_categories?: string[];
    display_name?: string;
    business_name?: string;
    provider_type?: string;
    tagline?: string;
    categories?: string[];
    service_areas?: string[];
    skills?: string[];
    accepting_inquiries?: boolean;
    onboarding_completed?: boolean;
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
  scheduled_cancellation_at?: string | null;
  cancel_at_period_end?: boolean;
  cancellation_reason?: string | null;
  expires_at?: string | null;
  grace_period_ends_at?: string | null;
  billing_cycle?: string;
  payment_status?: string;
  plan_display_name?: string;
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
  total_pages: number;
}

export interface AdminSubscriptionAccessGrant {
  _id: string;
  user_id: string;
  user: { _id: string; email: string; role: string };
  action: string;
  plan_key: string;
  plan_display_name: string;
  starts_at: string;
  ends_at: string;
  reason: string;
}

export interface PaginatedAdminSubscriptionAccessGrants {
  data: AdminSubscriptionAccessGrant[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
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
  arr_paise: number;
  at_risk_mrr_paise: number;
  actual_collected_revenue_paise: number;
  churned_paid_users_30d: number;
  trends: Array<{
    date: string;
    new_paid_subscriptions: number;
    cancellations: number;
    actual_collected_revenue_paise: number;
  }>;
  user_counts: {
    total_users: number;
    paid_customers: number;
    paid_plan_access_users: number;
    active_paid_access_users: number;
    active_paid_billing_users: number;
    free_access_users: number;
    trial_users: number;
    past_due_users: number;
    cancelled_users: number;
    expired_users: number;
    scheduled_cancellation_users: number;
    admin_granted_users: number;
    admin_revoked_users: number;
    unknown_billing_cycle_subscriptions: number;
  };
  paid_vs_free: Array<{ category: "paid_access" | "free_access"; count: number }>;
  effective_plan_distribution: Array<{ plan_key: string; display_name: string; count: number }>;
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

export interface CronJobInfo {
  name: string;
  displayName: string;
  description: string;
  module: string;
  cronExpression: string;
  nextRun: string | null;
  lastRun: string | null;
  isRunning: boolean;
  isActive: boolean;
}

export interface CronJobExecution {
  triggeredAt: string;
  duration_ms: number;
  status: 'success' | 'error';
  error?: string;
}

export interface AdminCoupon {
  _id: string;
  code: string;
  percent_off: number;
  user_id: { _id: string; email: string } | null;
  max_redemptions: number | null;
  redemption_count: number;
  redemptions?: Array<{
    user_id: { _id: string; email: string; username?: string } | string;
    status?: "pending" | "used" | "released";
    claimed_at?: string;
    used_at?: string;
    razorpay_subscription_id?: string;
  }>;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export type TestOtpChannel = 'email' | 'sms';

export interface SendTestOtpPayload {
  channel: TestOtpChannel;
  email?: string;
  phone?: string;
}

export interface SendTestOtpResponse {
  message: string;
  channel: TestOtpChannel;
  destination: string;
  expires_in_seconds: number;
  preview_otp?: string;
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

  getVerificationOverview: async (params: VerificationOverviewQuery): Promise<VerificationOverview> => {
    const response = await apiClient.get('/admin/verifications', { params });
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

  getUserOverview: async (role: "talent" | "provider" | "recruiter"): Promise<AdminUserOverview> => {
    const response = await apiClient.get('/admin/users/overview', { params: { role } });
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

  getCoupons: async (): Promise<AdminCoupon[]> => {
    const response = await apiClient.get('/admin/subscriptions/coupons');
    return response.data;
  },

  createCoupon: async (payload: {
    code: string;
    percent_off: number;
    user_email?: string;
    max_redemptions?: number;
    expires_at?: string;
  }): Promise<{ _id: string; code: string }> => {
    const response = await apiClient.post('/admin/subscriptions/coupons', payload);
    return response.data;
  },

  deactivateCoupon: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/subscriptions/coupons/${id}`);
  },

  getUserSubscription: async (id: string): Promise<AdminUserSubscriptionDetail> => {
    const response = await apiClient.get(`/admin/users/${id}/subscription`);
    return response.data;
  },

  getFreeUpgradeCandidates: async (params: {
    role: AdminUpgradeCandidate["role"];
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<AdminUpgradeCandidatePage> => {
    const response = await apiClient.get("/admin/free-upgrades/candidates", { params });
    return response.data;
  },

  drawFreeUpgradeCandidate: async (
    role: AdminUpgradeCandidate["role"],
    count: number,
  ): Promise<{ candidates: AdminUpgradeCandidate[]; eligible_count: number; scoring: string }> => {
    const response = await apiClient.post("/admin/free-upgrades/draw", { role, count });
    return response.data;
  },

  createSubscriptionOffer: async (
    id: string,
    payload: SubscriptionOfferInput,
  ): Promise<{ notification: { _id: string }; expires_at: string }> => {
    const response = await apiClient.post(`/admin/users/${id}/subscription-offers`, payload);
    return response.data;
  },

  updateUserSubscription: async (id: string, payload: SubscriptionOverrideInput): Promise<AdminUserSubscriptionDetail> => {
    const response = await apiClient.patch(`/admin/users/${id}/subscription`, payload);
    return response.data;
  },

  getUserInvoices: async (id: string, params?: { page?: number; limit?: number }): Promise<PaginatedAdminUserInvoices> => {
    const response = await apiClient.get(`/admin/subscriptions/${id}/invoices`, { params });
    return response.data;
  },

  getSubscriptions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    plan_key?: string;
    plan_family_key?: string;
    role?: string;
    search?: string;
    plan_type?: "paid" | "free";
    payment_status?: "paid" | "pending" | "failed" | "none";
    billing_interval?: "monthly" | "yearly" | "unknown" | "none";
    cancellation_state?: "scheduled" | "not_scheduled";
  }): Promise<PaginatedSubscriptions> => {
    const response = await apiClient.get('/admin/subscriptions', { params });
    return response.data;
  },

  getSubscriptionAccessGrants: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<PaginatedAdminSubscriptionAccessGrants> => {
    const response = await apiClient.get('/admin/subscriptions/access-overrides', { params });
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

  getCronJobs: async (): Promise<CronJobInfo[]> => {
    const response = await apiClient.get('/admin/cron-jobs');
    return response.data;
  },

  triggerCronJob: async (name: string): Promise<{ message: string; duration_ms: number }> => {
    const response = await apiClient.post(`/admin/cron-jobs/${name}/trigger`);
    return response.data;
  },

  getCronJobHistory: async (name: string): Promise<CronJobExecution[]> => {
    const response = await apiClient.get(`/admin/cron-jobs/${name}/history`);
    return response.data;
  },

  sendTestOtp: async (payload: SendTestOtpPayload): Promise<SendTestOtpResponse> => {
    const response = await apiClient.post('/admin/otp/test', payload);
    return response.data;
  },
};
