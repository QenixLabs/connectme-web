import axios, { AxiosError } from 'axios';
import type {
  CreateTalentProfileInput,
  TalentProfile,
  UpdateTalentProfileInput,
  PortfolioItem,
} from '@/lib/validations/talent-profile.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
});

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && data.success === true) {
      response.data = data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const publicEndpoints = ['/talent/profile/'];
      const isPublicEndpoint = publicEndpoints.some((path) =>
        requestUrl.includes(path),
      );
      if (!isPublicEndpoint && typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (data: {
    email: string;
    password: string;
    phone: string;
    role: 'talent' | 'recruiter';
    auth_provider?: string;
    company_name?: string;
    username?: string;
    profession?: string;
    company_website?: string;
    company_size?: string;
    industry?: string;
  }) => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email?: string, phone?: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email, phone });
    return response.data;
  },

  resetPassword: async (email: string | undefined, phone: string | undefined, otp: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { email, phone, otp, new_password: newPassword });
    return response.data;
  },

  sendPhoneOtp: async () => {
    const response = await apiClient.post('/auth/send-phone-otp');
    return response.data;
  },

  verifyPhoneOtp: async (phone: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-phone-otp', { phone, otp });
    return response.data;
  },
};

export const talentApi = {
  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    const response = await apiClient.get('/talent/check-username', { params: { username } });
    return response.data.available;
  },

  getMyProfile: async (): Promise<TalentProfile | null> => {
    try {
      const response = await apiClient.get('/talent/me');
      return response.data as TalentProfile;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) return null;
      throw err;
    }
  },

  getCompleteness: async (): Promise<{ isComplete: boolean; missingFields: string[] }> => {
    const response = await apiClient.get('/talent/completeness');
    return response.data;
  },

  createProfile: async (payload: CreateTalentProfileInput): Promise<TalentProfile> => {
    const response = await apiClient.post('/talent', payload);
    return response.data as TalentProfile;
  },

  updateProfile: async (payload: UpdateTalentProfileInput): Promise<TalentProfile> => {
    const response = await apiClient.patch('/talent', payload);
    return response.data as TalentProfile;
  },

  getPublicProfile: async (username: string): Promise<TalentProfile | { private: true; requestSent?: boolean }> => {
    const response = await apiClient.get(`/talent/profile/${username}`);
    return response.data;
  },

  getPublicPortfolio: async (username: string): Promise<{
    profile: Partial<TalentProfile>;
    items: PortfolioItem[];
  } | { private: true; requestSent?: boolean; preview: Partial<TalentProfile> }> => {
    const response = await apiClient.get(`/talent/portfolio/${username}`);
    return response.data;
  },

  requestAccess: async (username: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/profile-access-request/request', { username });
    return response.data;
  },

  respondToAccessRequest: async (requesterId: string, status: 'allowed' | 'denied'): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/profile-access-request/respond', { requester_id: requesterId, status });
    return response.data;
  },

  getAccessRequests: async (): Promise<Array<{
    _id: string;
    requester_id: { _id: string; email?: string };
    status: string;
    created_at: string;
  }>> => {
    const response = await apiClient.get('/profile-access-request/my-requests');
    return response.data;
  },

  getAllTalent: async (filter?: 'pending' | 'allowed' | 'not_requested' | 'public'): Promise<Array<{
    username?: string;
    full_legal_name?: string;
    headline?: string;
    profile_photo?: string;
    location?: { country?: string; state?: string; city?: string };
    professions?: string[];
    industries?: string[];
    availability?: string;
    privacy_mode?: string;
    access_status?: 'allowed' | 'pending' | 'none';
  }>> => {
    const response = await apiClient.get('/talent/all', { params: filter ? { filter } : undefined });
    return response.data;
  },

  uploadProfilePhoto: async (file: File): Promise<{ relativePath: string; signedUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/talent/upload/profile-photo', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  uploadDocument: async (file: File): Promise<{ relativePath: string; signedUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/talent/upload/document', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  getPortfolio: async (): Promise<{ items: PortfolioItem[] }> => {
    const response = await apiClient.get('/talent/portfolio');
    return response.data;
  },

  uploadPortfolioImage: async (
    file: File,
    dto: { caption?: string; category?: 'work' | 'personal' | 'intro'; is_pinned?: boolean },
  ): Promise<{ item: PortfolioItem }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (dto.caption) formData.append('caption', dto.caption);
    if (dto.category) formData.append('category', dto.category);
    if (dto.is_pinned !== undefined) formData.append('is_pinned', String(dto.is_pinned));
    const response = await apiClient.post('/talent/portfolio/upload/image', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  uploadPortfolioVideo: async (
    file: File,
    dto: { caption?: string; category?: 'work' | 'personal' | 'intro'; is_pinned?: boolean },
  ): Promise<{ item: PortfolioItem }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (dto.caption) formData.append('caption', dto.caption);
    if (dto.category) formData.append('category', dto.category);
    if (dto.is_pinned !== undefined) formData.append('is_pinned', String(dto.is_pinned));
    const response = await apiClient.post('/talent/portfolio/upload/video', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  updatePortfolioItem: async (
    itemId: string,
    dto: { caption?: string; category?: 'work' | 'personal' | 'intro'; is_pinned?: boolean },
  ): Promise<{ item: PortfolioItem }> => {
    const response = await apiClient.patch(`/talent/portfolio/items/${itemId}`, dto);
    return response.data;
  },

  deletePortfolioItem: async (itemId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/talent/portfolio/items/${itemId}`);
    return response.data;
  },

  reorderPortfolioItems: async (itemIds: string[]): Promise<{ items: PortfolioItem[] }> => {
    const response = await apiClient.patch('/talent/portfolio/reorder', { item_ids: itemIds });
    return response.data;
  },
};

export interface VerificationRecord {
  _id: string;
  user_id: string;
  type: string;
  status: string;
  submitted_docs: { type: string; url: string }[];
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocResponse {
  type: string;
  download_url: string;
  expires: number;
}

export interface VerificationStatusResponse {
  verification: VerificationRecord | null;
  docs: VerificationDocResponse[];
}

export const verificationApi = {
  createVerification: async (type: 'talent_id' | 'recruiter_company'): Promise<VerificationRecord> => {
    const response = await apiClient.post('/verifications', { type });
    return response.data;
  },

  addVerificationDoc: async (
    verificationId: string,
    file: File,
    docType: string,
  ): Promise<VerificationRecord> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    const response = await apiClient.post(`/verifications/${verificationId}/docs`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  getVerificationStatus: async (userId: string): Promise<VerificationStatusResponse | null> => {
    try {
      const response = await apiClient.get(`/verifications/user/${userId}`);
      return response.data as VerificationStatusResponse;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) return null;
      throw err;
    }
  },

  removeVerificationDoc: async (verificationId: string, docIndex: number): Promise<VerificationRecord> => {
    const response = await apiClient.delete(`/verifications/${verificationId}/docs/${docIndex}`);
    return response.data;
  },
};

export const recruiterApi = {
  getMyProfile: async (): Promise<{
    _id: string;
    user_id: string;
    company_name: string;
    company_website?: string;
    company_email_domain: string;
    linkedin_company_url?: string;
    company_size?: string;
    industry?: string;
    position?: string;
    verification_status: string;
    subscription_tier: string;
    created_at: string;
    updated_at: string;
  }> => {
    const response = await apiClient.get('/recruiters/me');
    return response.data;
  },

  updateProfile: async (payload: {
    company_name?: string;
    company_website?: string;
    linkedin_company_url?: string;
    company_size?: string;
    industry?: string;
    position?: string;
  }): Promise<{
    _id: string;
    company_name: string;
    company_website?: string;
    linkedin_company_url?: string;
    company_size?: string;
    industry?: string;
    position?: string;
  }> => {
    const response = await apiClient.patch('/recruiters/me', payload);
    return response.data;
  },
};

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
};

export default apiClient;