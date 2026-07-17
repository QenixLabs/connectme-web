import { apiClient } from './client';

export interface ConversationParticipant {
  _id: string;
  email: string;
  role?: string;
  full_legal_name?: string;
  username?: string;
  company_name?: string;
  profile_photo?: string;
}

export interface Conversation {
  _id: string;
  participant_ids: (string | ConversationParticipant)[];
  last_message_preview?: string;
  last_message_sender_id?: string;
  last_message_at?: string;
  unread_counts: Record<string, number>;
  first_message: boolean;
  created_at: string;
}

export interface Message {
  _id: string;
  conversation_id: string;
  sender_id: {
    _id: string;
    email: string;
    role?: string;
    full_legal_name?: string;
    username?: string;
    company_name?: string;
    profile_photo?: string;
  };
  content: string;
  message_type: string;
  status: string;
  read_by: string[];
  created_at: string;
}

export interface CollaborationRequest {
  _id: string;
  requester_id: {
    _id: string;
    email: string;
    role?: string;
    full_legal_name?: string;
    username?: string;
    company_name?: string;
    company_website?: string;
    company_size?: string;
    position?: string;
    profile_photo?: string;
    verification_status?: string;
  };
  receiver_id: string;
  status: 'pending' | 'messaging_only' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
}

export interface CreateRequestResponse {
  request: CollaborationRequest;
  wasAccepted: boolean;
  conversationId?: string;
}

export interface PaginatedConversations {
  data: Conversation[];
  nextCursor: string | null;
}

export const messagesApi = {
  getConversations: async (cursor?: string, limit = 20): Promise<PaginatedConversations> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', String(limit));
    const response = await apiClient.get(`/conversations?${params}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/conversations/unread-count');
    return response.data;
  },

  getMessages: async (
    conversationId: string,
    before?: string,
    limit = 20,
  ): Promise<Message[]> => {
    const params = new URLSearchParams();
    if (before) params.append('before', before);
    params.append('limit', String(limit));
    const response = await apiClient.get(`/conversations/${conversationId}/messages?${params}`);
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    clientMessageId: string,
  ): Promise<Message> => {
    const response = await apiClient.post('/messages', {
      conversation_id: conversationId,
      content,
      client_message_id: clientMessageId,
    });
    return response.data;
  },

  markAsRead: async (conversationId: string, messageId: string): Promise<void> => {
    await apiClient.patch(`/conversations/${conversationId}/read/${messageId}`);
  },

  markAllAsRead: async (conversationId: string): Promise<{ message_ids: string[] }> => {
    const response = await apiClient.post(`/conversations/${conversationId}/mark-all-read`);
    return response.data;
  },

  getConversation: async (conversationId: string): Promise<Conversation> => {
    const response = await apiClient.get(`/conversations/${conversationId}`);
    return response.data;
  },

  startDirectConversation: async (receiverId: string): Promise<{ conversation: Conversation }> => {
    const response = await apiClient.post(`/connections/direct/${receiverId}`);
    return response.data;
  },

  sendFirstMessage: async (
    receiverId: string,
    content: string,
    clientMessageId: string,
  ): Promise<Message> => {
    const response = await apiClient.post('/messages/first', {
      receiver_id: receiverId,
      content,
      client_message_id: clientMessageId,
    });
    return response.data;
  },

  blockUser: async (blockedId: string): Promise<void> => {
    await apiClient.post('/blocks', { blocked_id: blockedId });
  },

  unblockUser: async (blockedId: string): Promise<void> => {
    await apiClient.delete(`/blocks/${blockedId}`);
  },

  checkBlocked: async (userId: string): Promise<{ isBlocked: boolean; blockedByMe: boolean }> => {
    const response = await apiClient.get(`/blocks/check/${userId}`);
    return response.data;
  },

  getBlockedUsers: async (): Promise<{ _id: string; blocked_id: { _id: string; email: string; full_legal_name?: string; username?: string; company_name?: string; role?: string }; created_at: string }[]> => {
    const response = await apiClient.get('/blocks');
    return response.data;
  },

  reportUser: async (payload: {
    reported_id: string;
    reason: string;
    details?: string;
    conversation_id?: string;
  }): Promise<void> => {
    await apiClient.post('/reports', payload);
  },
};

export const collaborationRequestsApi = {
  createRequest: async (receiverId: string, reason: string, message?: string): Promise<CreateRequestResponse> => {
    const response = await apiClient.post('/collaboration-requests', { receiver_id: receiverId, reason, message });
    return response.data;
  },

  getMyRequests: async (): Promise<{ sent: CollaborationRequest[]; received: CollaborationRequest[] }> => {
    const response = await apiClient.get('/collaboration-requests');
    return response.data;
  },

  acceptRequest: async (requestId: string): Promise<{ request: CollaborationRequest; conversation: Conversation }> => {
    const response = await apiClient.patch(`/collaboration-requests/${requestId}/accept`);
    return response.data;
  },

  rejectRequest: async (requestId: string): Promise<CollaborationRequest> => {
    const response = await apiClient.patch(`/collaboration-requests/${requestId}/reject`);
    return response.data;
  },
};
