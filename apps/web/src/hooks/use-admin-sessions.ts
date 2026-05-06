import { useQuery } from "@tanstack/react-query";
import { fetchAdminSessions } from "../lib/api-admin-sessions";

export function useAdminSessions(enabled: boolean) {
  return useQuery({
    queryKey: ["admin-sessions"],
    queryFn: fetchAdminSessions,
    enabled,
    refetchInterval: enabled ? 5000 : false,
  });
}
