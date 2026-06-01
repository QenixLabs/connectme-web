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
    industry?: string;
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
};
