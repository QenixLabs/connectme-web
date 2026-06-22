import { apiClient } from './client';

export type NotificationItem = {
  _id: string;
  actor_id: { _id: string; email?: string; full_legal_name?: string; username?: string } | string | null;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  status: string;
  action_status: string | null;
  is_history: boolean;
  created_at: string;
};

export type PaginatedNotifications = {
  data: NotificationItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type NotificationSettings = {
  enabled_types: string[];
  muted_types: string[];
  email_fallback_types: string[];
  digest_mode: 'immediate' | 'daily' | 'weekly' | null;
};

export const notificationsApi = {
  getNotifications: async (
    history?: boolean,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedNotifications> => {
    const response = await apiClient.get('/notifications', {
      params: {
        history: history ? 'true' : undefined,
        page: page.toString(),
        limit: limit.toString(),
      },
    });
    return response.data;
  },

  getHistory: async (page: number = 1, limit: number = 20): Promise<PaginatedNotifications> => {
    return notificationsApi.getNotifications(true, page, limit);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAsHistory: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/history`);
  },

  markAllAsRead: async (): Promise<{ modified: number }> => {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },

  clearHistory: async (): Promise<{ modified: number }> => {
    const response = await apiClient.post('/notifications/clear-history');
    return response.data;
  },

  dismissAuto: async (): Promise<{ modified: number }> => {
    const response = await apiClient.post('/notifications/dismiss-auto');
    return response.data;
  },

  getSettings: async (): Promise<NotificationSettings> => {
    const response = await apiClient.get('/notifications/settings');
    return response.data.settings;
  },

  updateSettings: async (settings: Partial<NotificationSettings>): Promise<void> => {
    await apiClient.patch('/notifications/settings', settings);
  },

  respondToAction: async (id: string, action: 'accepted' | 'declined'): Promise<void> => {
    await apiClient.post(`/notifications/${id}/respond`, { action });
  },
};
