"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ChunkingStrategy,
  LLMProvider,
  RetrievalResult,
  PipelineTiming,
  QueryHistoryEntry,
} from "@/types";
import { vectorStore } from "@/lib/vector-store/store";
import { reranker } from "@/lib/reranker/cross-encoder";
import { embedder } from "@/lib/embeddings/embedder";
import { LocalLLM } from "@/lib/llm/local";
import { OpenRouterLLM } from "@/lib/llm/openrouter";
import { OpenAILLM } from "@/lib/llm/openai";
import { GeminiLLM } from "@/lib/llm/gemini";
import { GroqLLM } from "@/lib/llm/groq";

function buildVariationHint(
  query: string,
  emotion: string | null,
  history: QueryHistoryEntry[]
): string | undefined {
  const normalized = query.trim().toLowerCase();
  const priorAttempts = history.filter(
    (h) => h.query.trim().toLowerCase() === normalized
  );
  if (priorAttempts.length === 0) return undefined;

  const sameEmotionBefore = priorAttempts.some((h) => h.emotion === emotion);
  return sameEmotionBefore
    ? "Provide a different perspective than before — draw on different aspects of the context rather than repeating the same points."
    : `Provide a different perspective than before, focusing on what resonates with a ${
        emotion || "general"
      } sentiment.`;
}

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
  const [preRerank, setPreRerank] = useState<RetrievalResult[]>([]);
  const [rerankedAll, setRerankedAll] = useState<RetrievalResult[]>([]);
  const [timing, setTiming] = useState<PipelineTiming | null>(null);
  const [history, setHistory] = useState<QueryHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const runRAG = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer("");
    setSources([]);
    setPreRerank([]);
    setRerankedAll([]);
    setTiming(null);

    const pipelineStart = performance.now();

    try {
      await vectorStore.loadIndex(strategy);

      setStatusMessage("Embedding query...");
      const embeddingStart = performance.now();
      await embedder.load();
      const queryEmbedding = await embedder.embed(query);
      const embeddingMs = performance.now() - embeddingStart;

      setStatusMessage("Retrieving chunks...");
      const retrievalStart = performance.now();
      const candidates = vectorStore.query(queryEmbedding, emotion, 20);
      const retrievalMs = performance.now() - retrievalStart;

      const preRerankResults: RetrievalResult[] = candidates.map((c) => ({
        chunk: c,
        cosineScore: c._score || 0,
      }));
      setPreRerank(preRerankResults);

      if (candidates.length === 0) {
        setAnswer("No relevant passages found for your query.");
        setSources([]);
        setIsLoading(false);
        return;
      }

      setStatusMessage("Re-ranking...");
      const rerankStart = performance.now();
      const { top: reranked, all: rerankedAll } = await reranker.rerank(
        query,
        candidates,
        5
      );
      const rerankingMs = performance.now() - rerankStart;

      setStatusMessage("Generating answer...");
      const generationStart = performance.now();

      const contextResults: RetrievalResult[] = reranked.map((r) => ({
        chunk: r.chunk,
        cosineScore: r.cosineScore,
        crossEncoderScore: r.crossEncoderScore,
      }));

      const variationHint = buildVariationHint(query, emotion, history);

      let generatedAnswer: string;

      switch (provider) {
        case "local": {
          const localLLM = new LocalLLM();
          await localLLM.load();
          generatedAnswer = await localLLM.generate(
            query,
            contextResults,
            emotion,
            variationHint
          );
          break;
        }
        case "openai": {
          if (!apiKey) throw new Error("API key required for OpenAI");
          generatedAnswer = await new OpenAILLM(apiKey).generate(
            query,
            contextResults,
            emotion,
            variationHint
          );
          break;
        }
        case "openrouter": {
          if (!apiKey) throw new Error("API key required for OpenRouter");
          generatedAnswer = await new OpenRouterLLM(apiKey).generate(
            query,
            contextResults,
            emotion,
            variationHint
          );
          break;
        }
        case "gemini": {
          if (!apiKey) throw new Error("API key required for Gemini");
          generatedAnswer = await new GeminiLLM(apiKey).generate(
            query,
            contextResults,
            emotion,
            variationHint
          );
          break;
        }
        case "groq": {
          if (!apiKey) throw new Error("API key required for Groq");
          generatedAnswer = await new GroqLLM(apiKey).generate(
            query,
            contextResults,
            emotion,
            variationHint
          );
          break;
        }
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      const generationMs = performance.now() - generationStart;
      const totalMs = performance.now() - pipelineStart;
      const finalTiming: PipelineTiming = {
        embeddingMs,
        retrievalMs,
        rerankingMs,
        generationMs,
        totalMs,
      };

      setAnswer(generatedAnswer);
      setSources(reranked);
      setRerankedAll(rerankedAll);
      setTiming(finalTiming);

      setHistory((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          query,
          emotion,
          strategy,
          provider,
          answer: generatedAnswer,
          sources: reranked,
          preRerank: preRerankResults,
          rerankedAll,
          timing: finalTiming,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("RAG pipeline error:", err);
      setError(`${msg}`);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  }, [query, strategy, emotion, provider, apiKey, history]);

  return {
    answer,
    sources,
    preRerank,
    rerankedAll,
    timing,
    history,
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
