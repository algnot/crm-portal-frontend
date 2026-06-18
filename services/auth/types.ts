export type PortalMeResponse = {
  user: { name: string; email: string };
  partner: { name: string; slug: string; logo_url: string | null };
};

export type PortalLoginRequest = {
  email: string;
  password: string;
};

export type PortalLoginResponse = {
  token: string;
  expires_at: string;
  user: { name: string; email: string };
  partner: { name: string; slug: string; logo_url: string | null };
};
