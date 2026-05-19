import { apiClient } from './client';

export const notificationsApi = {
  getNotifications: async (history?: boolean): Promise<Array<{
    _id: string;
    actor_id: { _id: string; email?: string; full_legal_name?: string; username?: string } | string;
    type: string;
    title: string;
    body: string;
    data: Record<string, any>;
    status: string;
    action_status: string | null;
    is_history: boolean;
    created_at: string;
  }>> => {
    const response = await apiClient.get('/notifications', { params: { history: history ? 'true' : undefined } });
    return response.data;
  },

  getHistory: async (): Promise<Array<{
    _id: string;
    actor_id: { _id: string; email?: string; full_legal_name?: string; username?: string } | string;
    type: string;
    title: string;
    body: string;
    data: Record<string, any>;
    status: string;
    action_status: string | null;
    is_history: boolean;
    created_at: string;
  }>> => {
    const response = await apiClient.get('/notifications', { params: { history: 'true' } });
    return response.data;
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

  dismissAuto: async (): Promise<{ modified: number }> => {
    const response = await apiClient.post('/notifications/dismiss-auto');
    return response.data;
  },
};
