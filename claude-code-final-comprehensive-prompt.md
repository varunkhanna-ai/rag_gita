# Claude Code: Final Implementation Prompt — RAG Enhancements & Visualizations

## Overview

You are continuing/completing the Emotion-Aware RAG project. This prompt bundles all the recommended enhancements into a single cohesive task list that Claude Code should execute autonomously.

**Project folder:** `/Users/varunmacbook15/Desktop/project/emotion-rag`

**Current state:** The core RAG scaffolding is done (or partially done). Your job is to add the features and visualizations listed below.

**Approach:** Work through each task in order. Test locally after each section. Commit after every 2–3 tasks.

---

## Master Instruction for Claude Code

```
You are enhancing the Emotion-Aware RAG application with new UI features and visualizations
to make it more educational and interactive. Read this prompt fully, then work through each
section in order.

Start by checking the current state:
1. Run `npm run dev` and verify the app loads at http://localhost:3000
2. Open CLAUDE.md to remind yourself of the architecture
3. Try a test query to verify the baseline is working

Then implement each feature section below. After each section, test locally and commit.

Only pause if you hit a genuine error you can't resolve on your own.
```

---

## SECTION 1: Filter OR Custom Question Toggle

**Goal:** Users pick one input method, not both. Prevents confusion.

**Files to modify:**
- `src/app/page.tsx` (main page component)
- `src/components/QueryInput.tsx` (create new if doesn't exist)

**What to build:**

1. Add a toggle/radio button at the top of the query section:
   ```
   ○ Use Preset Filter    ○ Ask Custom Question
   ```

2. Show only *one* input field based on selection:
   - If "Preset Filter": show the emotion selector + preset filter dropdown
   - If "Custom Question": show a text input for custom questions

3. When user switches between modes, clear the previous input

4. Both modes should still allow emotion selection (emotions are always available)

5. Styling: Use shadcn/ui RadioGroup component; make it prominent but not overwhelming

**Testing:**
- Toggle between modes and verify only one input shows
- Submit a query from each mode and verify it works
- Check that switching modes clears the input field

**Commit message:** `feat: add filter vs custom question toggle for clearer UX`

---

## SECTION 2: Display Chunk Metrics on Strategy Selection

**Goal:** Show users what they're getting with each chunking strategy.

**Files to modify:**
- `src/components/StrategySelector.tsx` (or create if doesn't exist)
- `src/hooks/useRAG.ts` (expose chunk metrics)
- `src/lib/vector-store/store.ts` (calculate metrics from index)

**What to build:**

1. In the vector store's index metadata, calculate and store:
   - Total chunk count across all strategies
   - For each strategy: total chunks, median chunk size, overlap value
   - Example metadata:
     ```typescript
     {
       "simple": { chunks: 1234, medianSize: 512, overlap: 0 },
       "fixed-parent-child": { chunks: 567, medianSize: 512, overlap: 128 },
       "recursive-parent-child": { chunks: 789, medianSize: 512, overlap: 256 }
     }
     ```

2. When user selects a strategy in the UI, display these metrics:
   ```
   Strategy: Fixed Parent-Child
   ├─ Total Chunks: 567
   ├─ Chunk Size: ~512 tokens
   └─ Overlap: 128 tokens
   ```

3. Use a small collapsible card or tooltip to show this info next to the strategy selector

4. Update the strategy selector description to mention these metrics ("Choose a strategy to see chunk details")

**Testing:**
- Select each strategy and verify metrics display correctly
- Manually verify the numbers make sense (total chunks > 100, overlaps reasonable)

**Commit message:** `feat: display chunk metrics (size, count, overlap) when strategy is selected`

---

## SECTION 3: Multi-Emotion Responses with Variation

**Goal:** Allow users to query multiple times with different (or same) emotions and get varied, contextually appropriate responses.

**Files to modify:**
- `src/hooks/useRAG.ts` (add emotion history tracking)
- `src/lib/llm/localLLM.ts` and `src/lib/llm/providers/*.ts` (add emotion context to prompts)
- `src/app/page.tsx` (show response history)
- `src/components/ResponseHistory.tsx` (create new)

**What to build:**

1. **Track emotion usage:** When user runs a query with emotion X, store it (timestamp, emotion, results, response)

2. **Emotion-aware LLM prompts:** Modify the LLM prompt to include emotion context:
   ```typescript
   // Before (generic):
   "Answer this question based on these passages: ..."
   
   // After (emotion-aware):
   "Answer this question with a [Joyful/Peaceful/Determined] tone, based on these passages:
    Focus on aspects that resonate with [Joyful] sentiment: ..."
   ```

3. **Vary responses:** If user selects the same emotion again or a different emotion:
   - Use the *different* emotion-filtered chunks (different retrieval results)
   - Add a prompt hint: "Provide a different perspective than before, focusing on [new emotion]"
   - The LLM will naturally vary its response given new context + tone hint

4. **Display response history:** Show a collapsible panel or tab listing:
   ```
   Query: "What is the duty of a warrior?"
   ├─ Joyful response (timestamp)
   ├─ Peaceful response (timestamp)
   └─ Determined response (timestamp)
   
   [Click to view/compare responses]
   ```

5. **Optional: Compare mode** — side-by-side view of responses with different emotions for the same query

**Testing:**
- Run the same query with Joyful emotion, then Peaceful emotion
- Verify results are different (different chunks retrieved due to emotion filter)
- Verify LLM responses are different (different tone + context)
- Check response history displays all attempts
- Manually read responses to confirm they sound different

**Commit message:** `feat: add multi-emotion query support with varied LLM responses and history tracking`

---

## SECTION 4: Retrieval Pipeline Visualization

**Goal:** Show users the RAG retrieval pipeline step-by-step: query → embedding → retrieval → re-ranking.

**Files to create:**
- `src/components/RetrievalPipeline.tsx` (new component)

**Files to modify:**
- `src/hooks/useRAG.ts` (expose retrieval pipeline steps)
- `src/app/page.tsx` (integrate visualization)

**What to build:**

1. **Pipeline flow diagram** (use SVG or styled boxes):
   ```
   ┌──────────────────────────────────────────────────┐
   │ Your Query: "What is dharma?"                    │
   └──────────────────────────────────────────────────┘
                        ↓
   ┌──────────────────────────────────────────────────┐
   │ 1. Embedding: Converting to vector (384-dim)     │ (150ms)
   └──────────────────────────────────────────────────┘
                        ↓
   ┌──────────────────────────────────────────────────┐
   │ 2. Retrieval: Cosine similarity search           │ (45ms)
   │    Emotion filter: Joy                           │
   │    Found: 20 relevant chunks                     │
   └──────────────────────────────────────────────────┘
                        ↓
   ┌──────────────────────────────────────────────────┐
   │ 3. Re-ranking: Cross-encoder scoring             │ (200ms)
   │    Top 5 final results (re-ordered)              │
   └──────────────────────────────────────────────────┘
                        ↓
   ┌──────────────────────────────────────────────────┐
   │ 4. LLM Generation: Generating answer             │ (2.3s)
   │    Model: Transformers.js local                  │
   └──────────────────────────────────────────────────┘
   ```

2. **Timing breakdown:** Show execution time for each step

3. **Interactive:** Users can:
   - Click on "Retrieval" to see all 20 chunks before re-ranking
   - Click on "Re-ranking" to see the before/after scores
   - Hover on chunks to highlight them in results

4. **Optional animation:** Subtle fade-in for each step as it completes

5. **Placement:** Show this as a collapsible card above or beside the results, or as a dedicated "Pipeline" tab

**Testing:**
- Run a query and verify all 4 steps display with timings
- Click on Retrieval and verify you can see all 20 chunks
- Verify timing adds up (sum ≈ total query time)

**Commit message:** `feat: add retrieval pipeline visualization showing all RAG steps with timing`

---

## SECTION 5: Before/After Re-ranking Visualization

**Goal:** Show users how re-ranking changes result ordering and scores.

**Files to create:**
- `src/components/RerankingComparison.tsx` (new component)

**Files to modify:**
- `src/hooks/useRAG.ts` (expose both cosine and cross-encoder scores)
- `src/lib/reranker/reranker.ts` (ensure scores are returned)
- `src/app/page.tsx` (integrate visualization)

**What to build:**

1. **Two-tab or two-panel layout:**
   - **Tab 1: "Cosine Retrieval (Top 5)"** — results sorted by embedding similarity score
   - **Tab 2: "After Re-ranking (Final Top 5)"** — results sorted by cross-encoder score

2. **Each result card shows:**
   ```
   Result #1
   "Act without attachment to the fruits of action..."
   
   Cosine Score: 0.87 ████████░ Rank: #3
   Cross-Encoder Score: 0.92 █████████ Rank: #1
   
   Rank Change: ⬆️ #3 → #1 (moved up 2 positions)
   ```

3. **Visual indicators for rank change:**
   - ⬆️ (green) — moved up (re-ranker scored higher)
   - ⬇️ (red) — moved down (re-ranker scored lower)
   - ↔️ (gray) — stayed same

4. **Score comparison:**
   - Side-by-side progress bars for cosine vs cross-encoder
   - Color code: cosine = blue, cross-encoder = red
   - Makes it obvious when re-ranking changes priorities

5. **Explanation text:** Add a small info box explaining:
   "Cosine similarity matches semantic meaning. Cross-encoder re-ranks by direct relevance to your query. Notice which results are promoted/demoted and why."

**Testing:**
- Run a query and view both tabs
- Verify at least some results changed rank between tabs (they should)
- Manually check that rank-change indicators are correct
- Verify score bars render properly

**Commit message:** `feat: add before/after re-ranking visualization with score comparison and rank change indicators`

---

## SECTION 6: Emotion Heatmap Visualization

**Goal:** Show which emotions are present in each retrieved chunk.

**Files to create:**
- `src/components/EmotionHeatmap.tsx` (new component)

**Files to modify:**
- `src/lib/emotion/tags.ts` (ensure emotions are tagged on chunks)
- `src/hooks/useRAG.ts` (expose emotion tags in results)
- `src/app/page.tsx` (integrate visualization)

**What to build:**

1. **Heatmap grid:**
   - Rows: Top 5 results (chunks)
   - Columns: All emotions (Joy, Sorrow, Fear, Anger, Surprise, Disgust, Peaceful, Determined)
   - Cell color intensity: how strongly that chunk matches that emotion (0.0 to 1.0)
   - Color scale: white (no match) → light green (partial) → dark green (strong match)

2. **Interactive:**
   - Hover on a cell to see the emotion strength as a percentage
   - Click on an emotion column to highlight all chunks with that emotion
   - Click on a chunk row to show the full text in a modal

3. **Example:**
   ```
   Chunk 1: "Act without attachment..."    ████ ████ ░░░░ ░░░░ ░░░░ ░░░░ ████ ████
   Chunk 2: "In the field of dharma..."    ░░░░ ░░░░ ░░░░ ░░░░ ░░░░ ░░░░ ████ ░░░░
   Chunk 3: "Bow to thy duty..."           ████ ░░░░ ░░░░ ░░░░ ░░░░ ░░░░ ░░░░ ████
   
            Joy  Sorrow Fear  Anger Surpr Disgust Peace Determ
   ```

4. **Placement:** Below results, in a collapsible card or dedicated tab

**Testing:**
- Run a query and generate the heatmap
- Visually verify that chunks show emotions (they should have some match to at least 1 emotion)
- Hover on cells and verify percentages appear
- Click emotions/chunks and verify highlighting works

**Commit message:** `feat: add emotion heatmap showing emotional tone of each retrieved chunk`

---

## SECTION 7: Chunking Strategy Comparison (Static)

**Goal:** Show users what different chunking strategies produce for a sample document.

**Files to create:**
- `src/components/ChunkingComparison.tsx` (new component)

**Files to modify:**
- `src/app/page.tsx` (add as an optional "Learn" or "Info" section)

**What to build:**

1. **Static side-by-side comparison:**
   - Pick one sample passage (a few paragraphs from the Gita)
   - Show how each chunking strategy would split it
   - Highlight chunk boundaries

2. **Example:**
   ```
   SIMPLE CHUNKING (512 tokens):
   ┌─────────────────────────────────────┐
   │ [CHUNK 1]                           │
   │ "The Blessed Lord said: Many births │
   │ have passed; I remember them all;   │
   │ thou rememberest none, O Arjuna!" │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ [CHUNK 2]                           │
   │ "Though I am unborn and eternal, I  │
   │ come by My power into the world..." │
   └─────────────────────────────────────┘
   
   FIXED PARENT-CHILD (512 + 256 parent):
   ┌─────────────────────────────────────┐
   │ PARENT (combines chunks 1-2)        │
   │ "Many births have passed... I come  │
   │ by My power into the world..."      │
   ├─────────────────────────────────────┤
   │ CHILD 1: [Chunk 1 excerpt]          │
   └─────────────────────────────────────┘
   
   RECURSIVE (hierarchical):
   ┌─────────────────────────────────────┐
   │ LEVEL 0 (full section)              │
   ├─────────────────────────────────────┤
   │ LEVEL 1 (subsections)               │
   ├─────────────────────────────────────┤
   │ LEVEL 2 (fine chunks)               │
   └─────────────────────────────────────┘
   ```

3. **Key callouts:**
   - "Simple: Fast, but loses context"
   - "Parent-Child: Combines child + parent context"
   - "Recursive: Hierarchical — query can fetch at any level"

4. **Placement:** Collapsible "How Chunking Works" section in sidebar or as a help modal

**Testing:**
- Visually verify chunk boundaries make sense
- Verify descriptions are accurate

**Commit message:** `feat: add static chunking strategy comparison for educational purposes`

---

## SECTION 8: Performance Stats Dashboard

**Goal:** Show query performance metrics so users understand bottlenecks.

**Files to modify:**
- `src/hooks/useRAG.ts` (track timing for each step)
- `src/components/PerformanceStats.tsx` (create new)
- `src/app/page.tsx` (integrate)

**What to build:**

1. **After each query, display:**
   ```
   Query Performance
   ├─ Embedding: 150ms
   ├─ Retrieval: 45ms
   ├─ Re-ranking: 200ms
   ├─ LLM Generation: 2.3s
   └─ Total: 2.7s
   ```

2. **Visual breakdown:**
   - Horizontal stacked bar chart showing time distribution
   - Hover to see exact milliseconds
   - Identify bottleneck (LLM usually the slowest)

3. **Cumulative stats (optional):**
   - "Average query time: 2.4s"
   - "Fastest query: 1.8s"
   - "Total queries run: 12"

4. **Placement:** Small card below results or in a collapsible stats panel

**Testing:**
- Run a query and verify timings display and add up correctly
- Run multiple queries and verify cumulative stats update

**Commit message:** `feat: add performance stats dashboard showing timing for each RAG step`

---

## SECTION 9: Integration & Final Testing

**What to do:**

1. **Full end-to-end test:**
   - Start the app (`npm run dev`)
   - Load the home page
   - Toggle between filter and custom question modes
   - Select a chunking strategy and verify metrics display
   - Run a query
   - Verify retrieval pipeline visualization shows all steps
   - Click on "Before Re-ranking" tab and verify results show cosine scores + ranks
   - Click on "After Re-ranking" tab and verify results reordered + rank changes visible
   - Verify emotion heatmap displays
   - Verify performance stats show
   - Run the same query with a different emotion
   - Verify new results appear in response history
   - Check that responses are different (different context + tone)

2. **Check for errors:**
   - Open browser DevTools (F12) → Console
   - Verify no red errors
   - Verify no TypeScript build warnings

3. **Responsive design:**
   - Resize browser window to mobile size (375px wide)
   - Verify visualizations stack nicely
   - Verify buttons/inputs are clickable

**Commit message:** `test: verify all features working end-to-end`

---

## SECTION 10: Final Cleanup & Commit

**What to do:**

1. **Update CLAUDE.md** to reflect new features:
   - Add sections on new visualizations
   - Update data flow to mention emotion history & comparison
   - Document performance stats tracking

2. **Add inline comments** to new components explaining visualizations

3. **Final commit:**
   ```bash
   git add .
   git commit -m "feat: complete RAG learning interface with visualizations, multi-emotion responses, and performance insights"
   ```

4. **Test build:**
   ```bash
   npm run build
   npm run build-index
   ```
   Verify both complete without errors.

5. **Push to GitHub:**
   ```bash
   git push origin main
   ```

---

## Summary of What You're Building

By the end, users will see:
1. ✅ **Clear input choice** (filter OR question)
2. ✅ **Chunk strategy details** (size, count, overlap)
3. ✅ **Multi-emotion exploration** (same query, different emotions → different responses)
4. ✅ **RAG pipeline transparency** (see all 4 steps + timings)
5. ✅ **Re-ranking impact** (before/after comparison with rank changes)
6. ✅ **Emotion analysis** (heatmap showing emotional tone per chunk)
7. ✅ **Strategy education** (static comparison showing chunk boundaries)
8. ✅ **Performance insights** (timing breakdown per step)

This transforms the app from a "working RAG" into an **interactive RAG learning tool**.

---

## Notes

- **Testing is critical:** After each section, test locally. Don't skip ahead if something's broken.
- **Commit frequently:** 1–2 commits per section keeps history clean.
- **UI consistency:** Use shadcn/ui components to stay consistent with the existing design.
- **Performance:** Visualizations should not slow down queries. All rendering is client-side; no new API calls.
- **Accessibility:** Add alt text to visualizations, ensure keyboard navigation works.

Good luck! This is a great feature set.
