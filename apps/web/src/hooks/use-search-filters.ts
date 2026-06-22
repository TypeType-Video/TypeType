import { useQuery } from "@tanstack/react-query";
import { fetchSearchFilters } from "../lib/api-discovery";

export function useSearchFilters(service: number) {
  return useQuery({
    queryKey: ["search-filters", service],
    queryFn: () => fetchSearchFilters(service),
    staleTime: 60 * 60 * 1000,
  });
}
