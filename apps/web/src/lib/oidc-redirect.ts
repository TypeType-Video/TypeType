export function oidcCallbackUrl(): string {
  return `${window.location.origin}/auth/oidc/callback`;
}

export function safeReturnTo(value: string | null | undefined): string {
  if (value?.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}
