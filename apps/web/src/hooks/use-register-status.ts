import { useQuery } from "@tanstack/react-query";
import { fetchRegisterStatus } from "../lib/api-auth-status";

export const REGISTER_STATUS_KEY = ["register-status"];

export function useRegisterStatus(enabled = true) {
  return useQuery({
    queryKey: REGISTER_STATUS_KEY,
    queryFn: fetchRegisterStatus,
    retry: false,
    staleTime: 30_000,
    enabled,
  });
}
