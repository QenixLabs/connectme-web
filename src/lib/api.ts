import axios, { AxiosError } from 'axios';
import type {
  CreateTalentProfileInput,
  TalentProfile,
  UpdateTalentProfileInput,
} from '@/lib/validations/talent-profile.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

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
    auth_provider?: string;
    company_name?: string;
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

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { email, otp, new_password: newPassword });
    return response.data;
  },
};

export const talentApi = {
  getMyProfile: async (): Promise<TalentProfile | null> => {
    try {
      const response = await apiClient.get('/talent/me');
      return response.data as TalentProfile;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) return null;
      throw err;
    }
  },

  getCompleteness: async (): Promise<{ isComplete: boolean; missingFields: string[] }> => {
    const response = await apiClient.get('/talent/completeness');
    return response.data;
  },

  createProfile: async (payload: CreateTalentProfileInput): Promise<TalentProfile> => {
    const response = await apiClient.post('/talent', payload);
    return response.data as TalentProfile;
  },

  updateProfile: async (payload: UpdateTalentProfileInput): Promise<TalentProfile> => {
    const response = await apiClient.patch('/talent', payload);
    return response.data as TalentProfile;
  },
};

export default apiClient;