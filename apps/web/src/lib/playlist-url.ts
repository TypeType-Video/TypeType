export function playlistListId(url: string): string | null {
  try {
    return new URL(url).searchParams.get("list");
  } catch {
    return null;
  }
}
