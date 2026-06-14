import { useQuery } from "@tanstack/react-query";
import { fetchOidcStatus } from "../lib/api-oidc";

export function useOidcStatus() {
  return useQuery({
    queryKey: ["oidc-status"],
    queryFn: fetchOidcStatus,
    staleTime: 5 * 60 * 1000,
  });
}
