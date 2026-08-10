import { apiClient } from "./client";

export type NotificationType =
  | "verification_status"
  | "system"
  | "campaign_invite"
  | "application_received"
  | "application_status_changed"
  | "moderation_violation"
  | "subscription_status"
  | "subscription_renewal_reminder"
  | "subscription_payment_failed"
  | "subscription_invoice_receipt"
  | "subscription_expired"
  | "subscription_cancelled"
  | "subscription_activated"
  | "plan_migration_scheduled"
  | "plan_migration_request"
  | "campaign_recommendation"
  | "task_assigned"
  | "task_submitted"
  | "task_reviewed";

export type NotificationStatus = "unread" | "read";

export type NotificationActionStatus =
  | "pending"
  | "allowed"
  | "denied"
  | "accepted"
  | "declined";

export type NotificationDismissStrategy = "manual" | "auto";

export interface NotificationActor {
  _id: string;
  email?: string;
  full_legal_name?: string;
  username?: string;
  company_name?: string;
}

export interface Notification {
  _id: string;
  user_id: string;
  actor_id: NotificationActor | null;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  status: NotificationStatus;
  action_status?: NotificationActionStatus | null;
  is_history: boolean;
  dismiss_strategy: NotificationDismissStrategy;
  delivered_at?: string | null;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotifications<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type NotificationSettings = {
  enabled_types: NotificationType[];
  muted_types: NotificationType[];
  email_fallback_types: NotificationType[];
  digest_mode: "immediate" | "daily" | "weekly" | null;
};

export interface QueryNotificationsParams {
  history?: boolean;
  page?: number;
  limit?: number;
  before?: string;
}

export interface UpdateNotificationSettingsDto {
  enabled_types?: NotificationType[];
  muted_types?: NotificationType[];
  email_fallback_types?: NotificationType[];
  digest_mode?: "immediate" | "daily" | "weekly" | null;
}

function normalizePaginated<T>(
  data: unknown,
): PaginatedNotifications<T> | undefined {
  if (!data || typeof data !== "object") return undefined;
  const payload = data as { data?: T[]; total?: number; page?: number; limit?: number; total_pages?: number };
  if (Array.isArray(payload.data)) {
    return {
      data: payload.data,
      total: payload.total ?? payload.data.length,
      page: payload.page ?? 1,
      limit: payload.limit ?? payload.data.length,
      total_pages: payload.total_pages ?? 1,
    };
  }
  return undefined;
}

export const notificationsApi = {
  getNotifications: async (params: QueryNotificationsParams = {}) => {
    const response = await apiClient.get("/notifications", { params });
    const normalized = normalizePaginated<Notification>(response.data);
    if (normalized) return normalized;
    // Fallback in case the endpoint ever returns a raw array.
    const array = Array.isArray(response.data) ? response.data : [];
    return {
      data: array as Notification[],
      total: array.length,
      page: params.page ?? 1,
      limit: params.limit ?? array.length,
      total_pages: 1,
    };
  },

  getUnreadCount: async () => {
    const response = await apiClient.get("/notifications/unread-count");
    return response.data as { count: number };
  },

  markAllAsRead: async () => {
    const response = await apiClient.post("/notifications/mark-all-read");
    return response.data as { modified: number };
  },

  clearHistory: async () => {
    const response = await apiClient.post("/notifications/clear-history");
    return response.data as { modified: number };
  },

  dismissAuto: async () => {
    const response = await apiClient.post("/notifications/dismiss-auto");
    return response.data as { modified: number };
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data as { message: string };
  },

  markAsHistory: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/history`);
    return response.data as { message: string };
  },

  respondToAction: async (id: string, action: "accepted" | "declined") => {
    const response = await apiClient.post(`/notifications/${id}/respond`, { action });
    return response.data as { message: string; data: Notification };
  },

  getSettings: async () => {
    const response = await apiClient.get("/notifications/settings");
    return response.data as { settings: NotificationSettings };
  },

  updateSettings: async (dto: UpdateNotificationSettingsDto) => {
    const response = await apiClient.patch("/notifications/settings", dto);
    return response.data as { message: string };
  },
};

export function notificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    verification_status: "Verification",
    system: "System",
    campaign_invite: "Campaign Invite",
    application_received: "Application",
    application_status_changed: "Application Update",
    moderation_violation: "Moderation",
    subscription_status: "Subscription",
    subscription_renewal_reminder: "Renewal",
    subscription_payment_failed: "Payment",
    subscription_invoice_receipt: "Invoice",
    subscription_expired: "Subscription",
    subscription_cancelled: "Subscription",
    subscription_activated: "Subscription",
    plan_migration_scheduled: "Plan Migration",
    plan_migration_request: "Plan Migration",
    campaign_recommendation: "Recommendation",
    task_assigned: "Task Assigned",
    task_submitted: "Task Submitted",
    task_reviewed: "Task Reviewed",
  };
  return labels[type] ?? "Notification";
}
