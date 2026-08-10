import { apiClient } from "./client";

export interface Subscription {
  _id: string;
  user_id: string;
  plan_key: string;
  status: string;
  razorpay_subscription_id?: string;
  razorpay_customer_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  scheduled_plan_key?: string;
  scheduled_change_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanConfig {
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
}

export interface SubscriptionResponse {
  subscription: Subscription | null;
  plan: PlanConfig | null;
}

export interface UsageResponse {
  role: string;
  media?: {
    images: { used: number; limit: number };
    videos: { used: number; limit: number };
  };
  messages?: { used: number; limit: number };
  campaigns?: { used: number; limit: number };
}

export interface Invoice {
  _id: string;
  user_id: string;
  subscription_id: string;
  razorpay_invoice_id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  period_start?: string;
  period_end?: string;
  pdf_url?: string;
  invoice_number?: string;
  created_at: string;
}

export interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UpgradePayload {
  planKey: string;
  interval: "monthly" | "yearly";
}

export interface UpgradeResponse {
  checkout_url: string;
}

export interface UpdatePaymentMethodPayload {
  return_url?: string;
}

export interface PaymentMethodResponse {
  payment_url: string;
}

export const subscriptionsApi = {
  getMySubscription: async () => {
    const response = await apiClient.get("/subscriptions/me");
    return response.data as SubscriptionResponse;
  },

  getUsage: async () => {
    const response = await apiClient.get("/subscriptions/usage");
    return response.data as UsageResponse;
  },

  getInvoices: async (page = 1, limit = 20) => {
    const response = await apiClient.get("/subscriptions/invoices", {
      params: { page, limit },
    });
    return response.data as InvoicesResponse;
  },

  upgrade: async (payload: UpgradePayload) => {
    const response = await apiClient.post("/subscriptions/upgrade", payload);
    return response.data as UpgradeResponse;
  },

  updatePaymentMethod: async (payload: UpdatePaymentMethodPayload) => {
    const response = await apiClient.post(
      "/subscriptions/update-payment-method",
      payload,
    );
    return response.data as PaymentMethodResponse;
  },
};
