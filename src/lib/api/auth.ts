import { apiClient } from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (data: {
    email: string;
    password: string;
    phone: string;
    role: 'talent' | 'recruiter';
    verification_method: 'email' | 'phone';
    auth_provider?: string;
    company_name?: string;
    username?: string;
    profession?: string;
    company_website?: string;
    company_size?: string;
    specialties?: string[];
    creator_link?: string;
  }) => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  checkAuth: async () => {
    const response = await apiClient.get('/auth/check');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email?: string, phone?: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email, phone });
    return response.data;
  },

  resetPassword: async (email: string | undefined, phone: string | undefined, otp: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { email, phone, otp, new_password: newPassword });
    return response.data;
  },

  sendPhoneOtp: async () => {
    const response = await apiClient.post('/auth/send-phone-otp');
    return response.data;
  },

  verifyPhoneOtp: async (phone: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-phone-otp', { phone, otp });
    return response.data;
  },

  sendEmailOtp: async () => {
    const response = await apiClient.post('/auth/send-email-otp');
    return response.data;
  },

  verifyEmailOtp: async (email: string, otp: string) => {
    const response = await apiClient.post('/auth/verify-email-otp', { email, otp });
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data as { access_token: string };
  },

  changePassword: async (current_password: string, new_password: string) => {
    const response = await apiClient.post('/auth/change-password', { current_password, new_password });
    return response.data;
  },
};
