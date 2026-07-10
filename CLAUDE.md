# CLAUDE.md — Emotion-Aware RAG

## Project summary
Emotion-Aware RAG app built with Next.js 14 + TypeScript. Retrieves passages from local documents (PDF/MD) and answers questions with emotion-aware filtering. Runs fully client-side using Transformers.js (embeddings + reranking + optional local LLM) — no API key required. Optional cloud LLM providers (OpenRouter, Gemini, Groq) can be enabled with a user-supplied key stored in sessionStorage only.

## Architecture at a glance
```
Documents (PDF/MD) → Parsers → Chunking (3 strategies)
  → Embeddings (Xenova/all-MiniLM-L6-v2) → Vector Store (JSON index)
  → Query → Retrieval (cosine top-20) → Re-rank (cross-encoder top-5)
  → LLM (local or API) → Answer + Sources
```

## Folder map
- `src/app/` — Next.js App Router pages and layout
- `src/components/` — React UI components (EmotionSelector, StrategySelector, QueryInput, AnswerDisplay, SourcePanel, LLMConfigPanel)
- `src/components/ui/` — shadcn/ui primitives
- `src/hooks/` — Custom React hooks (useRAG, useEmbeddings, useLLM)
- `src/lib/parsers/` — PDF and Markdown document parsers
- `src/lib/chunking/` — 3 chunking strategies (simple, fixed-parent-child, recursive-parent-child)
- `src/lib/embeddings/` — Transformers.js embedding wrapper
- `src/lib/vector-store/` — In-memory JSON-backed vector store
- `src/lib/reranker/` — Cross-encoder re-ranking via Transformers.js
- `src/lib/llm/` — LLM providers (local Phi-3, OpenRouter, Gemini, Groq)
- `src/lib/emotion/` — Emotion tags/colors/filter utilities
- `src/lib/utils/` — Math utilities (cosine similarity, etc.)
- `src/types/` — Shared TypeScript interfaces and types
- `scripts/` — Build scripts (build-index.ts)
- `.github/workflows/` — CI/CD for Vercel deployment

## Key files
| File | Purpose |
|------|---------|
| `scripts/build-index.ts` | Pre-processes documents into vector index JSON files |
| `src/lib/vector-store/store.ts` | Runtime vector store: loads index, runs cosine queries |
| `src/hooks/useRAG.ts` | Orchestrates full RAG pipeline (embed → retrieve → rerank → generate) |
| `src/lib/emotion/tags.ts` | Defines 8 emotions with colors, icons, descriptions |
| `src/lib/emotion/filter.ts` | Keyword-based emotion extraction and chunk filtering |
| `src/app/page.tsx` | Main dashboard composing all UI components |
| `src/types/index.ts` | Core interfaces: Chunk, RetrievalResult, EmotionTag, etc. |

## Data flow for a query
1. Load pre-built JSON index for selected chunking strategy
2. Embed user query using all-MiniLM-L6-v2
3. Filter candidate chunks by selected emotion tag
4. Cosine similarity top-20 retrieval from vector store
5. Cross-encoder (ms-marco-MiniLM) re-rank to top-5
6. Generate answer via selected LLM provider with top-5 context

## Conventions
- TypeScript strict mode throughout
- Path alias `@/*` → `src/*`
- All chunking strategies must call `tagChunksWithEmotions` before returning
- All LLM provider classes implement `generate(query, contextChunks, emotion)` signature
- API keys stored in sessionStorage only, never sent to our server

## Where things live
- Index files are build artifacts at `public/index/*.json`, regenerated via `npm run build-index`
- Source documents live in `public/documents/` — not read at runtime in production
- For deployment, `public/index/*.json` must be committed (they are what the deployed app reads)

## What NOT to do
- Do not commit API keys or `.env` files
- Do not hardcode a specific LLM provider as required
- Do not remove the "local" no-key-required default path
- Do not require any paid API for basic functionality

## How to extend
- **New emotion**: Update `EMOTIONS`, `EMOTION_COLORS`, `EMOTION_ICONS`, `EMOTION_DESCRIPTIONS`, and keyword map in `filter.ts`
- **New chunking strategy**: Add file in `src/lib/chunking/`, register type in `ChunkingStrategy`, add build step in `scripts/build-index.ts`, add card in `StrategySelector.tsx`
- **New LLM provider**: Add class in `src/lib/llm/`, register in `LLMProvider` type and `LLMConfigPanel`
