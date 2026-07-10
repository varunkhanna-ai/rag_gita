import { IndexStats } from "@/types";

let cached: IndexStats | null = null;

export async function fetchIndexStats(): Promise<IndexStats> {
  if (cached) return cached;

  const response = await fetch("/index/stats.json");
  if (!response.ok) {
    throw new Error(`Failed to load index stats: HTTP ${response.status}`);
  }
  cached = (await response.json()) as IndexStats;
  return cached;
}
