import { useQuery } from "@tanstack/react-query";
import { fetchInstanceCapabilities } from "../lib/api-instance";

export const INSTANCE_KEY = ["instance"];

export function useInstance() {
  return useQuery({
    queryKey: INSTANCE_KEY,
    queryFn: fetchInstanceCapabilities,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
