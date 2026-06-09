import { apiClient } from './client';

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
  plan: {
    _id: string;
    key: string;
    display_name: string;
    description: string;
    price: number;
    interval: string;
    features: string[];
    is_active: boolean;
  } | null;
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

  cancelSubscription: async (): Promise<Subscription> => {
    const response = await apiClient.post('/subscriptions/cancel');
    return response.data;
  },
};
