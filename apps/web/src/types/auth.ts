export type AuthRole = "admin" | "moderator" | "user";

export type AuthMe = {
  id: string;
  role: AuthRole | null;
  publicUsername: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarType: "custom" | "emoji" | null;
  avatarCode: string | null;
};

export type AuthStatus = "loading" | "authenticated" | "guest" | "signed_out";

export type AuthResponse = {
  accessToken: string;
};

export type OidcStatus = {
  enabled: boolean;
  providerName: string | null;
  localLoginEnabled: boolean;
  autoRedirect: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  publicUsername: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarType: "custom" | "emoji" | null;
  avatarCode: string | null;
  suspended: boolean;
  verified: boolean;
  createdAt: number | string;
};

export type PasswordResetToken = {
  resetToken: string;
};
