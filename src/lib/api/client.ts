import axios, { AxiosError } from 'axios';

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
      if (data?.data?.suspended && typeof window !== 'undefined') {
        const params = new URLSearchParams({
          until: data.data.suspended_until,
          reason: data.data.reason,
        });
        window.location.href = `/suspended?${params.toString()}`;
        return;
      }
      if (data?.data?.banned && typeof window !== 'undefined') {
        const params = new URLSearchParams({
          banned_at: data.data.banned_at,
          reason: data.data.reason,
        });
        window.location.href = `/banned?${params.toString()}`;
        return;
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
