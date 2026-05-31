import { apiClient } from './client';

export const messagesApi = {
  getConversations: async (): Promise<Array<{
    _id: string;
    sender_id: { _id: string; email: string } | string;
    receiver_id: string;
    content: string;
    message_type: string;
    status: string;
    is_read: boolean;
    created_at: string;
  }>> => {
    const response = await apiClient.get('/messages');
    return response.data;
  },

  sendMessage: async (receiverId: string, content: string): Promise<{
    _id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type: string;
    status: string;
    is_read: boolean;
    created_at: string;
  }> => {
    const response = await apiClient.post('/messages', { receiver_id: receiverId, content });
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.patch(`/messages/${messageId}/read`);
  },
};
