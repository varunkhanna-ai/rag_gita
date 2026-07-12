# 🎭 Emotion-Aware RAG: Bhagavad Gita Learning Interface

An interactive **Retrieval-Augmented Generation (RAG)** application that retrieves passages from the Bhagavad Gita and generates answers with emotion-aware context. Learn how RAG works through interactive visualizations.

**Live Demo:** [Deploy on Vercel](#deploy-on-vercel) | **Repository:** [github.com/varunkhanna-ai/rag_gita](https://github.com/varunkhanna-ai/rag_gita)

---

## ✨ Features

### Core RAG Capabilities
- 🔍 **Semantic Search** — Find relevant Gita passages using embeddings (no API key required)
- 🏗️ **Three Chunking Strategies** — Simple, Fixed Parent-Child, Recursive hierarchical
- 🎯 **Re-ranking** — Cross-encoder scoring refines top results before answering
- 💬 **Local LLM** — Generate answers using Transformers.js (runs in browser, no backend)
- 🌐 **Optional Cloud LLMs** — Switch to OpenRouter, Gemini, or Groq with your own API key

### Learning & Visualization
- 📊 **Retrieval Pipeline Visualization** — See all 4 RAG steps: embedding → retrieval → re-ranking → generation
- 🔄 **Before/After Re-ranking** — Compare cosine vs cross-encoder scores, see rank changes
- 🎨 **Emotion Heatmap** — Visualize emotional tone (Joy, Peace, Determination, etc.) per chunk
- 📈 **Performance Dashboard** — Monitor timing breakdown for each step
- 📚 **Chunking Strategy Comparison** — Explore how different strategies split documents
- 💾 **Query History & Favorites** — Save and compare responses across emotions

### User Experience
- 🎭 **Emotion Filtering** — Retrieve passages matching a specific emotional tone
- 🔀 **Multi-Emotion Exploration** — Run the same query with different emotions, get varied responses
- 🧩 **Chunk Detail Slider** — Explore what different chunk sizes would look like (display-only)
- ⚡ **Fully Client-Side** — No data sent to servers (except optional cloud LLMs)
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** — Easy on the eyes

---

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Fastest, ~2 min)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvarunkhanna-ai%2Frag_gita

1. Click the button above
2. Click **"Create"** (no env vars needed for local/free mode)
3. Wait for deployment
4. Your app is live! Try a query on the home page

### Option 2: Run Locally

**Prerequisites:**
- Node.js 18+ and npm
- Git

**Steps:**

```bash
# Clone the repo
git clone https://github.com/varunkhanna-ai/rag_gita.git
cd rag_gita

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring!

### Option 3: Fork & Customize

1. Click **Fork** on this repo
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/rag_gita.git
   cd rag_gita
   ```
3. Make changes, test locally, and deploy your own version

---

## 💡 How to Use

### Basic Query Flow

1. **Choose Input Mode:**
   - **Preset Filter** — Select a predefined Gita theme (Dharma, Action, Knowledge, etc.)
   - **Custom Question** — Ask anything about the Bhagavad Gita

2. **Select Emotion:**
   - Choose an emotional lens: Joy, Sorrow, Fear, Anger, Surprise, Disgust, Peaceful, Determined
   - The app retrieves passages matching that emotional tone

3. **Pick Chunking Strategy:**
   - **Simple** — Fast retrieval, independent chunks
   - **Fixed Parent-Child** — Combines chunk + parent context
   - **Recursive** — Hierarchical retrieval at multiple levels
   - View chunk metrics (count, size, overlap) for each

4. **Explore Results:**
   - View **Retrieval Pipeline** — See embedding, retrieval, re-ranking, generation steps
   - Compare **Before/After Re-ranking** — Understand how cross-encoder reorders results
   - Check **Emotion Heatmap** — See which emotions appear in each result
   - Review **Performance Stats** — How long did each step take?

5. **Try Multiple Emotions:**
   - Run the same query with different emotions
   - View **Response History** — Compare how answers vary by emotional context
   - Favorite and save your discoveries

---

## 🎓 Learning RAG Concepts

This app is designed to **teach RAG** through interactive exploration. Here's what you'll learn:

### 1. Embeddings & Semantic Search
- See how your query becomes a vector
- Understand cosine similarity (why some chunks rank high)
- Visualize the embedding space

