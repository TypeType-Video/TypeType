import type { HomeRecommendationsResponse } from "../types/api";
import { request } from "./api";
import { API_BASE as BASE } from "./env";
import { optionalBearer } from "./optional-bearer";

export type RecommendationIntent = "quick" | "deep" | "auto";

export async function fetchHomeRecommendations(
  service: number,
  limit: number,
  cursor?: string,
  intent: RecommendationIntent = "auto",
): Promise<HomeRecommendationsResponse> {
  const search = new URLSearchParams({
    service: String(service),
    limit: String(limit),
    intent,
  });
  if (cursor) search.set("cursor", cursor);
  return request(`${BASE}/recommendations/home?${search.toString()}`, optionalBearer());
}

export async function fetchShortsRecommendations(
  service: number,
  limit: number,
  cursor?: string,
  intent: RecommendationIntent = "quick",
): Promise<HomeRecommendationsResponse> {
  const search = new URLSearchParams({
    service: String(service),
    limit: String(limit),
    intent,
  });
  if (cursor) search.set("cursor", cursor);
  return request(`${BASE}/recommendations/shorts?${search.toString()}`, optionalBearer());
}
