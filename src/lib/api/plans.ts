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

export const plansApi = {
  getPlans: async () => {
    const response = await apiClient.get("/plans");
    return response.data as Plan[];
  },
};
