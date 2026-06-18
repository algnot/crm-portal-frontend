import apiClient, {
  clearToken,
  getToken,
  redirectToLogin,
  setToken,
} from "@/services/api-client";
import type {
  PortalLoginRequest,
  PortalLoginResponse,
  PortalMeResponse,
} from "./types";

export const login = async (payload: PortalLoginRequest) => {
  const res = await apiClient.client.post<PortalLoginResponse>(
    "/api/proxy/portal/login",
    payload,
    { baseURL: "", skipErrorAlert: true },
  );
  setToken(res.data.token);
  return res.data;
};

export const getMe = async () => {
  const token = getToken();
  if (!token) {
    return Promise.reject({
      message: "Not authenticated",
      status: 401,
      raw: null,
    });
  }

  const res = await apiClient.client.get<PortalMeResponse>("/portal/me");
  return res.data;
};

export const logout = () => {
  clearToken();
  redirectToLogin();
};

export type { PortalLoginRequest, PortalLoginResponse, PortalMeResponse };
