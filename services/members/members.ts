import apiClient from "@/services/api-client";
import type {
  AdjustPointRequest,
  AdjustPointResponse,
  UserDetailResponse,
  UsersListParams,
  UsersListResponse,
} from "./types";

export const getUsers = async (params: UsersListParams = {}) => {
  const res = await apiClient.client.get<UsersListResponse>("/portal/users", {
    params: {
      search: params.search ?? "",
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });
  return res.data;
};

export const getUser = async (id: number) => {
  const res = await apiClient.client.get<UserDetailResponse>(
    `/portal/users/${id}`,
  );
  return res.data.user;
};

export const adjustUserPoint = async (
  id: number,
  payload: AdjustPointRequest,
) => {
  const res = await apiClient.client.post<AdjustPointResponse>(
    `/portal/users/${id}/point`,
    payload,
  );
  return res.data;
};

export type {
  AdjustPointRequest,
  PortalUser,
  PortalUserPoint,
  UsersListParams,
} from "./types";
