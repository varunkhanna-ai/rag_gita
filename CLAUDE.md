# CLAUDE.md — Emotion-Aware RAG

## Project summary
Emotion-Aware RAG app built with Next.js 14 + TypeScript. Retrieves passages from local documents (PDF/MD) and answers questions with emotion-aware filtering. Runs fully client-side using Transformers.js (embeddings + reranking + optional local LLM) — no API key required. Optional cloud LLM providers (OpenAI, OpenRouter, Gemini, Groq) can be enabled with a user-supplied key stored in sessionStorage only. **Cloud LLaMA** provides a free, server-side proxied Groq option using `llama-3.3-70b-versatile` — no client-side API key needed, just set `GROQ_API_KEY` in `.env` on the server. Beyond answering, the UI doubles as a RAG *learning tool*: it exposes pipeline timing, before/after re-ranking, an emotion heatmap, and chunk-level metrics so a user can see why a given passage was retrieved.

## Architecture at a glance
```
Documents (PDF/MD) → Parsers → Chunking (3 strategies)
  → Embeddings (Xenova/all-MiniLM-L6-v2) → Vector Store (JSON index)
  → Query (preset or custom) → Retrieval (cosine top-20) → Re-rank (cross-encoder, full 20 + top-5)
  → LLM (local, API, or Cloud LLaMA server proxy, emotion-toned prompt) → Answer + Sources + Pipeline/Timing visualizations
```

## Folder map
- `src/app/api/llm/generate/` — Next.js server-side API route that proxies Groq for the Cloud LLaMA provider (reads `GROQ_API_KEY` from env)
- `src/app/` — Next.js App Router pages and layout
- `src/components/` — React UI components. Core: EmotionSelector, StrategySelector, QueryInput, QueryModeToggle, AnswerDisplay, SourcePanel, LLMConfigPanel. Learning-tool visualizations: RetrievalPipeline, RerankingComparison, EmotionHeatmap, PerformanceStats, ResponseHistory, ChunkingComparison
- `src/components/ui/` — shadcn/ui primitives
- `src/components/HomeClient.tsx` — actual page composition (rendered by `src/app/page.tsx` via a `ssr: false` dynamic import, since Transformers.js needs the browser)
- `src/hooks/` — Custom React hooks (useRAG, useEmbeddings, useLLM)
- `src/lib/parsers/` — PDF and Markdown document parsers (Node-only — read via `fs`, used by `build-index.ts`)
- `src/lib/chunking/` — 3 chunking strategies (simple, fixed-parent-child, recursive-parent-child)
- `src/lib/embeddings/` — Transformers.js embedding wrapper
- `src/lib/vector-store/` — In-memory JSON-backed vector store (`store.ts`) + build-time stats fetcher (`stats.ts`)
- `src/lib/reranker/` — Cross-encoder re-ranking via Transformers.js
- `src/lib/llm/` — LLM providers (local, OpenAI, OpenRouter, Gemini, Groq) + shared `prompt.ts` builder. NOTE: GroqLLM now defaults to `llama-3.3-70b-versatile` (the old `llama3-8b-8192` is decommissioned)
- `src/lib/emotion/` — Emotion tags/colors/filter utilities, incl. keyword-strength scoring for the heatmap
- `src/lib/presets.ts` — Canned example questions shown in "Preset Filter" mode
- `src/lib/utils/` — Math utilities (cosine similarity, etc.)
- `src/types/` — Shared TypeScript interfaces and types
- `scripts/` — Build scripts (build-index.ts)
- `.github/workflows/` — CI/CD for Vercel deployment

## Key files
| File | Purpose |
|------|---------|
| `scripts/build-index.ts` | Pre-processes documents into vector index JSON files + `public/index/stats.json` |
| `src/app/api/llm/generate/route.ts` | Server-side API route for Cloud LLaMA provider; proxies Groq using server-side `GROQ_API_KEY` |
| `src/lib/vector-store/store.ts` | Runtime vector store: loads index, runs cosine queries |
| `src/hooks/useRAG.ts` | Orchestrates full RAG pipeline (embed → retrieve → rerank → generate), tracks per-step timing and query history |
| `src/lib/emotion/tags.ts` | Defines 8 emotions with colors, icons, descriptions |
| `src/lib/emotion/filter.ts` | Keyword-based emotion extraction/tagging + heatmap strength scoring |
| `src/components/HomeClient.tsx` | Main dashboard composing all UI components |
| `src/types/index.ts` | Core interfaces: Chunk, RetrievalResult, PipelineTiming, QueryHistoryEntry, IndexStats, **LLMProvider union includes `"cloud-llama"`** |

