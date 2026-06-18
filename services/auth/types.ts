import type { PortalRole } from "@/services/team/types";

export type { PortalRole } from "@/services/team/types";

export type PortalMeUser = {
  name: string;
  email: string;
  role: PortalRole;
};

export type PortalMeResponse = {
  user: PortalMeUser;
  partner: { name: string; slug: string; logo_url: string | null };
};

export type UpdateMeRequest = {
  name?: string;
  email?: string;
  current_password?: string;
  password?: string;
};

export type PortalLoginRequest = {
  domain: string;
  email: string;
  password: string;
};

export type PortalLoginResponse = {
  token: string;
  expires_at: string;
  user: PortalMeUser;
  partner: { name: string; slug: string; logo_url: string | null };
};

export type {
  AcceptInviteRequest,
  PublicInvite,
  PublicInviteResponse,
} from "@/services/team/types";
