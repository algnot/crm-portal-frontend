import apiClient from "@/services/api-client";
import type {
  CreateTeamInviteRequest,
  CreateTeamUserRequest,
  PortalTeamInvite,
  PortalTeamUser,
  TeamInviteDetailResponse,
  TeamInvitesListParams,
  TeamInvitesListResponse,
  TeamUserDetailResponse,
  TeamUsersListParams,
  TeamUsersListResponse,
} from "./types";

const mutationConfig = { skipErrorAlert: true };

const proxyDelete = <T>(url: string) =>
  apiClient.client.delete<T>(url, {
    ...mutationConfig,
    baseURL: "",
  });

export const getTeamUsers = async (params: TeamUsersListParams = {}) => {
  const res = await apiClient.client.get<TeamUsersListResponse>(
    "/portal/team",
    {
      params: {
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
        ...(params.search ? { search: params.search } : {}),
        ...(params.active !== undefined ? { active: params.active } : {}),
      },
    },
  );
  return {
    teamUsers: res.data.team_users ?? [],
    total: res.data.total ?? 0,
  };
};

export const createTeamUser = async (payload: CreateTeamUserRequest) => {
  const res = await apiClient.client.post<TeamUserDetailResponse>(
    "/portal/team",
    payload,
    mutationConfig,
  );
  return res.data.team_user;
};

export const getTeamInvites = async (params: TeamInvitesListParams = {}) => {
  const res = await apiClient.client.get<TeamInvitesListResponse>(
    "/portal/team/invites",
    {
      params: {
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
        state: params.state ?? "pending",
      },
    },
  );
  return {
    invites: res.data.invites ?? [],
    total: res.data.total ?? 0,
  };
};

export const createTeamInvite = async (payload: CreateTeamInviteRequest) => {
  const res = await apiClient.client.post<TeamInviteDetailResponse>(
    "/portal/team/invites",
    payload,
    mutationConfig,
  );
  return res.data.invite;
};

export const cancelTeamInvite = async (id: number) => {
  await proxyDelete(`/api/proxy/portal/team/invites/${id}`);
};

export type {
  CreateTeamInviteRequest,
  CreateTeamUserRequest,
  PortalTeamInvite,
  PortalTeamUser,
  TeamInvitesListParams,
  TeamUsersListParams,
} from "./types";
