import { apiClient } from './client';
import type {
  CreateTalentProfileInput,
  TalentProfile,
  UpdateTalentProfileInput,
  PortfolioItem,
} from '@/lib/validations/talent-profile.schema';
import { AxiosError } from 'axios';

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

  getAllTalent: async (params?: {
    profession?: string;
    location_city?: string;
    availability?: string;
    gender?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{
    data: Array<{
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
      is_verified?: boolean;
    }>;
    nextCursor: string | null;
  }> => {
    const response = await apiClient.get('/talent/all', { params });
    return response.data;
  },

  getDistinctProfessions: async (search?: string): Promise<string[]> => {
    const response = await apiClient.get('/talent/professions', {
      params: search ? { q: search } : undefined,
    });
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
