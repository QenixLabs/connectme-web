import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { redirectToSuspendedPage, redirectToBannedPage } from "@/lib/redirect";
import { tokenStorage } from "@/lib/token-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null,
  },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: unwrap envelope + handle 401 refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const isPublicEndpoint = (url: string): boolean => {
  const publicPaths = [
    "/talent/profile/",
    "/recruiters/public/",
    "/auth/login",
    "/auth/signup",
    "/auth/verify-otp",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/refresh",
    "/auth/check",
  ];
  return publicPaths.some((path) => url.includes(path));
};

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === "object" && data.success === true) {
      response.data = data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        error.response.data = JSON.parse(text);
      } catch {
        // leave blob as-is for non-JSON error bodies
      }
    }

    if (error.response?.status === 403) {
      const payload = error.response.data as Record<string, unknown>;
      const detail = payload?.data as Record<string, unknown> | undefined;
      if (detail?.suspended) {
        redirectToSuspendedPage(detail.suspended_until as string, detail.reason as string, detail.moderation_action_id as string);
        return Promise.reject(error);
      }
      if (detail?.banned) {
        redirectToBannedPage(detail.banned_at as string, detail.reason as string, detail.moderation_action_id as string);
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 429) {
      const data = error.response.data as Record<string, unknown>;
      const message = data?.message || "Too many requests. Please slow down.";
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-error", { detail: { status: 429, message } }));
      }
    }

    // 401 with refresh logic
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const requestUrl = originalRequest.url || "";
      if (isPublicEndpoint(requestUrl)) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        apiClient
          .post("/auth/refresh")
          .then((res) => {
            const { access_token } = res.data as { access_token: string };
            tokenStorage.setToken(access_token);
            processQueue(null, access_token);
          })
          .catch((err) => {
            processQueue(err as Error, null);
            tokenStorage.setToken(null);
            if (typeof window !== "undefined") {
              document.cookie = "auth_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              document.cookie = "user_role=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              localStorage.removeItem("auth-storage");
              window.location.href = "/auth/login";
            }
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Fallback 401 handler
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      if (!isPublicEndpoint(requestUrl) && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/suspended" && currentPath !== "/banned") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
