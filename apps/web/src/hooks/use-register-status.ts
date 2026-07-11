import { useQuery } from "@tanstack/react-query";
import { fetchRegisterStatus } from "../lib/api-auth-status";

const KEY = ["register-status"];

export function useRegisterStatus(enabled = true) {
  return useQuery({
    queryKey: KEY,
    queryFn: fetchRegisterStatus,
    retry: false,
    staleTime: 30_000,
    enabled,
  });
}
