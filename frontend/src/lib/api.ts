import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// Automatically detect API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use the same origin as the frontend
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  
  // In development, default to localhost:3000
  return "http://localhost:3000";
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        useAuthStore.getState().updateToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post("/auth/register", { email, password, name }),
};

export const vehicleApi = {
  getAll: (page = 1, limit = 10) =>
    api.get(`/vehicles?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  getStatus: (id: string, date: string) =>
    api.get(`/vehicles/${id}/status?date=${date}`),
  create: (data: any) => api.post("/vehicles", data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

export const reportApi = {
  downloadVehicleReport: (params?: {
    vehicleId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.vehicleId) searchParams.append("vehicleId", params.vehicleId);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);

    return api.get(`/reports/vehicles?${searchParams.toString()}`, {
      responseType: "blob",
    });
  },
};
