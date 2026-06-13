import { apiClient } from './client';

export interface PlanConfig {
  key: string;
  display_name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  is_active: boolean;
  message_quota_limit?: number | null;
  campaign_quota_limit?: number | null;
  max_images?: number | null;
  max_videos?: number | null;
  subscription_tier?: string | null;
  sort_order?: number;
}

export interface UpdatePlanInput {
  display_name?: string;
  description?: string;
  price?: number;
  features?: string[];
  is_active?: boolean;
  interval?: string;
  message_quota_limit?: number;
  campaign_quota_limit?: number;
  max_images?: number;
  max_videos?: number;
  subscription_tier?: string;
  sort_order?: number;
}

export interface CreatePlanInput {
  key: string;
  display_name: string;
  description: string;
  price: number;
  interval: string;
  features?: string[];
  is_active?: boolean;
  message_quota_limit?: number;
  campaign_quota_limit?: number;
  max_images?: number;
  max_videos?: number;
  subscription_tier?: string;
  sort_order?: number;
}

export const plansApi = {
  getPlans: async (): Promise<PlanConfig[]> => {
    const response = await apiClient.get('/plans');
    return response.data;
  },

  getAdminPlans: async (): Promise<PlanConfig[]> => {
    const response = await apiClient.get('/admin/plans');
    return response.data;
  },

  getAdminPlanByKey: async (key: string): Promise<PlanConfig> => {
    const response = await apiClient.get(`/admin/plans/${key}`);
    return response.data;
  },

  updatePlan: async (key: string, payload: UpdatePlanInput): Promise<PlanConfig> => {
    const response = await apiClient.patch(`/admin/plans/${key}`, payload);
    return response.data;
  },

  createPlan: async (payload: CreatePlanInput): Promise<PlanConfig> => {
    const response = await apiClient.post('/admin/plans', payload);
    return response.data;
  },

  deletePlan: async (key: string): Promise<{ message: string; data: { key: string } }> => {
    const response = await apiClient.delete(`/admin/plans/${key}`);
    return response.data;
  },
};
