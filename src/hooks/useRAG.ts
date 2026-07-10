"use client";

import { useState, useCallback, useEffect } from "react";
import { ChunkingStrategy, LLMProvider, RetrievalResult } from "@/types";
import { vectorStore } from "@/lib/vector-store/store";
import { reranker } from "@/lib/reranker/cross-encoder";
import { embedder } from "@/lib/embeddings/embedder";
import { LocalLLM } from "@/lib/llm/local";
import { OpenRouterLLM } from "@/lib/llm/openrouter";
import { OpenAILLM } from "@/lib/llm/openai";
import { GeminiLLM } from "@/lib/llm/gemini";
import { GroqLLM } from "@/lib/llm/groq";

export function useRAG() {
  const [strategy, setStrategy] =
    useState<ChunkingStrategy>("simple");
  const [emotion, setEmotion] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<LLMProvider>("local");
  const [apiKey, setApiKeyInner] = useState("");

  useEffect(() => {
    const savedProvider = sessionStorage.getItem("emotion-rag-provider");
    if (savedProvider) setProvider(savedProvider as LLMProvider);
    const savedKey = sessionStorage.getItem(`emotion-rag-api-key-${savedProvider || provider}`);
    if (savedKey) setApiKeyInner(savedKey);
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyInner(key);
  }, []);

  const setProviderWithStorage = useCallback((p: LLMProvider) => {
    sessionStorage.setItem("emotion-rag-provider", p);
    const savedKey = sessionStorage.getItem(`emotion-rag-api-key-${p}`);
    setApiKeyInner(savedKey || "");
    setProvider(p);
  }, []);

  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<RetrievalResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const runRAG = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer("");
    setSources([]);

    try {
      await vectorStore.loadIndex(strategy);

      setStatusMessage("Embedding query...");
      await embedder.load();
      const queryEmbedding = await embedder.embed(query);

      setStatusMessage("Retrieving chunks...");
      const candidates = vectorStore.query(queryEmbedding, emotion, 20);

      if (candidates.length === 0) {
        setAnswer("No relevant passages found for your query.");
        setSources([]);
        setIsLoading(false);
        return;
      }

      setStatusMessage("Re-ranking...");
      const reranked = await reranker.rerank(query, candidates, 5);

      setStatusMessage("Generating answer...");

      const contextResults: RetrievalResult[] = reranked.map((r) => ({
        chunk: r.chunk,
        cosineScore: r.cosineScore,
        crossEncoderScore: r.crossEncoderScore,
      }));

      let generatedAnswer: string;

      switch (provider) {
        case "local": {
          const localLLM = new LocalLLM();
          await localLLM.load();
          generatedAnswer = await localLLM.generate(
            query,
            contextResults,
            emotion
          );
          break;
        }
        case "openai": {
          if (!apiKey) throw new Error("API key required for OpenAI");
          generatedAnswer = await new OpenAILLM(apiKey).generate(
            query,
            contextResults,
            emotion
          );
          break;
        }
        case "openrouter": {
          if (!apiKey) throw new Error("API key required for OpenRouter");
          generatedAnswer = await new OpenRouterLLM(apiKey).generate(
            query,
            contextResults,
            emotion
          );
          break;
        }
        case "gemini": {
          if (!apiKey) throw new Error("API key required for Gemini");
          generatedAnswer = await new GeminiLLM(apiKey).generate(
            query,
            contextResults,
            emotion
          );
          break;
        }
        case "groq": {
          if (!apiKey) throw new Error("API key required for Groq");
          generatedAnswer = await new GroqLLM(apiKey).generate(
            query,
            contextResults,
            emotion
          );
          break;
        }
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      setAnswer(generatedAnswer);
      setSources(reranked);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("RAG pipeline error:", err);
      setError(`${msg}`);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  }, [query, strategy, emotion, provider, apiKey]);

  return {
    answer,
    sources,
    isLoading,
    error,
    statusMessage,
    runRAG,
    strategy,
    setStrategy,
    emotion,
    setEmotion,
    query,
    setQuery,
    provider,
    setProvider: setProviderWithStorage,
    apiKey,
    setApiKey,
  };
}
