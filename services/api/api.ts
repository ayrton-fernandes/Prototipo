import axios from "axios";
import { getToken } from "@/services/utils/cookie";

const sanitizeBaseUrl = (value?: string | null) => {
  if (!value) return "";
  const normalized = value.trim();
  if (!normalized || normalized === "undefined" || normalized === "null") return "";
  return normalized;
};

const resolveBaseUrl = () => {
  if (typeof window !== "undefined") {
    const runtimeUrl = sanitizeBaseUrl(window.__ENV?.NEXT_PUBLIC_API_URL);
    if (runtimeUrl) return runtimeUrl;
  }

  return sanitizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
};

const baseURL = resolveBaseUrl();

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = resolveBaseUrl();
  }

  if (typeof document !== "undefined") {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
