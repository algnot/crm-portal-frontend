export type PortalTier = {
  id: number;
  code: string;
  name: string;
  color: string;
  image_url: string | false;
  convert_points: number;
  min_spending: number;
  max_spending: number;
  is_show_in_ui: boolean;
};

export type TiersListResponse = {
  tiers: PortalTier[];
};

export type TierDetailResponse = {
  tier: PortalTier;
};

export type CreateTierRequest = {
  name: string;
  code: string;
  min_spending: number;
  max_spending: number;
  convert_points: number;
  color: string;
  is_show_in_ui: boolean;
};

export type UpdateTierRequest = Partial<CreateTierRequest> & {
  icon?: string | false;
};
