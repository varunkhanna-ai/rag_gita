"use client";

import { useState, useCallback, useEffect } from "react";
import { LLMProvider, RetrievalResult } from "@/types";
import { LocalLLM } from "@/lib/llm/local";
import { OpenRouterLLM } from "@/lib/llm/openrouter";
import { GeminiLLM } from "@/lib/llm/gemini";
import { GroqLLM } from "@/lib/llm/groq";

interface LLMInstance {
  generate(
    query: string,
    contextChunks: RetrievalResult[],
    emotion: string | null
  ): Promise<string>;
  isReady?: () => boolean;
  load?: () => Promise<void>;
}

export function useLLM(provider: LLMProvider, apiKey?: string) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [llm, setLlm] = useState<LLMInstance | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsReady(false);
      setError(null);
      setIsLoading(true);

      try {
        let instance: LLMInstance;

        switch (provider) {
          case "local":
            instance = new LocalLLM();
            await (instance as LocalLLM).load();
            break;
          case "openrouter":
            if (!apiKey) throw new Error("API key required for OpenRouter");
            instance = new OpenRouterLLM(apiKey);
            break;
          case "gemini":
            if (!apiKey) throw new Error("API key required for Gemini");
            instance = new GeminiLLM(apiKey);
            break;
          case "groq":
            if (!apiKey) throw new Error("API key required for Groq");
            instance = new GroqLLM(apiKey);
            break;
          default:
            throw new Error(`Unknown provider: ${provider}`);
        }

        if (!cancelled) {
          setLlm(instance);
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to init LLM");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [provider, apiKey]);

  const generate = useCallback(
    async (
      query: string,
      chunks: RetrievalResult[],
      emotion: string | null
    ): Promise<string> => {
      if (!llm) throw new Error("LLM not initialized");
      return llm.generate(query, chunks, emotion);
    },
    [llm]
  );

  return { generate, isReady, error, isLoading };
}
