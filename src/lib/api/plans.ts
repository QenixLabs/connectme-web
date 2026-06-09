import { apiClient } from './client';

export interface PlanConfig {
  _id: string;
  key: string;
  display_name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePlanInput {
  display_name?: string;
  description?: string;
  price?: number;
  features?: string[];
  is_active?: boolean;
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
};