## Data flow for a query
1. Load pre-built JSON index for selected chunking strategy
2. Embed user query using all-MiniLM-L6-v2 (timed)
3. Filter candidate chunks by selected emotion tag
4. Cosine similarity top-20 retrieval from vector store (timed; kept as `preRerank` for the before/after comparison)
5. Cross-encoder (ms-marco-MiniLM) re-rank of all 20, keeping both the full list (`rerankedAll`) and top-5 (`sources`) (timed)
6. Generate answer via selected LLM provider with top-5 context, an emotion-specific tone, and — if the same question was asked before — a variation hint so the answer doesn't repeat itself (timed)
7. All step timings + the query/answer/sources are appended to in-memory history for the Performance Stats and Response History panels

## LLM Provider types (as of current implementation)
- `local` — Transformers.js, runs in browser, no key needed
- `openai` — User supplies API key via sessionStorage
- `openrouter` — User supplies API key via sessionStorage
- `gemini` — User supplies API key via sessionStorage
- `groq` — User supplies API key via sessionStorage (uses `llama-3.3-70b-versatile`)
- `cloud-llama` — No client key needed; calls `/api/llm/generate` server route which proxies Groq using `GROQ_API_KEY` from `.env`

## Conventions
- TypeScript strict mode throughout
- Path alias `@/*` → `src/*`
- All chunking strategies must call `tagChunksWithEmotions` before returning
- All LLM provider classes implement `generate(query, contextChunks, emotion, variationHint?)` and build their prompt via `src/lib/llm/prompt.ts`'s `buildPrompt` (don't hand-roll prompt strings per provider)
- `reranker.rerank()` returns `{ top, all }` — `all` must be kept for the before/after re-ranking UI, don't discard it
- API keys stored in sessionStorage only, never sent to our server
- The `cloud-llama` provider bypasses the class pattern — it calls the API route directly via `fetch()` instead of instantiating an LLM class

## Where things live
- Index files are build artifacts at `public/index/*.json`, regenerated via `npm run build-index`
- Source documents live in `public/documents/` — not read at runtime in production
- For deployment, `public/index/*.json` must be committed (they are what the deployed app reads)
- `.env` must contain `GROQ_API_KEY` for Cloud LLaMA to work (gitignored — set in Vercel env vars for production)

## What NOT to do
- Do not commit API keys or `.env` files
- Do not hardcode a specific LLM provider as required
- Do not remove the "local" no-key-required default path
- Do not require any paid API for basic functionality
- Do not use decommissioned Groq models (`llama3-8b-8192` is dead; use `llama-3.3-70b-versatile`)

## How to extend
- **New emotion**: Update `EMOTIONS`, `EMOTION_COLORS`, `EMOTION_ICONS`, `EMOTION_DESCRIPTIONS`, and keyword map in `filter.ts`
- **New chunking strategy**: Add file in `src/lib/chunking/`, register type in `ChunkingStrategy`, add build step in `scripts/build-index.ts` (including the `STRATEGY_OVERLAP` stats entry), add card in `StrategySelector.tsx`
- **New LLM provider**: Add class in `src/lib/llm/` with a `generate(query, contextChunks, emotion, variationHint?)` method that calls `buildPrompt` from `./prompt`, register in `LLMProvider` type and `LLMConfigPanel`'s `PROVIDER_CONFIG`. For server-side proxy providers (like `cloud-llama`), no class needed — just add a fetch call in `useRAG.ts` and `useLLM.ts`
- **New preset questions**: Add to `PRESET_QUESTIONS` (or `GENERIC_PRESET_QUESTIONS`) in `src/lib/presets.ts`
