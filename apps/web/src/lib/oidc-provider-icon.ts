import {
  siApple,
  siAuth0,
  siAuthelia,
  siAuthentik,
  siGithub,
  siGitlab,
  siGoogle,
  siKeycloak,
  siOkta,
  siOpenid,
} from "simple-icons";

type ProviderIcon = { path: string; title: string; hex: string };

const KNOWN: { match: string; icon: ProviderIcon }[] = [
  { match: "keycloak", icon: siKeycloak },
  { match: "authentik", icon: siAuthentik },
  { match: "authelia", icon: siAuthelia },
  { match: "auth0", icon: siAuth0 },
  { match: "okta", icon: siOkta },
  { match: "google", icon: siGoogle },
  { match: "github", icon: siGithub },
  { match: "gitlab", icon: siGitlab },
  { match: "apple", icon: siApple },
];

export function oidcProviderIcon(providerName: string | null): ProviderIcon {
  const name = (providerName ?? "").toLowerCase();
  const found = KNOWN.find((entry) => name.includes(entry.match));
  return found ? found.icon : siOpenid;
}

export function brandIconColor(hex: string): string {
  if (hex.length !== 6) return "currentColor";
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.25 ? "currentColor" : `#${hex}`;
}
