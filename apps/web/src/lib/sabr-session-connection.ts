import type { SabrSessionDescriptor } from "../types/sabr";
import { fetchSabrSessionDescriptor, toWebSocketUrl } from "./sabr-session-api";
import { SabrWebSocketClient } from "./sabr-websocket-client";

export type SabrSessionConnection = {
  descriptor: SabrSessionDescriptor;
  client: SabrWebSocketClient;
};

async function connectSabrSession(
  descriptorUrl: string,
  playerTimeMs: number,
): Promise<SabrSessionConnection> {
  const descriptor = await fetchSabrSessionDescriptor(descriptorUrl, playerTimeMs);
  if (!MediaSource.isTypeSupported(descriptor.video.mimeType)) throw new Error("video_unsupported");
  if (!MediaSource.isTypeSupported(descriptor.audio.mimeType)) throw new Error("audio_unsupported");
  const client = new SabrWebSocketClient(toWebSocketUrl(descriptor.endpoints.webSocket));
  await client.connect();
  return { descriptor, client };
}

export async function connectActiveSabrSession(
  descriptorUrl: string,
  playerTimeMs: number,
  active: () => boolean,
): Promise<SabrSessionConnection> {
  const connection = await connectSabrSession(descriptorUrl, playerTimeMs);
  if (active()) return connection;
  connection.client.close();
  throw new Error("sabr_generation_stale");
}
