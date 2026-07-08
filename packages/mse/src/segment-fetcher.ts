import type { HttpClient } from "./http-client";

export async function fetchSegmentBytes(
  http: HttpClient,
  url: string,
  pollLimit: number,
  signal?: AbortSignal,
): Promise<ArrayBuffer> {
  for (let attempt = 0; attempt < pollLimit; attempt += 1) {
    if (signal?.aborted) throw new DOMException("Operation aborted", "AbortError");
    const response = await http.response(url, signal ? { signal } : undefined);
    if (response.status === 200) return response.arrayBuffer();
    if (response.status !== 202) throw new Error(`Segment failed with ${response.status}`);
    const delayMs = await retryAfterMs(response);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error("Segment was not ready in time");
}

async function retryAfterMs(response: Response): Promise<number> {
  const value = response.headers.get("retry-after");
  const seconds = value ? Number(value) : Number.NaN;
  if (Number.isFinite(seconds) && seconds > 0) return Math.round(seconds * 1000);
  const body = await response.json().catch(() => null);
  if (!body || typeof body !== "object") return 500;
  const retryAfter = Reflect.get(body, "retryAfterMs");
  return typeof retryAfter === "number" && Number.isFinite(retryAfter) ? retryAfter : 500;
}
