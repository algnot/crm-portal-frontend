import apiClient from "@/services/api-client";
import type {
  CreateTierRequest,
  PortalTier,
  TierDetailResponse,
  TiersListResponse,
  UpdateTierRequest,
} from "./types";

const tierMutationConfig = { skipErrorAlert: true };

export const getTiers = async () => {
  const res = await apiClient.client.get<TiersListResponse>("/portal/tiers");
  return res.data.tiers;
};

export const getTier = async (id: number) => {
  const res = await apiClient.client.get<TierDetailResponse>(
    `/portal/tiers/${id}`,
  );
  return res.data.tier;
};

export const createTier = async (payload: CreateTierRequest) => {
  const res = await apiClient.client.post<TierDetailResponse>(
    "/portal/tiers",
    payload,
    tierMutationConfig,
  );
  return res.data.tier;
};

export const buildTierUpdatePayload = (
  original: PortalTier,
  next: CreateTierRequest,
): UpdateTierRequest => {
  const payload: UpdateTierRequest = {};

  if (next.name !== original.name) payload.name = next.name;
  if (next.code !== original.code) payload.code = next.code;
  if (next.color !== original.color) payload.color = next.color;
  if (next.min_spending !== original.min_spending) {
    payload.min_spending = next.min_spending;
  }
  if (next.max_spending !== original.max_spending) {
    payload.max_spending = next.max_spending;
  }
  if (next.convert_points !== original.convert_points) {
    payload.convert_points = next.convert_points;
  }
  if (next.is_show_in_ui !== original.is_show_in_ui) {
    payload.is_show_in_ui = next.is_show_in_ui;
  }

  return payload;
};

export const updateTier = async (id: number, payload: UpdateTierRequest) => {
  const res = await apiClient.client.put<TierDetailResponse>(
    `/portal/tiers/${id}`,
    payload,
    tierMutationConfig,
  );
  return res.data.tier;
};

export type {
  CreateTierRequest,
  PortalTier,
  UpdateTierRequest,
} from "./types";
