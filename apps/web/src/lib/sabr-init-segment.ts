import type { SabrTrackState } from "./sabr-mse-utils";
import { fetchSabrInitSegment } from "./sabr-session-api";

export async function appendSabrInitSegment(
  track: SabrTrackState,
  endpoint: string,
  active: () => boolean,
): Promise<void> {
  const bytes = await fetchSabrInitSegment(endpoint);
  if (active()) track.queue.append(bytes);
}
