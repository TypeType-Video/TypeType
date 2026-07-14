import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AccountIdentityUpdate,
  fetchAccountIdentity,
  updateAccountIdentity,
} from "../lib/api-account-identity";

const KEY = ["account-identity"];

export function useAccountIdentity(enabled: boolean) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: fetchAccountIdentity, enabled });
  const update = useMutation({
    mutationFn: (payload: AccountIdentityUpdate) => updateAccountIdentity(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
  return { query, update };
}
