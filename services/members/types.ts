export type PortalCurrency = {
  id: number;
  name: string;
  is_default: boolean;
  is_total_spending?: boolean;
};

export type PortalUserPoint = {
  currency: PortalCurrency;
  balance: number;
};

export type PortalTier = {
  code: string;
  name: string;
};

export type PortalUser = {
  id: number;
  display_name: string;
  picture_url: string | false;
  line_user_id: string;
  email: string | false;
  is_email_verified: boolean;
  phone: string | false;
  is_phone_verified: boolean;
  birth_date: string | false;
  gender: string | false;
  tier: PortalTier;
  points: PortalUserPoint[];
  create_date: string;
};

export type UsersListResponse = {
  users: PortalUser[];
  total: number;
};

export type UserDetailResponse = {
  user: PortalUser;
};

export type AdjustPointRequest = {
  value: number;
  type: "earn" | "spend";
  note: string;
  currency_id: number;
};

export type AdjustPointResponse = {
  point: {
    id: number;
    name: string;
    value: number;
    type: string;
    admin_note: string;
    given_date: string;
    expiration_date: string | false;
    currency: PortalCurrency;
  };
};

export type UsersListParams = {
  search?: string;
  limit?: number;
  offset?: number;
};
