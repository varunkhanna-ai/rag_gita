# Kilo Code Implementation Plan — Emotion-Aware RAG

> **Target:** VS Code + Kilo Code Extension
> **Local repo:** `/Users/varunmacbook15/Desktop/project/emotion-rag`
> **Remote repo:** `git@github.com:varunkhanna-ai/rag_gita.git`
> **Deploy:** Local build/test first → GitHub → Vercel
> **Documents:** `/Users/varunmacbook15/Desktop/project/Documents for RAG/` (PDF + MD)
> **Cost:** Zero mandatory API keys. All embedding/retrieval/re-ranking runs free and local via Transformers.js. API-based LLM providers (OpenRouter/Gemini/Groq) are optional extras only.

---

## Quick Start (Do These Steps First)

### Step 1: Create Project
```bash
cd /Users/varunmacbook15/Desktop/project/
npx create-next-app@14 emotion-rag --typescript --tailwind --app --no-src-dir
cd emotion-rag
```

### Step 2: Install Dependencies
```bash
npm install pdfjs-dist marked gray-matter @xenova/transformers lucide-react zustand
npm install -D @types/node @types/react @types/pdfjs-dist ts-node
```

### Step 3: Copy Documents
```bash
mkdir -p public/documents
cp -R "/Users/varunmacbook15/Desktop/project/Documents for RAG/"/* public/documents/
```
Verify the copy worked before continuing:
```bash
ls -la public/documents/
```

### Step 4: Initialize shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge select textarea collapsible table alert skeleton radio-group
```

### Step 5: Create Folder Structure
```bash
mkdir -p src/{app,components/ui,lib/{parsers,chunking,embeddings,vector-store,reranker,llm,emotion,utils},types,hooks} scripts .github/workflows
```

### Step 6: Connect to the GitHub Repository
Do this now, before generating files, so every commit from here on lands in the right remote.
```bash
git init
git remote add origin git@github.com:varunkhanna-ai/rag_gita.git
git branch -M main
```
If the remote already has commits (e.g. a README created on GitHub), reconcile before your first push:
```bash
git pull origin main --allow-unrelated-histories
```

---

## How to Use This Plan (Autonomous Mode)

You do **not** need to copy/paste each prompt individually. Give Kilo Code this whole file **once** and let it execute all 39 file specs (Prompt 0 through Prompt 38) on its own, in order.

### Setup
1. Open the project folder in VS Code (after running Quick Start Steps 1–6 above, or let Kilo Code run those shell commands too — see the instruction below).
2. Open the Kilo Code panel.
3. Switch Kilo Code into an **agentic/autonomous mode** (in Kilo Code this is usually **Orchestrator** mode, or **Code** mode with "auto-approve" turned on for file writes and terminal commands). This lets it create files and run commands without asking you to confirm every single action.
4. Paste the **Master Instruction** block below as your first message to Kilo Code. It tells Kilo Code to treat this entire markdown file as its task list and work through it unattended.
5. Let it run. Check in periodically — it will stop and ask if it hits something ambiguous (e.g. a missing SSH key, a failed `npm install`), which is expected and fine.

### Master Instruction (paste this once into Kilo Code)

```
You are implementing the project described in this file, kilo-code-implementation-plan.md,
which is open in this workspace. Read the entire file first.

Then execute it autonomously, without asking me to paste further prompts:

1. Run the "Quick Start" shell commands in order (project scaffold, dependencies,
   copying documents, shadcn/ui init, folder structure, git remote setup).
2. Go through PROMPT 0 through PROMPT 38 in order. Each one specifies a single
   file to create (path is given under **File:**) and a **KILO PROMPT:** block
   describing exactly what that file should contain. Generate each file to spec
   before moving to the next — later files import from earlier ones, so do not
   skip ahead or reorder them.
3. After PROMPT 38, follow the "Build & Deploy Steps" section: run `npm run dev`
   and sanity-check it starts, run `npm run build-index` and confirm
   public/index/ contains the 3 JSON files plus emotion-map.json, then run
   `npm run build` and fix any TypeScript or build errors yourself until it
   passes cleanly.
4. Once the local build is clean, follow the git steps in that same section:
   stage and commit the generated index files, commit everything else, and
   push to the `origin` remote (already configured as
   git@github.com:varunkhanna-ai/rag_gita.git). If the push fails because SSH
   isn't set up, stop and tell me rather than switching remotes or credentials
   yourself.
5. Do not ask me to confirm each file — only pause and ask me if you hit a
   genuine ambiguity, a failing command you can't resolve after retrying, or
   a step that requires a credential/secret from me (e.g. Vercel login,
   GitHub SSH key, an optional LLM API key).
