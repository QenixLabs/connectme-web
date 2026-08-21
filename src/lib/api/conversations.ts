import { apiClient } from "./client";
import type {
  Conversation,
  Message,
  SendMessagePayload,
  SendFirstMessagePayload,
} from "./types";

export const conversationsApi = {
  getUnreadCount: async () => {
    const response = await apiClient.get("/conversations/unread-count");
    return response.data as { count: number };
  },

  getConversations: async (params?: { cursor?: string; limit?: number }) => {
    const response = await apiClient.get("/conversations", { params });
    const body = response.data as { data: Conversation[]; nextCursor: string | null };
    return body.data;
  },

  getConversation: async (id: string) => {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data as Conversation;
  },

  getMessages: async (
    conversationId: string,
    params?: { before?: string; limit?: number },
  ) => {
    const response = await apiClient.get(
      `/conversations/${conversationId}/messages`,
      { params },
    );
    return response.data as Message[];
  },

  sendMessage: async (payload: SendMessagePayload) => {
    const response = await apiClient.post("/messages", payload);
    return response.data as Message;
  },

  sendFirstMessage: async (payload: SendFirstMessagePayload) => {
    const response = await apiClient.post("/messages/first", payload);
    return response.data as Message;
  },

  markAsRead: async (conversationId: string, messageId: string) => {
    const response = await apiClient.patch(
      `/conversations/${conversationId}/read/${messageId}`,
    );
    return response.data;
  },

  markAllRead: async (conversationId: string) => {
    const response = await apiClient.post(
      `/conversations/${conversationId}/mark-all-read`,
    );
    return response.data;
  },

  startByUsername: async (username: string) => {
    const response = await apiClient.post('/conversations/start-by-username', { username });
    return response.data as { conversation_id: string };
  },
};