### 2. Retrieval Strategy
- Compare 3 different chunking strategies
- See the tradeoff: small chunks (precise) vs large chunks (contextual)
- Understand parent-child and hierarchical retrieval

### 3. Re-ranking
- Before/After comparison shows re-ranking's impact
- Learn why cosine ≠ relevance (embeddings find semantic similarity; cross-encoders find direct relevance)
- See which results move up/down and why

### 4. LLM Context Window
- View exactly which chunks the LLM sees
- Understand prompt engineering (emotion context, few-shot examples, etc.)
- Experiment with different emotional tones

### 5. Performance & Tradeoffs
- Dashboard shows timing for each step
- Learn where bottlenecks are (LLM usually slowest)
- Understand client-side vs cloud trade-offs

---

## ⚙️ Configuration

### Using Local LLM (Default)
✅ **No API key required**  
✅ Runs fully in your browser  
✅ Privacy-first (no data sent anywhere)  
❌ Slower (CPU-bound, no GPU acceleration)

The default uses **Transformers.js** with a small local LLM. Works fine for philosophical texts.

### Switching to Cloud LLMs (Optional)

If you want faster responses, you can enable cloud providers. **Your API key is stored only in `sessionStorage`** (cleared when you close the browser tab).

#### Cloud LLaMA (Free — No Key Required)
```
1. In the app, select "Cloud LLaMA (Free — No Key Required)"
2. Run a query — no setup needed!
3. The Groq API key lives on the server (never exposed in browser)
4. Rate limits apply (30 RPM / 14,400 RPD on free tier)
```

**Note for self-hosting:** To use Cloud LLaMA in your own deployment, you need to add `GROQ_API_KEY` to your environment variables. Get a free key at https://console.groq.com/keys

#### OpenRouter
```
1. Get API key: https://openrouter.ai
2. In the app, select "OpenRouter" from provider dropdown
3. Paste your key (browser-only, not saved)
4. Choose a model (Claude, GPT-4, Llama, etc.)
```

#### Google Gemini
```
1. Get API key: https://makersuite.google.com/app/apikey
2. In the app, select "Gemini"
3. Paste your key
```

#### Groq
```
1. Get API key: https://console.groq.com/keys
2. In the app, select "Groq"
3. Paste your key
```

---

## 📁 Project Structure

```
emotion-rag/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main app page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── RetrievalPipeline.tsx       # RAG pipeline visualization
│   │   ├── RerankingComparison.tsx     # Before/after re-ranking
│   │   ├── EmotionHeatmap.tsx          # Emotion tone heatmap
│   │   ├── ChunkingComparison.tsx      # Strategy comparison
│   │   ├── PerformanceStats.tsx        # Timing dashboard
│   │   ├── QueryInput.tsx              # Filter/question toggle
│   │   ├── StrategySelector.tsx        # Chunking strategy picker
│   │   └── ui/                         # shadcn/ui components
│   └── lib/
│       ├── parsers/              # PDF/MD document parsers
│       ├── chunking/             # 3 chunking strategies
│       ├── embeddings/           # Embedder (Xenova)
│       ├── vector-store/         # Vector search & storage
│       ├── reranker/             # Cross-encoder re-ranker
│       ├── llm/                  # LLM providers (local + cloud)
│       ├── emotion/              # Emotion tagging & filtering
│       └── utils/                # Utilities
├── public/
│   ├── documents/               # Bhagavad Gita source documents
│   └── index/                   # Generated vector indices (gitignored)
├── scripts/
│   └── build-index.ts           # Build vector index from documents
├── CLAUDE.md                    # Project context map
└── package.json
```

---

## 🔧 Development

### Build the Vector Index

After adding new documents, regenerate the index:

```bash
npm run build-index
```

This creates optimized vector embeddings for fast retrieval. The index files live in `public/index/` (gitignored to keep repo small).

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

Creates optimized bundle in `.next/`

### Lint & Type Check

```bash
npm run lint
npm run type-check
```

---

## 🧠 How RAG Works (Simplified)

