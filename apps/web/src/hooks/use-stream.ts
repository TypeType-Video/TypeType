import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";
import { ApiError } from "../lib/api";
import { fetchStream } from "../lib/api-stream";
import { mapStreamResponse } from "../lib/mappers";
import {
  isMemberOnlyApiError as isMemberOnlyApiResponse,
  MEMBER_ONLY_MESSAGE,
} from "../lib/member-only";

export { MEMBER_ONLY_MESSAGE };

export function streamQueryOptions(url: string, useAuthenticatedStream = false, enabled = true) {
  return queryOptions({
    queryKey: ["stream", url, useAuthenticatedStream ? "auth" : "anon"],
    queryFn: () =>
      fetchStream(url, useAuthenticatedStream ? "authenticated_first" : "anonymous_first").then(
        (r) => mapStreamResponse(r, url),
      ),
    enabled: enabled && url.startsWith("http"),
    staleTime: 3 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (count, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 400 ||
          error.status === 403 ||
          error.status === 404 ||
          error.status === 422)
      ) {
        return false;
      }
      return count < 2;
    },
    retryDelay: (attempt) => Math.min(250 * 2 ** attempt, 1500),
  });
}

export function isStreamUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("Error occurs when fetching the page") ||
    error.message.includes(MEMBER_ONLY_MESSAGE) ||
    error.message.includes("No suitable stream")
  );
}

export function isMemberOnlyApiError(error: unknown): boolean {
  return isMemberOnlyApiResponse(error);
}

export function useStream(url: string, useAuthenticatedStream = false, enabled = true) {
  return useQuery({
    ...streamQueryOptions(url, useAuthenticatedStream, enabled),
    placeholderData: keepPreviousData,
  });
}
