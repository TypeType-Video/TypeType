function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomShuffleSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function applyCustomOrder<T extends { key: string }>(items: T[], order: string[]): T[] {
  const byKey = new Map(items.map((item) => [item.key, item]));
  const used = new Set(order);
  const ordered = order
    .map((key) => byKey.get(key))
    .filter((item): item is T => item !== undefined);
  return [...ordered, ...items.filter((item) => !used.has(item.key))];
}

export function shuffleByKey<T>(items: T[], key: string): T[] {
  const random = mulberry32(hashString(key));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const swap = result[i];
    result[i] = result[j];
    result[j] = swap;
  }
  return result;
}
