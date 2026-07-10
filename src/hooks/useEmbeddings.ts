"use client";

import { useState, useEffect, useCallback } from "react";
import { embedder } from "@/lib/embeddings/embedder";

export function useEmbeddings() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await embedder.load();
        if (!cancelled) {
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load embedding model"
          );
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const embedQuery = useCallback(async (text: string): Promise<number[]> => {
    return embedder.embed(text);
  }, []);

  return { embedder, isReady, error, embedQuery };
}
