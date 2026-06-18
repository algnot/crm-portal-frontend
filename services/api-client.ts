import axios, { AxiosInstance } from "axios";
import { handleError, showErrorAlert } from "@/utils/errors";

declare module "axios" {
  interface AxiosRequestConfig {
    skipErrorAlert?: boolean;
  }
}

class ApiClient {
  client: AxiosInstance;
  // Browser calls same-origin /api (Next.js rewrite) to avoid Odoo CORS limits on PUT.
  readonly apiBaseUrl =
    typeof window !== "undefined"
      ? "/api"
      : `${process.env.NEXT_PUBLIC_API_URL}/api`;

  constructor() {
    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = getToken();
      const hasAuthorizationHeader = Boolean(
        config.headers?.Authorization ?? config.headers?.authorization,
      );

      if (token && !hasAuthorizationHeader) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        const appError = handleError(error);

        if (appError.status === 401) {
          clearToken();
        }

        const requestUrl = axios.isAxiosError(error)
          ? (error.config?.url ?? "")
          : "";
        const isSilentAuthRequest = requestUrl.includes("/portal/me");
        const skipErrorAlert = Boolean(
          axios.isAxiosError(error) && error.config?.skipErrorAlert,
        );

        if (!isSilentAuthRequest && !skipErrorAlert) {
          void showErrorAlert(appError);
        }

        return Promise.reject(appError);
      },
    );
  }
}

const apiClient = new ApiClient();

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("access_token", token);
  window.document.cookie = `access_token=${token}; path=/; SameSite=Lax`;
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("access_token");
  window.document.cookie = "access_token=; path=/; max-age=0";
};

export const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

export default apiClient;
