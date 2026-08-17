import { apiClient } from "./client";

export interface Plan {
  _id: string;
  key: string;
  display_name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: string[];
  permissions: string[];
  max_images?: number;
  max_videos?: number;
  message_quota_limit?: number;
  campaign_quota_limit?: number;
  is_active?: boolean;
  is_popular?: boolean;
  target_role?: string;
  family_key?: string;
  sort_order?: number;
}

export interface PlanConfig {
  key: string;
  family_key: string;
  version?: number;
  display_name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: string[];
  permissions?: string[];
  is_active: boolean;
  accepts_new_subscriptions?: boolean;
  sunset_at?: string | null;
  effective_from?: string | null;
  message_quota_limit?: number | null;
  campaign_quota_limit?: number | null;
  max_images?: number | null;
  max_videos?: number | null;
  sort_order?: number;
  target_role: "talent" | "recruiter" | "both";
  is_popular?: boolean;
}

export interface UpdatePlanInput {
  display_name?: string;
  description?: string;
  monthly_price?: number;
  yearly_price?: number;
  features?: string[];
  permissions?: string[];
  is_active?: boolean;
  message_quota_limit?: number;
  campaign_quota_limit?: number;
  max_images?: number;
  max_videos?: number;
  sort_order?: number;
  target_role?: "talent" | "recruiter" | "both";
  is_popular?: boolean;
}

export interface CreatePlanInput {
  key: string;
  family_key?: string;
  display_name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features?: string[];
  permissions?: string[];
  is_active?: boolean;
  message_quota_limit?: number;
  campaign_quota_limit?: number;
  max_images?: number;
  max_videos?: number;
  sort_order?: number;
  target_role?: "talent" | "recruiter" | "both";
  is_popular?: boolean;
}

export interface CreatePlanVersionInput extends CreatePlanInput {
  family_key: string;
}

export interface UpdateFamilyBenefitsInput {
  features?: string[];
  permissions?: string[];
  message_quota_limit?: number;
  campaign_quota_limit?: number;
  max_images?: number;
  max_videos?: number;
}

export interface SunsetPlanInput {
  sunset_at: string;
}

export const plansApi = {
  getPlans: async () => {
    const response = await apiClient.get("/plans");
    return response.data as Plan[];
  },

  getAdminPlans: async (): Promise<PlanConfig[]> => {
    const response = await apiClient.get("/admin/plans");
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
    const response = await apiClient.post("/admin/plans", payload);
    return response.data;
  },

  createPlanVersion: async (familyKey: string, payload: CreatePlanInput): Promise<PlanConfig> => {
    const response = await apiClient.post(`/admin/plans/${familyKey}/versions`, payload);
    return response.data;
  },

  updateFamilyBenefits: async (familyKey: string, payload: UpdateFamilyBenefitsInput): Promise<PlanConfig[]> => {
    const response = await apiClient.patch(`/admin/plans/${familyKey}/benefits`, payload);
    return response.data;
  },

  sunsetPlan: async (key: string, payload: SunsetPlanInput): Promise<PlanConfig> => {
    const response = await apiClient.post(`/admin/plans/${key}/sunset`, payload);
    return response.data;
  },

  deletePlan: async (key: string): Promise<{ message: string; data: { key: string } }> => {
    const response = await apiClient.delete(`/admin/plans/${key}`);
    return response.data;
  },
};
