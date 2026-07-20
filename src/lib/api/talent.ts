import { apiClient } from './client';
import type {
  CreateTalentProfileInput,
  TalentProfile,
  UpdateTalentProfileInput,
  PortfolioItem,
} from '@/lib/validations/talent-profile.schema';
import type { MediaKitData } from '@/types/media-kit';
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

  getPublicProfile: async (username: string): Promise<TalentProfile | { private: true; preview?: Partial<TalentProfile> }> => {
    const response = await apiClient.get(`/talent/profile/${username}`);
    return response.data;
  },

  getPublicPortfolio: async (username: string): Promise<{
    profile: Partial<TalentProfile>;
    items: PortfolioItem[];
  } | { private: true; hasConnection?: boolean; preview: Partial<TalentProfile> }> => {
    const response = await apiClient.get(`/talent/portfolio/${username}`);
    return response.data;
  },

  getAllTalent: async (params?: {
    profession?: string;
    location_city?: string;
    availability?: string;
    gender?: string;
    search?: string;
    sort?: string;
    cursor?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    data: Array<{
      _id?: string;
      user_id?: string;
      username?: string;
      full_legal_name?: string;
      headline?: string;
      profile_photo?: string;
      location?: { country?: string; state?: string; city?: string };
      professions?: string[];
      availability?: string;
      privacy_mode?: string;
      is_verified?: boolean;
      match_score?: number;
      matched_campaign?: string;
    }>;
    nextCursor: string | null;
    total: number;
    page?: number;
    hasMore?: boolean;
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

  getRecommendations: async (limit?: number): Promise<
    Array<{
      _id: string;
      user_id: string;
      username: string;
      full_legal_name?: string;
      profile_photo?: string;
      professions?: string[];
      location?: { city?: string; state?: string; country?: string };
      match_score: number;
    }>
  > => {
    const response = await apiClient.get('/talent/recommendations', {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },

  getDashboardRecommendations: async (limit?: number): Promise<{
    has_active_campaigns: boolean;
    campaigns: Array<{ id: string; name: string }>;
    data: Array<{
      _id: string;
      user_id: string;
      username: string;
      full_legal_name?: string;
      profile_photo?: string;
      professions?: string[];
      location?: { city?: string; state?: string; country?: string };
      match_score: number;
      matched_campaign: string;
    }>;
  }> => {
    const response = await apiClient.get('/recommendations/talents/dashboard', {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },

  getTalentRecommendations: async (
    campaignId: string,
    limit = 10,
    excludeIds?: string,
  ): Promise<{
    data: Array<{
      _id: string;
      talent: Record<string, unknown>;
      match_score: number;
      total_score: number;
    }>;
  }> => {
    const response = await apiClient.get('/recommendations/talents', {
      params: { campaign_id: campaignId, limit, exclude_ids: excludeIds },
    });
    return { data: response.data };
  },

  getCampaignRecommendations: async (
    limit = 10,
    minScore = 0,
  ): Promise<{
    data: Array<{
      _id: string;
      campaign: Record<string, unknown>;
      match_score: number;
      total_score: number;
    }>;
  }> => {
    const response = await apiClient.get('/recommendations/campaigns', {
      params: { limit, min_score: minScore },
    });
    return { data: response.data };
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

  getPortfolioStats: async (): Promise<{
    total_items: number;
    items_by_type: { images: number; videos: number };
    items_by_category: Record<string, number>;
    total_views: number;
    profile_views_7d: number;
    profile_views_30d: number;
  }> => {
    const response = await apiClient.get('/talent/portfolio/stats');
    return response.data;
  },

  getPortfolio: async (): Promise<{ items: PortfolioItem[] }> => {
    const response = await apiClient.get('/talent/portfolio');
    return response.data;
  },

  uploadPortfolioImage: async (
    file: File,
    dto: { caption?: string; title?: string; description?: string; category?: 'work' | 'personal' | 'intro'; is_pinned?: boolean },
  ): Promise<{ item: PortfolioItem }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (dto.caption) formData.append('caption', dto.caption);
    if (dto.title) formData.append('title', dto.title);
    if (dto.description) formData.append('description', dto.description);
    if (dto.category) formData.append('category', dto.category);
    if (dto.is_pinned !== undefined) formData.append('is_pinned', String(dto.is_pinned));
    const response = await apiClient.post('/talent/portfolio/upload/image', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  uploadPortfolioVideo: async (
    file: File,
    dto: { caption?: string; title?: string; description?: string; category?: 'work' | 'personal' | 'intro'; is_pinned?: boolean },
  ): Promise<{ item: PortfolioItem }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (dto.caption) formData.append('caption', dto.caption);
    if (dto.title) formData.append('title', dto.title);
    if (dto.description) formData.append('description', dto.description);
    if (dto.category) formData.append('category', dto.category);
    if (dto.is_pinned !== undefined) formData.append('is_pinned', String(dto.is_pinned));
    const response = await apiClient.post('/talent/portfolio/upload/video', formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  updatePortfolioItem: async (
    itemId: string,
    dto: { caption?: string; title?: string; description?: string; category?: 'work' | 'personal' | 'intro'; is_pinned?: boolean },
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

  addPortfolioLink: async (
    url: string,
    dto: { caption?: string; title?: string; description?: string; category?: 'work' | 'personal' | 'intro'; is_pinned?: boolean },
  ): Promise<{ item: PortfolioItem }> => {
    const response = await apiClient.post('/talent/portfolio/link', { url, ...dto });
    return response.data;
  },

  getMediaKit: async (username: string): Promise<MediaKitData | { private: true; preview?: unknown }> => {
    const response = await apiClient.get(`/talent/media-kit/${username}`);
    return response.data;
  },
};
