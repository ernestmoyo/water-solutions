import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { dispatchMock, isMockToken } from "./mockApi";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------------------------
// Mock adapter helpers
// ---------------------------------------------------------------------------
const MOCK_SIGNAL = "__MOCK_DISPATCH__";

function tryMockDispatch(config: AxiosRequestConfig): unknown {
  const token = localStorage.getItem("access_token");
  const url = config.url ?? "";
  const method = config.method ?? "GET";
  const body = config.data
    ? typeof config.data === "string"
      ? JSON.parse(config.data)
      : config.data
    : undefined;
  return dispatchMock(method, url, body, token);
}

function mockAxiosResponse(config: AxiosRequestConfig, data: unknown) {
  return { data, status: 200, statusText: "OK", headers: {}, config };
}

function mockAxiosError(config: AxiosRequestConfig, status: number, message: string) {
  return Object.assign(new Error(message), {
    response: { status, data: { detail: message }, headers: {}, config },
    isAxiosError: true,
    config,
  });
}

// ---------------------------------------------------------------------------
// Request interceptor 1 — attach token
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Request interceptor 2 — short-circuit for mock tokens
// ---------------------------------------------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("access_token");
  if (isMockToken(token)) {
    // Throw a tagged error so the response interceptor serves mock data
    // without making any real network request.
    throw Object.assign(new Error(MOCK_SIGNAL), {
      __isMock: true,
      config,
    });
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — mock fallback + token refresh
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = (error.config ?? {}) as AxiosRequestConfig & { _retry?: boolean };

    // Mock short-circuit (mock token) or backend unreachable / bad gateway
    if (error.__isMock || !error.response || [502, 503, 504].includes(error.response?.status)) {
      try {
        const data = tryMockDispatch(config);
        return mockAxiosResponse(config, data);
      } catch (mockErr: unknown) {
        const e = mockErr as { status?: number; message?: string };
        throw mockAxiosError(config, e.status ?? 500, e.message ?? "Mock error");
      }
    }

    // 401 → try refresh, else redirect to login
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem("access_token", res.data.access_token);
          localStorage.setItem("refresh_token", res.data.refresh_token);
          if (config.headers) config.headers["Authorization"] = `Bearer ${res.data.access_token}`;
          return api(config);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
