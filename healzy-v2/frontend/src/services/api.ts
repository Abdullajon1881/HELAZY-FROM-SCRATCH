import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const tokens = useAuthStore.getState().tokens;
      if (tokens?.refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });
          useAuthStore.getState().setTokens(data.tokens);
          original.headers = {
            ...original.headers,
            Authorization: `Bearer ${data.tokens.accessToken}`,
          };
          return api(original);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
