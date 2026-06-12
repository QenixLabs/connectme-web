import { apiClient } from './client';
import type { PlanConfig } from './plans';

export interface Subscription {
  _id: string;
  user_id: string;
  plan_key: string;
  status: string;
  razorpay_subscription_id?: string | null;
  razorpay_customer_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionWithPlan {
  subscription: Subscription | null;
  plan: PlanConfig | null;
}

export interface SubscriptionUsage {
  role: string;
  messages?: { used: number; limit: number };
  campaigns?: { used: number; limit: number };
  media?: {
    images: { used: number; limit: number };
    videos: { used: number; limit: number };
  };
}

export const subscriptionsApi = {
  getMySubscription: async (): Promise<SubscriptionWithPlan> => {
    const response = await apiClient.get('/subscriptions/me');
    return response.data;
  },

  initiateUpgrade: async (planKey: string): Promise<{ subscriptionId: string; shortUrl: string }> => {
    const response = await apiClient.post('/subscriptions/upgrade', { planKey });
    return response.data;
  },

  cancelSubscription: async (reason?: string, immediate?: boolean): Promise<Subscription> => {
    const response = await apiClient.post('/subscriptions/cancel', { reason, immediate });
    return response.data;
  },

  resumeSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.post('/subscriptions/resume');
    return response.data;
  },

  getUsage: async (): Promise<SubscriptionUsage> => {
    const response = await apiClient.get('/subscriptions/usage');
    return response.data;
  },

  simulateWebhook: async (payload: {
    event: string;
    razorpaySubscriptionId: string;
  }): Promise<{ message: string; data: unknown }> => {
    const response = await apiClient.post('/webhooks/simulate', payload);
    return response.data;
  },
};
