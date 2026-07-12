# CONTEXT.md — Recent Changes & Agent Handoff Notes

> **Purpose:** Quick reference for AI agents picking up this project. Shows what changed recently and what state everything is in.

---

## Current State — July 2026

### Latest Feature: Cloud LLaMA Provider
**What was added:** A free, no-key-required cloud LLM provider called `cloud-llama`.  
**How it works:** Next.js server-side API route at `/api/llm/generate` proxies Groq's free API using `GROQ_API_KEY` from the `.env` file. The key never leaves the server or is exposed in the browser.  
**Model used:** `llama-3.3-70b-versatile` (131K context, best free-class open model on Groq).

### Files Changed
| File | Change |
|------|--------|
| `src/app/api/llm/generate/route.ts` | **NEW** — Server-side API route that reads `.env` GROQ_API_KEY, builds prompt via `buildPrompt()`, calls Groq, returns `{ answer }` |
| `src/types/index.ts` | Added `"cloud-llama"` to `LLMProvider` union |
| `src/hooks/useRAG.ts` | Added `case "cloud-llama"` in provider switch → calls `/api/llm/generate` |
| `src/hooks/useLLM.ts` | Added `case "cloud-llama"` with inline `generate()` that calls `/api/llm/generate` |
| `src/components/LLMConfigPanel.tsx` | Added `cloud-llama` to `PROVIDER_CONFIG`; hid API key/model inputs; added info box |
| `src/components/RetrievalPipeline.tsx` | Added `cloud-llama → "Cloud LLaMA (Groq)"` to `PROVIDER_LABEL` |
| `src/lib/llm/groq.ts` | Changed default model from `llama3-8b-8192` to `llama-3.3-70b-versatile` |
| `.env.example` | Added documentation comments for `GROQ_API_KEY` |
| `README.md` | Added Cloud LLaMA to "Switching to Cloud LLMs" section |
| `CLAUDE.md` | Updated architecture docs, provider list, conventions |

### Key Decision: Model Update
- `llama3-8b-8192` was decommissioned by Groq
- Replaced with `llama-3.3-70b-versatile` in BOTH `src/lib/llm/groq.ts` (for direct Groq users) AND the new API route
- Groq config models list in `LLMConfigPanel.tsx` updated to `["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]`

### How `cloud-llama` Differs from `groq` Provider
Both use Groq but in different ways:
- `groq` — User pastes their own API key into the UI (browser-only, sessionStorage)
- `cloud-llama` — No key needed from the user; server-side `GROQ_API_KEY` is used; client calls internal `/api/llm/generate` route

### Architecture Note
The `cloud-llama` provider **bypasses the class-based LLM pattern**. There's no `CloudLlamaLLM` class. Instead, `useRAG.ts` and `useLLM.ts` have direct `fetch()` calls to the API route. This is intentional design — no instance needed since the server holds the state.

---

## What's Next? (Open Items)
- Rate limiting: Groq free tier allows 30 RPM / 14,400 RPD. No client-side rate limiting yet.
- Error UX: When Groq returns 429, the error message is surfaced in the RAG pipeline error state — could be nicer.
- Model updates: Groq may add new models. Check https://console.groq.com/docs/models for current offerings.

---

## For Future AI Agents
If you're working on this project, read in this order:
1. `CLAUDE.md` — full architecture guide, folder map, conventions, constraints
2. `README.md` — what the app does, how to run it, user-facing docs
3. `CONTEXT.md` (this file) — most recent changes, open items, gotchas
4. `src/types/index.ts` — all shared interfaces
5. `src/hooks/useRAG.ts` — the actual pipeline logic
