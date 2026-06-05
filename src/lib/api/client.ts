import axios, { AxiosError } from 'axios';
import { redirectToSuspendedPage, redirectToBannedPage } from '@/lib/redirect';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
});

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && data.success === true) {
      response.data = data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 403) {
      const data = error.response.data;
      if (data?.data?.suspended) {
        redirectToSuspendedPage(data.data.suspended_until, data.data.reason, data.data.moderation_action_id);
        return Promise.reject(error);
      }
      if (data?.data?.banned) {
        redirectToBannedPage(data.data.banned_at, data.data.reason, data.data.moderation_action_id);
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 429) {
      const data = error.response.data;
      const message = data?.message || 'Too many requests. Please slow down.';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', { detail: { status: 429, message } }));
      }
    }

    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const publicEndpoints = [
        '/talent/profile/',
        '/auth/login',
        '/auth/signup',
        '/auth/verify-otp',
        '/auth/forgot-password',
        '/auth/reset-password',
      ];
      const isPublicEndpoint = publicEndpoints.some((path) =>
        requestUrl.includes(path),
      );
      if (!isPublicEndpoint && typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