```
User Query: "What is dharma?"
       ↓
[1] EMBEDDING
    Convert query to 384-dimensional vector using Transformers.js
       ↓
[2] RETRIEVAL
    Find top-20 chunks with highest cosine similarity
    Filter by selected emotion (Joy, Peace, etc.)
       ↓
[3] RE-RANKING
    Score top-20 with cross-encoder model
    Re-sort by relevance (not just semantic similarity)
    Keep top-5
       ↓
[4] GENERATION
    Pass top-5 chunks + emotion context to LLM
    LLM generates answer ("Dharma means righteous duty...")
       ↓
User sees answer + source chunks + visualizations
```

**Key insight:** Each step can be visualized and explored in the app!

---

## 🎯 Supported Emotions

The app filters and tags chunks with these emotions:

- **Joy** — Enthusiasm, celebration, delight
- **Sorrow** — Sadness, melancholy, loss
- **Fear** — Worry, anxiety, uncertainty
- **Anger** — Intensity, determination, frustration
- **Surprise** — Wonder, revelation, unexpected wisdom
- **Disgust** — Rejection of ego, judgment
- **Peaceful** — Tranquility, acceptance, serenity
- **Determined** — Resolve, duty, unwavering commitment

Each passage can have multiple emotions. Run the same query with different emotions to see how the Gita speaks to different states of mind.

---

## 📊 Performance

Typical query performance (local LLM):

| Step | Time |
|------|------|
| Embedding | 150ms |
| Retrieval | 45ms |
| Re-ranking | 200ms |
| LLM Generation | 2-5s |
| **Total** | **2.4-5.4s** |

With cloud LLMs (OpenRouter/Gemini), LLM step is faster (~0.5-1s) but requires network.

---

## 🔒 Privacy & Security

- ✅ **No tracking** — No analytics, no data collection
- ✅ **No login required** — Anonymous, offline-first
- ✅ **API keys are local** — Stored in `sessionStorage` only, cleared on browser close
- ✅ **No backend** — All processing in browser (except optional cloud LLM calls)
- ✅ **Open source** — Audit the code yourself
- ✅ **Gita content** — Public domain, no licensing issues

---

## 🤝 Contributing

This is a read-only repository for learning purposes. If you'd like to contribute improvements:

1. **Fork the repo** — Create your own copy
2. **Make changes** — Enhance features, fix bugs, improve visualizations
3. **Test locally** — Verify everything works
4. **Deploy your version** — Share your fork on Vercel or GitHub Pages

We love seeing creative variations and extensions!

---

## 📚 Extending the Project

### Add New Documents

1. Place PDF or Markdown files in `public/documents/`
2. Run: `npm run build-index`
3. The app automatically indexes and retrieves from all documents

### Add New Emotions

1. Edit `src/lib/emotion/tags.ts`:
   - Add emotion to `EMOTIONS` array
   - Add color and icon
   - Add keyword patterns
2. Update `src/lib/emotion/filter.ts` with tagging logic
3. Rebuild index: `npm run build-index`

### Use a Different LLM Provider

1. Create a new file: `src/lib/llm/providers/myProvider.ts`
2. Implement the `LLMProvider` interface:
   ```typescript
   export class MyProvider implements LLMProvider {
     async generate(query: string, context: string, emotion: string): Promise<string> {
       // Call your LLM here
       return answer;
     }
   }
   ```
3. Register in `src/lib/llm/providers/index.ts`
4. It appears in the provider dropdown automatically

---

## 📖 Learn More

- **Next.js Docs** — https://nextjs.org/docs
- **Transformers.js** — https://xenova.github.io/transformers.js/
- **RAG Concepts** — https://www.pinecone.io/learn/retrieval-augmented-generation/
- **Bhagavad Gita** — https://www.bhagavad-gita.org/

---

## 📝 License

This project is open source. The Bhagavad Gita content is in the public domain.

---

## 💬 Questions?

- **Found a bug?** Open an issue on GitHub
- **Want to fork & customize?** Go ahead! That's what it's here for
- **Questions about RAG?** Check out the in-app visualizations and explanations

---

## 🌟 Built With

- **Framework:** Next.js 14 (React + TypeScript)
- **Embeddings:** Transformers.js (Xenova)
- **Styling:** Tailwind CSS + shadcn/ui
- **Vector Search:** Cosine similarity
- **Re-ranking:** Cross-encoder model
- **Optional LLMs:** OpenRouter, Google Gemini, Groq

---

**Happy learning! Explore how RAG works through interactive discovery.** 🎭✨
