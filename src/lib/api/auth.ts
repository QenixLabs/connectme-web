import { apiClient } from "./client";

export const authApi = {
  completeGoogleSignup: async (role: "talent" | "recruiter" | "provider") => {
    const response = await apiClient.post("/auth/google/complete-signup", { role });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  signup: async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "talent" | "recruiter" | "provider";
    verification_method: "email" | "phone";
    auth_provider?: string;
    company_name?: string;
    username?: string;
    profession?: string;
    company_website?: string;
    company_size?: string;
    specialties?: string[];
    creator_link?: string;
    is_influencer?: boolean;
    influencer_speciality?: string[];
    professional_name?: string;
    willing_to_travel?: string;
    preferred_cities?: string[];
    contact_name?: string;
    industry?: string;
    industries?: string[];
    city?: string;
    years_in_business?: string;
    is_independent?: boolean;
    founded_year?: number;
  }) => {
    const response = await apiClient.post("/auth/signup", data);
    return response.data;
  },

  uploadProfilePhoto: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/talent/upload/profile-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await apiClient.get(`/talent/check-username`, {
      params: { username },
    });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await apiClient.post("/auth/verify-otp", { email, otp });
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  checkAuth: async () => {
    const response = await apiClient.get("/auth/check");
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  forgotPassword: async (email?: string, phone?: string) => {
    const response = await apiClient.post("/auth/forgot-password", { email, phone });
    return response.data;
  },

  resetPassword: async (email: string | undefined, phone: string | undefined, otp: string, newPassword: string) => {
    const response = await apiClient.post("/auth/reset-password", { email, phone, otp, new_password: newPassword });
    return response.data;
  },

  sendPhoneOtp: async (phone?: string) => {
    const response = await apiClient.post("/auth/send-phone-otp", phone ? { phone } : {});
    return response.data;
  },

  verifyPhoneOtp: async (phone: string, otp: string) => {
    const response = await apiClient.post("/auth/verify-phone-otp", { phone, otp });
    return response.data;
  },

  activateProvider: async () => {
    const response = await apiClient.post("/provider/activate");
    return response.data;
  },

  getProviderProfile: async () => {
    const response = await apiClient.get("/provider/profile");
    return response.data as { profile: any };
  },

  updateProviderProfile: async (data: {
    display_name?: string;
    business_name?: string;
    phone?: string;
    city?: string;
    categories?: string[];
    about?: string;
    profile_photo?: string;
  }) => {
    const response = await apiClient.patch("/provider/profile", data);
    return response.data as { profile: any };
  },

  completeProviderOnboarding: async () => {
    const response = await apiClient.post("/provider/onboarding/complete");
    return response.data;
  },

  getOnboardingStatus: async () => {
    const response = await apiClient.get("/auth/onboarding/status");
    return response.data as { eligible: boolean; missing: string[]; profile?: any };
  },

  completeOnboarding: async () => {
    const response = await apiClient.post("/auth/onboarding/complete");
    return response.data;
  },

  setPassword: async (new_password: string) => {
    const response = await apiClient.post("/auth/set-password", { new_password });
    return response.data;
  },

  sendEmailOtp: async () => {
    const response = await apiClient.post("/auth/send-email-otp");
    return response.data;
  },

  verifyEmailOtp: async (email: string, otp: string) => {
    const response = await apiClient.post("/auth/verify-email-otp", { email, otp });
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post("/auth/refresh");
    return response.data as { access_token: string };
  },

  changePassword: async (current_password: string, new_password: string) => {
    const response = await apiClient.post("/auth/change-password", { current_password, new_password });
    return response.data;
  },
};