6. When finished, give me a summary: what was created, whether the build
   passed, whether the push succeeded, and any manual step still needed on my
   end (e.g. connecting the repo on vercel.com, which requires my browser login
   and can't be automated by you).

Work through this end to end now, starting with the Quick Start commands.
```

### Notes on autonomy limits
- **Vercel connection (Step 6 of Build & Deploy)** genuinely can't be automated by Kilo Code — it requires you to log into vercel.com in a browser and click "Import Project." Everything up to and including the GitHub push can be autonomous; this last step is manual by necessity.
- **GitHub SSH auth** also can't be generated by Kilo Code on your behalf. If `git push` fails with a permission error, you'll need to add an SSH key to your GitHub account first (or tell Kilo Code to switch the remote to HTTPS and use a personal access token instead).
- If Kilo Code's agent mode has a "max steps" or "auto-approve" limit in your settings, raise it before starting — 39 file generations plus shell commands is a long unattended run.
- You can still reference individual **PROMPT N** sections below manually if you ever want Kilo Code to regenerate or fix just one file.

---

## PROMPT 0: CLAUDE.md (project context file)

**File:** `CLAUDE.md`

**Why this comes first:** Once the codebase exists, any AI assistant (Claude, Kilo Code, etc.) reviewing or extending it should be able to read one short file instead of scanning the whole repo. This keeps future review/edit sessions cheap on tokens.

**KILO PROMPT:**
Generate a `CLAUDE.md` file at the project root that acts as a condensed map of the codebase for an AI assistant, so it doesn't need to read every file to understand the project. Include these sections, kept concise (bullet points, no filler):

- **Project summary** (2-3 sentences): Emotion-Aware RAG app built with Next.js 14 + TypeScript. Retrieves passages from local documents (PDF/MD) and answers questions with emotion-aware filtering. Runs fully client-side using Transformers.js (embeddings + reranking + optional local LLM) — no API key required. Optional cloud LLM providers (OpenRouter, Gemini, Groq) can be enabled with a user-supplied key stored in sessionStorage only.
- **Architecture at a glance**: a short ASCII or bullet pipeline diagram: Documents (PDF/MD) → Parsers → Chunking (3 strategies) → Embeddings (Xenova/all-MiniLM-L6-v2) → Vector Store (JSON index) → Query → Retrieval (cosine top-20) → Re-rank (cross-encoder top-5) → LLM (local or API) → Answer + Sources.
- **Folder map**: one line per top-level folder under `src/` and `scripts/` explaining its purpose (parsers, chunking, embeddings, vector-store, reranker, llm, emotion, utils, components, hooks, app).
- **Key files table**: file path | one-line purpose, for: `scripts/build-index.ts`, `src/lib/vector-store/store.ts`, `src/hooks/useRAG.ts`, `src/lib/emotion/tags.ts`, `src/lib/emotion/filter.ts`, `src/app/page.tsx`, `src/types/index.ts`.
- **Data flow for a query**: numbered list of the 6 runtime steps (load index → embed query → filter by emotion → cosine top-20 → cross-encoder rerank top-5 → generate answer).
- **Conventions**: TypeScript strict mode, path alias `@/*` → `src/*`, all chunking strategies must call `tagChunksWithEmotions` before returning, all LLM provider classes implement the same `generate(query, contextChunks, emotion)` signature.
- **Where things live**: index files are gitignored build artifacts at `public/index/*.json`, regenerated via `npm run build-index`; source documents live in `public/documents/` (copied from the user's local Documents for RAG folder — see `.gitignore` for what's excluded from commits).
- **What NOT to do**: don't commit API keys or `.env`; don't hardcode a specific LLM provider as required; don't remove the "local" no-key-required default path.
- **How to extend**: adding a new emotion → update `EMOTIONS`, `EMOTION_COLORS`, `EMOTION_ICONS`, `EMOTION_DESCRIPTIONS`, and the keyword map in `filter.ts`. Adding a new chunking strategy → add file in `src/lib/chunking/`, register its type in `ChunkingStrategy`, add a build step in `scripts/build-index.ts`, add a card in `StrategySelector.tsx`.

Keep the whole file under ~150 lines so it stays cheap to load into context. Do not restate full code — this is a map, not documentation of implementation details.

---

## PROMPT 1: package.json

**File:** `package.json`

**KILO PROMPT:**
Generate a `package.json` for a Next.js 14 project called `emotion-rag`. Include these dependencies: next@14, react, react-dom, typescript, tailwindcss, pdfjs-dist, marked, gray-matter, @xenova/transformers, lucide-react, zustand. Include devDependencies: @types/node, @types/react, @types/pdfjs-dist, ts-node. Set scripts: dev ("next dev"), build ("next build"), start ("next start"), lint ("next lint"), and a custom build-index script ("ts-node scripts/build-index.ts"). Set the project version to 1.0.0, private to true, and use the MIT license.

---

## PROMPT 2: tsconfig.json

**File:** `tsconfig.json`

**KILO PROMPT:**
Generate a `tsconfig.json` for Next.js 14 with strict mode enabled. Include path aliases: `@/*` maps to `./src/*`. Enable esModuleInterop, skipLibCheck, and forceConsistentCasingInFileNames. Target ES2020. Set module to ESNext and moduleResolution to bundler. Include the Next.js types in the include array. Add a ts-node section with compilerOptions module set to CommonJS for the build script.

---

## PROMPT 3: tailwind.config.ts

**File:** `tailwind.config.ts`

**KILO PROMPT:**
Generate a `tailwind.config.ts` that extends the default Next.js Tailwind setup. Add custom colors for emotions: happy (amber-500), peace (teal-500), sad (slate-500), protection (indigo-500), anxiety (rose-500), laziness (stone-500), anger (red-500), loneliness (violet-500). Add a custom fontFamily for sans using the system font stack (ui-sans-serif, system-ui, -apple-system, etc.). Add a custom animation for typing effect called typewriter. Set content to include all src files.

---

## PROMPT 4: next.config.js

**File:** `next.config.js`

**KILO PROMPT:**
Generate a `next.config.js` for Next.js 14 with output set to 'export' for static export, images unoptimized set to true. Add webpack config to handle .node files for @xenova/transformers by setting node to false in resolve.fallback. Export the config as a CommonJS module. Add trailingSlash true for static export compatibility.

---

## PROMPT 5: vercel.json

**File:** `vercel.json`

**KILO PROMPT:**
Generate a `vercel.json` with buildCommand set to "next build" and outputDirectory set to ".next". Add framework set to "nextjs". Add installCommand set to "npm install".

---

## PROMPT 6: .env.example

**File:** `.env.example`

**KILO PROMPT:**
Generate a `.env.example` file with OPTIONAL API keys only: OPENROUTER_API_KEY, GEMINI_API_KEY, GROQ_API_KEY. Add a comment at the top explaining these are completely optional and only needed if the user wants to use API-based LLMs instead of the free local browser-based model. Add another comment explaining that the default local model requires no API key and runs entirely in the browser.

---

## PROMPT 7: .gitignore

**File:** `.gitignore`

**KILO PROMPT:**
Generate a `.gitignore` that ignores: node_modules, .next, out, .env, .env.local, *.log, public/index/*.json (the generated vector indices, which are rebuilt from source documents via `npm run build-index`), and OS files like .DS_Store and Thumbs.db. Also ignore .vercel and any .local files. Add a commented-out line `# public/documents/*.pdf` with a note that the user can uncomment it if their source PDFs are large or shouldn't be committed to GitHub — in that case Vercel's build step won't have the documents, so the `public/index/*.json` files must be committed instead (remove them from the ignore list) since they're what the deployed app actually reads at runtime.

---

## PROMPT 8: .github/workflows/deploy.yml

**File:** `.github/workflows/deploy.yml`

**KILO PROMPT:**
Generate a GitHub Actions workflow file `.github/workflows/deploy.yml` that triggers on push to main. It should checkout the repo, setup Node.js 18, install dependencies, build the Next.js app, and deploy to Vercel using the vercel-action. Include a comment that the user needs to add VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID as GitHub secrets. Use actions/checkout@v4 and actions/setup-node@v4.

---

## PROMPT 9: src/types/index.ts

**File:** `src/types/index.ts`

**KILO PROMPT:**
Generate TypeScript interfaces for this RAG system:
- Chunk interface with fields: id (string), text (string), parentId (optional string), parentText (optional string), sourceFile (string), pageNumber (optional number), heading (optional string), emotions (string[]), embedding (optional number[]), and _score (optional number for runtime).
- RetrievalResult interface with fields: chunk (Chunk), cosineScore (number), crossEncoderScore (optional number).
- EmotionTag type that is a union of: "Happy" | "Peace" | "Sad" | "Protection" | "Anxiety" | "Laziness" | "Anger" | "Loneliness".
- ChunkingStrategy type that is a union of: "simple" | "fixed-parent-child" | "recursive-parent-child".
- LLMProvider type that is a union of: "local" | "openrouter" | "gemini" | "groq".
- ParsedDocument interface with fields: text (string), sourceFile (string), pageNumber (optional number), heading (optional string), frontmatter (optional Record<string, any>).
Export all types.

---

## PROMPT 10: src/lib/utils/math.ts

**File:** `src/lib/utils/math.ts`

**KILO PROMPT:**
Generate a utility module with:
- cosineSimilarity(a: number[], b: number[]): number — computes cosine similarity between two vectors.
- dotProduct(a: number[], b: number[]): number — computes dot product.
- magnitude(v: number[]): number — computes vector magnitude.
- normalize(v: number[]): number[] — L2-normalizes a vector.
All functions should validate that vectors are the same length and throw descriptive errors if not. Export all functions.

---

## PROMPT 11: src/lib/emotion/tags.ts

**File:** `src/lib/emotion/tags.ts`

**KILO PROMPT:**
Generate a module that exports:
- EMOTIONS array containing all 8 emotion strings: "Happy", "Peace", "Sad", "Protection", "Anxiety", "Laziness", "Anger", "Loneliness".
- EMOTION_COLORS record mapping each emotion to a Tailwind color class string (e.g., Happy → "bg-amber-100 text-amber-800 border-amber-300", Peace → "bg-teal-100 text-teal-800 border-teal-300", etc.).
- EMOTION_ICONS record mapping each emotion to a lucide-react icon name string (e.g., Happy → "Smile", Peace → "Heart", Sad → "Frown", Protection → "Shield", Anxiety → "AlertCircle", Laziness → "Moon", Anger → "Flame", Loneliness → "UserX").
- EMOTION_DESCRIPTIONS record mapping each emotion to a short description string explaining what the emotion means in this context (e.g., Anxiety → "Feeling worried, nervous, or uneasy about something with an uncertain outcome").

---

## PROMPT 12: src/lib/emotion/filter.ts

**File:** `src/lib/emotion/filter.ts`

**KILO PROMPT:**
Generate a module that exports:
- extractEmotionsFromText(text: string): string[] — scans text for emotion keywords and returns matching emotions from the EMOTIONS array. Use keyword mapping: fear/worry/nervous/anxious/stressed → Anxiety; joy/glad/cheerful/happy/delighted → Happy; calm/serene/tranquil/peaceful → Peace; alone/isolated/lonely/abandoned → Loneliness; angry/furious/rage/irritated → Anger; lazy/tired/unmotivated/lethargic → Laziness; sad/grief/sorrow/melancholy → Sad; safe/guard/protect/secure → Protection. Return unique emotions only.
- filterByEmotion(chunks: Chunk[], emotion: string | null): Chunk[] — if emotion is null, returns all chunks; otherwise returns chunks whose emotions array includes the given emotion.
- tagChunksWithEmotions(chunks: Chunk[]): Chunk[] — iterates over all chunks and populates the emotions field using extractEmotionsFromText on each chunk's text. Returns the modified chunks.
Import Chunk from @/types and EMOTIONS from ./tags.

---

## PROMPT 13: src/lib/parsers/pdf.ts

**File:** `src/lib/parsers/pdf.ts`

**KILO PROMPT:**
Generate a PDF parser module using pdfjs-dist (imported as pdfjsLib from 'pdfjs-dist').
- Export parsePDF(filePath: string): Promise<ParsedDocument[]> that reads the PDF file as an ArrayBuffer, loads it with pdfjsLib.getDocument({ data: arrayBuffer }), extracts text page by page using page.getTextContent(), and returns an array of ParsedDocument objects.
- Each page becomes one ParsedDocument with text being the concatenated text items, sourceFile being the filename, and pageNumber being the 1-based page number.
- Set the PDF worker path: pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js".
- Handle errors gracefully: if parsing fails, log the error and return an empty array.
- Import ParsedDocument from @/types.

---

## PROMPT 14: src/lib/parsers/markdown.ts

**File:** `src/lib/parsers/markdown.ts`

**KILO PROMPT:**
Generate a Markdown parser module using gray-matter and marked.
- Export parseMarkdown(filePath: string): Promise<ParsedDocument[]> that reads the MD file, extracts frontmatter with matter(fileContent), parses the body with marked.lexer() to get tokens.
- For each paragraph or text token, create a ParsedDocument with text being the token text, sourceFile being the filename, heading being the nearest preceding heading token's text, and frontmatter being the parsed frontmatter object.
- If frontmatter contains an emotions field (array or string), include it in the output by adding it to a metadata field.
- Handle errors gracefully: if parsing fails, log the error and return an empty array.
- Import ParsedDocument from @/types.

---

## PROMPT 15: src/lib/chunking/types.ts

**File:** `src/lib/chunking/types.ts`

**KILO PROMPT:**
Generate a chunking types module that:
- Re-exports Chunk and ParsedDocument from @/types.
- Defines ChunkingConfig interface with fields: parentChunkSize (number, default 1000), parentOverlap (number, default 200), childChunkSize (number, default 300), childOverlap (number, default 50), separators (string[], default ["\n\n", "\n", ". ", " ", ""]).
- Exports DEFAULT_CONFIG constant with the default values above.
- Export a helper type ChunkingFunction = (docs: ParsedDocument[], config?: Partial<ChunkingConfig>) => Chunk[].

---

## PROMPT 16: src/lib/chunking/simple-fixed.ts

**File:** `src/lib/chunking/simple-fixed.ts`

**KILO PROMPT:**
Generate a simple fixed-size chunking strategy.
- Export createSimpleFixedChunks(docs: ParsedDocument[], chunkSize: number = 500, overlap: number = 50): Chunk[].
- Flatten all document texts into one string separated by double newlines, then split by character count using a sliding window.
- Each chunk gets a unique UUID as id (use crypto.randomUUID() or a simple counter), text is the chunk content, sourceFile is the first document's filename (or "multiple" if spanning docs), no parentId.
- Call tagChunksWithEmotions on the result before returning.
- Import Chunk, ParsedDocument from ./types, tagChunksWithEmotions from @/lib/emotion/filter.

---

## PROMPT 17: src/lib/chunking/fixed-parent-child.ts

**File:** `src/lib/chunking/fixed-parent-child.ts`

**KILO PROMPT:**
Generate a Fixed-Size Parent-Child chunking strategy.
- Export createFixedParentChildChunks(docs: ParsedDocument[], config?: Partial<ChunkingConfig>): Chunk[].
- For each document:
  1. Split the full document text into parent chunks using fixed character size (default from config.parentChunkSize = 1000) with overlap (default from config.parentOverlap = 200). Each parent gets a parentId like "doc1_p0".
  2. Within each parent, split into child chunks using fixed character size (default from config.childChunkSize = 300) with overlap (default from config.childOverlap = 50). Each child gets an id like "doc1_p0_c0" and stores parentId referencing its parent, and parentText containing the full parent chunk text.
  3. Only child chunks are returned (these are what get embedded and indexed).
- Each child chunk's sourceFile is the document filename, pageNumber and heading are inherited from the parent if available.
- Call tagChunksWithEmotions on the result before returning.
- Import Chunk, ParsedDocument, ChunkingConfig, DEFAULT_CONFIG from ./types, tagChunksWithEmotions from @/lib/emotion/filter.
- Include detailed comments explaining the parent-child relationship: "Parent chunks provide broad context. Child chunks are the retrieval units. When a child is retrieved, its parentText provides additional context to the LLM."

---

## PROMPT 18: src/lib/chunking/recursive-parent-child.ts

**File:** `src/lib/chunking/recursive-parent-child.ts`

**KILO PROMPT:**
Generate a Recursive Parent-Child chunking strategy.
- Export createRecursiveParentChildChunks(docs: ParsedDocument[], config?: Partial<ChunkingConfig>): Chunk[].
- For each document:
  1. Split the full document text into parent chunks using recursive character splitting with separators ["\n\n", "\n", ". ", " ", ""]. Target parent size ~800 chars. Try the largest separator first; if chunk is still too big, try next smaller separator, recursively.
  2. Within each parent, recursively split into child chunks using the SAME separators. Target child size ~200 chars.
  3. Each child gets parentId (e.g., "doc1_p0") and parentText (full parent text).
  4. Only child chunks are returned for embedding/indexing.
- The recursive logic: given text and target size, try splitting by the first separator. For each resulting piece, if it's still larger than target size, recursively call the same function with the next separator. Continue until all pieces are small enough or no separators remain (in which case split by character count).
- Call tagChunksWithEmotions on the result before returning.
- Import Chunk, ParsedDocument, ChunkingConfig, DEFAULT_CONFIG from ./types, tagChunksWithEmotions from @/lib/emotion/filter.
- Include detailed comments explaining the recursive splitting algorithm.

---

## PROMPT 19: src/lib/embeddings/embedder.ts

**File:** `src/lib/embeddings/embedder.ts`

**KILO PROMPT:**
Generate an embedding module using @xenova/transformers.
- Create a singleton Embedder class that:
  - Loads the model 'Xenova/all-MiniLM-L6-v2' once via pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2').
  - Provides embed(text: string): Promise<number[]> that takes a single string, runs it through the pipeline, and returns the mean-pooled embedding vector (average across token embeddings). The pipeline returns an object with a data property that is a 2D array; average across the first dimension (tokens) to get a single vector.
  - Provides embedBatch(texts: string[]): Promise<number[][]> that embeds multiple texts in one call by joining them with a separator and running through the pipeline, or by calling embed for each text.
  - Normalizes all embeddings to unit length (L2 norm = 1) before returning by dividing each element by the vector's magnitude.
- Include an isReady(): boolean method and a load(): Promise<void> method that initializes the model.
- Handle errors gracefully with try/catch.
- Export the singleton as const embedder = new Embedder().

---

## PROMPT 20: src/lib/vector-store/store.ts

**File:** `src/lib/vector-store/store.ts`

**KILO PROMPT:**
Generate an in-memory vector store module.
- Create a VectorStore class that:
  - Has a chunks: Chunk[] array.
  - Has an async loadIndex(strategy: ChunkingStrategy): Promise<void> method that fetches /index/{strategy}.json (e.g., /index/simple.json) using fetch, parses the JSON, and populates chunks.
  - Has a query(queryEmbedding: number[], emotionFilter: string | null, topK: number = 20): Chunk[] method that:
    1. Filters chunks by emotion if emotionFilter is provided (check chunk.emotions.includes(emotionFilter)).
    2. Computes cosine similarity between queryEmbedding and each chunk's embedding using the cosineSimilarity function.
    3. Sorts by score descending and returns top topK.
  - Has an addChunks(chunks: Chunk[]): void method for build-time use.
- Import cosineSimilarity from @/lib/utils/math, Chunk, ChunkingStrategy from @/types.
- The store is a singleton: export const vectorStore = new VectorStore().

---

## PROMPT 21: src/lib/reranker/cross-encoder.ts

**File:** `src/lib/reranker/cross-encoder.ts`

**KILO PROMPT:**
Generate a re-ranking module using @xenova/transformers.
- Create a singleton CrossEncoderReranker class that:
  - Loads the model 'Xenova/cross-encoder/ms-marco-MiniLM-L-6-v2' via pipeline('text-classification', 'Xenova/cross-encoder/ms-marco-MiniLM-L-6-v2').
  - Provides an async load(): Promise<void> method to initialize the model.
  - Provides async rerank(query: string, candidates: Chunk[], topN: number = 5): Promise<RetrievalResult[]> that:
    1. For each candidate, creates a pair [query, candidate.text].
    2. Runs all pairs through the cross-encoder model. The pipeline takes an array of arrays [[query, text1], [query, text2], ...] and returns scores.
    3. Scores each candidate with the model's output score (the pipeline returns objects with a label and score; use the score).
    4. Sorts by cross-encoder score descending.
    5. Returns top topN as RetrievalResult[] with both cosineScore (from the input chunk's _score property) and crossEncoderScore.
  - Include an isReady(): boolean method.
- Handle model loading errors gracefully.
- Import Chunk, RetrievalResult from @/types.
- Export the singleton as const reranker = new CrossEncoderReranker().

---

## PROMPT 22: src/lib/llm/local.ts

**File:** `src/lib/llm/local.ts`

**KILO PROMPT:**
Generate a local LLM module using @xenova/transformers.
- Create a LocalLLM class that:
  - Loads a small instruct model 'Xenova/Phi-3-mini-4k-instruct' via pipeline('text-generation', 'Xenova/Phi-3-mini-4k-instruct').
  - Provides an async load(): Promise<void> method to initialize the model.
  - Provides async generate(query: string, contextChunks: RetrievalResult[], emotion: string | null): Promise<string> that:
    1. Builds a prompt string: "You are a wise, empathetic assistant. Use ONLY the following context to answer.\n\nContext:\n" + concatenated parent texts from contextChunks (use chunk.parentText || chunk.chunk.text) + "\n\nQuestion: " + query + "\nEmotion: " + (emotion || 'General') + "\n\nProvide a comforting, inspiring response that directly addresses the emotion. Keep it under 300 words."
    2. Runs the prompt through the model with max_new_tokens: 512, temperature: 0.7, do_sample: true.
    3. Returns the generated text (the pipeline returns an array of objects with generated_text; extract the text after the prompt).
  - Include an isReady(): boolean method.
  - Show a loading state since model download is large on first use; track this with a loaded boolean.
- Handle errors gracefully.
- Import RetrievalResult from @/types.

---

## PROMPT 23: src/lib/llm/openrouter.ts

**File:** `src/lib/llm/openrouter.ts`

**KILO PROMPT:**
Generate an OpenRouter API module.
- Create an OpenRouterLLM class that:
  - Takes apiKey: string and optional model: string (default: 'mistralai/mistral-7b-instruct:free') in constructor.
  - Provides async generate(query: string, contextChunks: RetrievalResult[], emotion: string | null): Promise<string> that:
    1. Builds the same prompt as the local LLM (use context chunks' parentText or text, include emotion).
    2. Sends a POST request to https://openrouter.ai/api/v1/chat/completions with headers: Authorization: Bearer {apiKey}, Content-Type: application/json, and HTTP-Referer: https://emotion-rag.vercel.app (or a placeholder).
    3. Body: { model, messages: [{role: 'user', content: prompt}], temperature: 0.7, max_tokens: 512 }.
    4. Returns response.choices[0].message.content.
  - Handle API errors gracefully: if response is not ok, throw an error with the status text; if the response JSON is malformed, throw a descriptive error.
- Import RetrievalResult from @/types.

---

## PROMPT 24: src/lib/llm/gemini.ts

**File:** `src/lib/llm/gemini.ts`

**KILO PROMPT:**
Generate a Gemini API module.
- Create a GeminiLLM class that:
  - Takes apiKey: string and optional model: string (default: 'gemini-1.5-flash') in constructor.
  - Provides async generate(query: string, contextChunks: RetrievalResult[], emotion: string | null): Promise<string> that:
    1. Builds the same prompt as the local LLM.
    2. Sends a POST request to https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}.
    3. Body: { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 512 } }.
    4. Returns response.candidates[0].content.parts[0].text.
  - Handle API errors gracefully: check response.ok, parse error details from the response if available.
- Import RetrievalResult from @/types.

---

## PROMPT 25: src/lib/llm/groq.ts

**File:** `src/lib/llm/groq.ts`

**KILO PROMPT:**
Generate a Groq API module.
- Create a GroqLLM class that:
  - Takes apiKey: string and optional model: string (default: 'llama3-8b-8192') in constructor.
  - Provides async generate(query: string, contextChunks: RetrievalResult[], emotion: string | null): Promise<string> that:
    1. Builds the same prompt as the local LLM.
    2. Sends a POST request to https://api.groq.com/openai/v1/chat/completions with Authorization: Bearer {apiKey} header.
    3. Body: { model, messages: [{role: 'user', content: prompt}], temperature: 0.7, max_tokens: 512 }.
    4. Returns response.choices[0].message.content.
  - Handle API errors gracefully.
- Import RetrievalResult from @/types.

---

## PROMPT 26: scripts/build-index.ts

**File:** `scripts/build-index.ts`

**KILO PROMPT:**
Generate a Node.js build script at scripts/build-index.ts that:
1. Reads all files from public/documents/ using fs/promises readdir.
2. Classifies by extension: .pdf → parsePDF from @/lib/parsers/pdf, .md → parseMarkdown from @/lib/parsers/markdown. Skip other files.
3. For each of the 3 strategies ("simple", "fixed-parent-child", "recursive-parent-child"):
   a. Parse documents and generate chunks using the appropriate chunking function from @/lib/chunking (createSimpleFixedChunks, createFixedParentChildChunks, createRecursiveParentChildChunks).
   b. Load the embedder from @/lib/embeddings/embedder (use the Xenova/all-MiniLM-L6-v2 model via @xenova/transformers pipeline in Node).
   c. Embed all chunks in batches of 32. For each batch, call embedder.embedBatch.
   d. Save the chunks (with embeddings) to public/index/{strategy}.json using JSON.stringify.
4. Also build an emotion-map.json that counts how many chunks exist per emotion per strategy.
5. Print statistics: total documents, total chunks per strategy, average chunk size.
6. Use fs/promises for file operations and handle errors gracefully with try/catch.
7. Add a main() function that is called when the script runs directly.

---

## PROMPT 27: src/hooks/useEmbeddings.ts

**File:** `src/hooks/useEmbeddings.ts`

**KILO PROMPT:**
Generate a React hook useEmbeddings that:
- Returns { embedder, isReady, error, embedQuery }.
- On mount (useEffect), initializes the Embedder singleton from @/lib/embeddings/embedder by calling embedder.load().
- Tracks isReady state (boolean) and any loading errors.
- Provides an embedQuery(text: string): Promise<number[]> function that delegates to embedder.embed(text).
- Shows a loading state while the model is downloading.
- Use useState and useEffect. Handle errors by setting the error state.

---

## PROMPT 28: src/hooks/useLLM.ts

**File:** `src/hooks/useLLM.ts`

**KILO PROMPT:**
Generate a React hook useLLM that:
- Takes provider: LLMProvider and apiKey?: string as arguments.
- Returns { generate, isReady, error, isLoading }.
- Instantiates the appropriate LLM class based on provider:
  - "local" → LocalLLM from @/lib/llm/local
  - "openrouter" → OpenRouterLLM from @/lib/llm/openrouter
  - "gemini" → GeminiLLM from @/lib/llm/gemini
  - "groq" → GroqLLM from @/lib/llm/groq
n- For local provider, tracks model download progress by calling llm.load() and waiting.
- For API providers, validates the API key is provided; if not, set error state.
- Provides a generate(query, chunks, emotion) function that delegates to the active LLM's generate method.
- Use useState, useEffect, and useCallback. Handle provider changes by re-initializing the LLM.
- Import LLMProvider, RetrievalResult from @/types.

---

## PROMPT 29: src/hooks/useRAG.ts

**File:** `src/hooks/useRAG.ts`

**KILO PROMPT:**
Generate a React hook useRAG that orchestrates the full RAG pipeline.
- Takes no arguments but uses internal state for: strategy (ChunkingStrategy, default "recursive-parent-child"), emotion (string | null, default null), query (string, default ""), provider (LLMProvider, default "local"), apiKey (string, default "").
- Returns { answer, sources, isLoading, error, runRAG, setStrategy, setEmotion, setQuery, setProvider, setApiKey }.
- The runRAG async function:
  1. Sets isLoading to true and clears error.
  2. Loads the vector store index for the selected strategy using vectorStore.loadIndex(strategy).
  3. Embeds the query using useEmbeddings hook (call embedQuery).
  4. Retrieves top 20 chunks from vector store, filtered by emotion: vectorStore.query(queryEmbedding, emotion, 20).
  5. Re-ranks top 20 → top 5 using reranker.rerank(query, candidates, 5).
  6. Generates answer using useLLM hook with the top 5 chunks.
  7. Sets answer and sources state.
  8. Sets isLoading to false.
- Tracks loading state with descriptive messages that could be exposed to the UI ("Loading index...", "Embedding query...", "Retrieving chunks...", "Re-ranking...", "Generating answer...").
- Use useState, useCallback. Handle errors at each step.
- Import ChunkingStrategy, LLMProvider, RetrievalResult from @/types, vectorStore from @/lib/vector-store/store, reranker from @/lib/reranker/cross-encoder.

---

## PROMPT 30: src/components/EmotionSelector.tsx

**File:** `src/components/EmotionSelector.tsx`

**KILO PROMPT:**
Generate a React component EmotionSelector that:
- Displays 8 emotion buttons as selectable chips/badges in a responsive grid (2 columns on mobile, 4 on desktop).
- Uses EMOTIONS, EMOTION_COLORS, EMOTION_ICONS, and EMOTION_DESCRIPTIONS from @/lib/emotion/tags.
- Renders each emotion with its lucide icon (dynamically imported or referenced by name), label, and a tooltip showing the description. Use the lucide-react icons: Smile, Heart, Frown, Shield, AlertCircle, Moon, Flame, UserX.
- Takes selectedEmotion: string | null and onSelect: (emotion: string | null) => void as props.
- Clicking an emotion selects it (calls onSelect with the emotion); clicking the same emotion again deselects it (calls onSelect with null).
- Uses shadcn Badge or Button components with the emotion color classes from EMOTION_COLORS.
- Shows a subtle count indicator if a chunkCount prop is provided (optional).
- Import React, useState from 'react', and the icon components from lucide-react.

---

## PROMPT 31: src/components/StrategySelector.tsx

**File:** `src/components/StrategySelector.tsx`

**KILO PROMPT:**
Generate a React component StrategySelector that:
- Displays 3 radio options for chunking strategies in a vertical stack of cards:
  1. "Simple Fixed-Size" — description: "Flat chunks of fixed character length. Fast but less context."
  2. "Fixed Parent-Child" — description: "Large parent chunks split into fixed-size children. Retrieve child, return parent context."
  3. "Recursive Parent-Child" — description: "Semantic boundary-aware splitting. Best for natural language documents."
- Takes selectedStrategy: ChunkingStrategy and onSelect: (strategy: ChunkingStrategy) => void as props.
- Uses shadcn RadioGroup and Card components. Each strategy is a Card with a RadioGroupItem and the description text.
- Shows a small info icon (Info from lucide-react) with a tooltip or hover text explaining each strategy in more detail.
- The selected strategy card should have a highlighted border.
- Import ChunkingStrategy from @/types.

---

## PROMPT 32: src/components/QueryInput.tsx

**File:** `src/components/QueryInput.tsx`

**KILO PROMPT:**
Generate a React component QueryInput that:
- Has a large textarea for the user question with placeholder text: "How are you feeling? Ask something that speaks to your heart..."
- Shows the currently selected emotion as a removable pill/badge if one is selected (takes emotion: string | null and onClearEmotion: () => void props).
- Has an "Ask" button (with a Send icon from lucide-react) that triggers onSubmit(query: string).
- Disables the button and shows a loading spinner when isLoading is true.
- Uses shadcn Textarea and Button components.
- Supports Enter key to submit (with Shift+Enter for new line). Use onKeyDown handler.
- Takes value: string, onChange: (value: string) => void, onSubmit: () => void, isLoading: boolean, emotion: string | null, onClearEmotion: () => void as props.
- The textarea should auto-resize or have a minimum of 3 rows.

---

## PROMPT 33: src/components/SourcePanel.tsx

**File:** `src/components/SourcePanel.tsx`

**KILO PROMPT:**
Generate a React component SourcePanel that:
- Takes sources: RetrievalResult[] and topN: number (default 5) as props.
- Displays a collapsible panel (using shadcn Collapsible) with a header "Sources" and a count badge.
- Inside, shows a table (using shadcn Table components: Table, TableHeader, TableRow, TableHead, TableBody, TableCell) with columns:
  - Rank (1-based index)
  - Source File (chunk.sourceFile)
  - Page/Heading (chunk.pageNumber or chunk.heading or "—")
  - Cosine Score (cosineScore, formatted to 4 decimal places)
  - Cross-Encoder Score (crossEncoderScore, formatted to 4 decimal places, or "—" if not present)
  - Preview Text (truncated to ~150 characters)
- Highlights the top topN rows with a different background color (these are the chunks sent to the LLM).
- Truncates long text previews to ~150 characters with "..." and a "Show more" toggle per row (use useState for each row's expanded state).
- Shows emotion tags as small colored badges on each row using the EMOTION_COLORS from @/lib/emotion/tags.
- If sources is empty, show a "No sources found" message.
- Import RetrievalResult from @/types, EMOTION_COLORS from @/lib/emotion/tags.

---

## PROMPT 34: src/components/AnswerDisplay.tsx

**File:** `src/components/AnswerDisplay.tsx`

**KILO PROMPT:**
Generate a React component AnswerDisplay that:
- Takes answer: string, isLoading: boolean, and emotion: string | null as props.
- Shows a typing/streaming effect for the answer text. Use a useEffect that gradually reveals characters or words from the answer string with a small delay (e.g., 10ms per character). Store the displayed text in a useState.
- If isLoading, shows a skeleton loader (using shadcn Skeleton) or a pulsing "Generating a thoughtful response..." message with a spinner icon.
- If emotion is set, shows a header like "A message for when you feel {emotion}" with the emotion's color theme from EMOTION_COLORS.
- Uses shadcn Card component for the container.
- Formats the answer text with proper paragraph breaks (split by \n\n and wrap each in a p tag).
- When a new answer arrives, reset the displayed text and start the typing animation from the beginning.
- Import EMOTION_COLORS from @/lib/emotion/tags.

---

## PROMPT 35: src/components/LLMConfigPanel.tsx

**File:** `src/components/LLMConfigPanel.tsx`

**KILO PROMPT:**
Generate a React component LLMConfigPanel that:
- Is a collapsible sidebar section using shadcn Collapsible with a trigger button labeled "LLM Settings" and a Settings icon.
- Has a dropdown (using shadcn Select) to select LLM provider with options:
  - "local" → label "Local (Free — No Key Required)"
  - "openrouter" → label "OpenRouter"
  - "gemini" → label "Gemini"
  - "groq" → label "Groq"
- If a non-local provider is selected, shows an API key input (password type) with a "Save" button. The input should have a placeholder like "Enter your API key...".
- Stores the key in sessionStorage (never sent to our server) with a key like `emotion-rag-api-key-{provider}`.
- On mount, checks sessionStorage for saved keys and pre-fills the input.
- Shows a model selection dropdown that populates based on provider:
  - OpenRouter: mistralai/mistral-7b-instruct:free, huggingfaceh4/zephyr-7b-beta:free
  - Gemini: gemini-1.5-flash
  - Groq: llama3-8b-8192, mixtral-8x7b-32768
  - Local: no dropdown (single model)
- Takes provider, apiKey, model, and onProviderChange, onApiKeyChange, onModelChange callbacks as props.
- Shows a small info text explaining that local mode downloads a ~600MB model on first use.

---

## PROMPT 36: src/app/page.tsx

**File:** `src/app/page.tsx`

**KILO PROMPT:**
Generate the main page component that composes all UI components into a complete dashboard.
- Layout: A header at the top with title "Emotion-Aware RAG" and subtitle "Find comfort and wisdom in your documents".
- Below the header, a two-column layout on desktop (sidebar + main) and single column on mobile.
- Left sidebar (or top section on mobile): Stack of EmotionSelector, StrategySelector, and LLMConfigPanel.
- Main area: QueryInput at top, AnswerDisplay in the middle (takes full width), SourcePanel at bottom.
- Use the useRAG hook to wire everything together. Destructure: answer, sources, isLoading, error, runRAG, setStrategy, setEmotion, setQuery, setProvider, setApiKey.
- Connect component props to the hook's state setters and values.
- Show a loading overlay or full-page spinner when isLoading is true.
- If error is set, show an error alert (using shadcn Alert component) with the error message.
- Make it responsive with Tailwind grid classes: grid-cols-1 lg:grid-cols-4 with sidebar taking lg:col-span-1 and main taking lg:col-span-3.
- Include a footer with "Powered by Transformers.js — No API key required" badge.
- Import all components from @/components/ and the useRAG hook from @/hooks/useRAG.

---

## PROMPT 37: src/app/layout.tsx

**File:** `src/app/layout.tsx`

**KILO PROMPT:**
Generate the root layout for a Next.js 14 app.
- Export default function RootLayout({ children }: { children: React.ReactNode }).
- Set HTML lang="en".
- Set metadata: title "Emotion-Aware RAG", description "A free, local RAG system with emotion-aware retrieval. Find comfort and wisdom in your documents."
- Import './globals.css'.
- Wrap children in a main container with className="min-h-screen bg-slate-50" and a div with max-w-7xl mx-auto px-4 py-8.
- Import { Metadata } from 'next' and export the metadata object.

---

## PROMPT 38: src/app/globals.css

**File:** `src/app/globals.css`

**KILO PROMPT:**
Generate global CSS for a Next.js + Tailwind project.
- Import Tailwind directives: @tailwind base, @tailwind components, @tailwind utilities.
- Set base font-family to the system sans-serif stack in @layer base.
- Add custom CSS variables for emotion colors in :root (e.g., --emotion-happy: #f59e0b, --emotion-peace: #14b8a6, etc.).
- Add a @keyframes typewriter animation that goes from width: 0 to width: 100%.
- Add a .typing-effect class that uses the typewriter animation.
- Add smooth scroll behavior to html.
- Add custom scrollbar styling for webkit browsers.
- Keep it minimal and clean.

---

## Build & Deploy Steps

### After All 39 Prompts Are Generated (Prompt 0 through Prompt 38):

**Step 1: Run and test locally first**
```bash
npm run dev
```
Open `http://localhost:3000` and walk through the Verification Checklist below (emotion selector, strategy selector, a real query, sources panel) before touching git or Vercel at all.

**Step 2: Build the vector index locally**
```bash
npm run build-index
```
Confirm `public/index/` now has 3 JSON files (`simple.json`, `fixed-parent-child.json`, `recursive-parent-child.json`) and an `emotion-map.json`.

**Step 3: Run a full production build locally**
```bash
npm run build
```
Fix any TypeScript or build errors before proceeding — do not push a broken build.

**Step 4: Important — decide what ships to GitHub**
This app is a static export that reads `public/index/*.json` at runtime. It does **not** read `public/documents/` in production (that folder is only used by `build-index.ts` at build time). So:
- The generated **index JSON files must be committed** (remove `public/index/*.json` from `.gitignore`, or Vercel will have no data to serve).
- The **raw source PDFs/MD in `public/documents/` are optional to commit** — keep them out of git if they're large or contain content you don't want in a public repo; Vercel doesn't need them since it never runs `build-index` itself in this setup (the index is pre-built and committed).

```bash
# allow the generated index into git
git add -f public/index/*.json
git commit -m "Add generated vector indices"
```

**Step 5: Commit and push everything else**
```bash
git add .
git commit -m "Complete emotion-aware RAG implementation"
git push -u origin main
```
Remote is already set to `git@github.com:varunkhanna-ai/rag_gita.git` from Step 6 of Quick Start. If push is rejected because SSH isn't configured, either set up an SSH key with GitHub or switch the remote to HTTPS:
```bash
git remote set-url origin https://github.com/varunkhanna-ai/rag_gita.git
```

**Step 6: Connect Vercel**
- Go to vercel.com → "Add New Project"
- Import `varunkhanna-ai/rag_gita` from GitHub
- Framework preset: Next.js
- No environment variables are required for the default local/free path — leave them blank
- Deploy

**Step 7 (optional): Re-deploy after future document changes**
Whenever you add/change source documents, re-run Steps 2–5 locally (rebuild index, commit the updated JSON, push) — Vercel will redeploy automatically on push to `main` if you keep `.github/workflows/deploy.yml`, or you can rely on Vercel's own GitHub integration to trigger the build without the extra Action.

---

## Verification Checklist

### Setup
- [ ] `CLAUDE.md` exists at project root and is under ~150 lines
- [ ] `git remote -v` shows `origin` pointing to `git@github.com:varunkhanna-ai/rag_gita.git`
- [ ] `public/documents/` contains the copied files from `Documents for RAG/`

### Build-Time
- [ ] `npm run build-index` completes without errors
- [ ] `public/index/` contains 3 `.json` files
- [ ] Each JSON file has chunks with `id`, `text`, `embedding`, `emotions` fields
- [ ] `npm run build` completes without errors

### Client-Side
- [ ] Page loads at `http://localhost:3000`
- [ ] All 8 emotion buttons render with correct colors and icons
- [ ] All 3 strategy options render with descriptions
- [ ] LLM config panel shows provider dropdown and key input

### End-to-End
| Step | Action | Expected |
|------|--------|----------|
| 1 | Select "Anxiety" | Button highlights |
| 2 | Select "Recursive Parent-Child" | Strategy card highlights |
| 3 | Type "What helps with worry?" | Text accepted |
| 4 | Click "Ask" | Loading states shown sequentially |
| 5 | Inspect Sources | Table with Cosine + Cross-Encoder scores |
| 6 | Read Answer | Emotionally supportive, cites sources |
| 7 | Switch strategy | Different index loads |
| 8 | Deselect emotion | No filter applied |
| 9 | Local LLM | Model downloads, then generates |
| 10 | API LLM | Faster, higher quality |

---

*This plan is designed for VS Code with the Kilo Code extension. Paste the Master Instruction near the top once, in an agentic/auto-approve mode, and Kilo Code will work through Prompt 0 to Prompt 38 on its own — build, index, and push to `git@github.com:varunkhanna-ai/rag_gita.git` — pausing only for genuine blockers like credentials or the manual Vercel import step.*
