import * as fs from "fs/promises";
import * as path from "path";

import { parsePDF } from "../src/lib/parsers/pdf";
import { parseMarkdown } from "../src/lib/parsers/markdown";
import { createSimpleFixedChunks } from "../src/lib/chunking/simple-fixed";
import { createFixedParentChildChunks } from "../src/lib/chunking/fixed-parent-child";
import { createRecursiveParentChildChunks } from "../src/lib/chunking/recursive-parent-child";
import { embedder } from "../src/lib/embeddings/embedder";
import { Chunk, ParsedDocument } from "../src/types";

const DOCS_DIR = path.resolve(__dirname, "..", "public", "documents");
const INDEX_DIR = path.resolve(__dirname, "..", "public", "index");

async function parseDocuments(): Promise<ParsedDocument[]> {
  const files = await fs.readdir(DOCS_DIR);
  const allDocs: ParsedDocument[] = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const filePath = path.join(DOCS_DIR, file);

    if (ext === ".pdf") {
      console.log(`  Parsing PDF: ${file}`);
      const docs = await parsePDF(filePath);
      console.log(`    ${docs.length} pages with extractable text`);
      allDocs.push(...docs);
    } else if (ext === ".md") {
      console.log(`  Parsing MD: ${file}`);
      const docs = await parseMarkdown(filePath);
      console.log(`    ${docs.length} sections extracted`);
      allDocs.push(...docs);
    } else {
      console.log(`  Skipping unsupported file: ${file}`);
    }
  }

  return allDocs;
}

async function buildIndex() {
  console.log("Parsing documents...");
  const docs = await parseDocuments();
  console.log(`Parsed ${docs.length} document sections from ${DOCS_DIR}`);

  if (docs.length === 0) {
    console.log("No documents parsed. Exiting.");
    return;
  }

  await embedder.load();
  console.log("Embedder loaded.");

  const strategies: Record<string, (docs: ParsedDocument[]) => Chunk[]> = {
    simple: (d) => createSimpleFixedChunks(d, 3000, 200),
    "fixed-parent-child": (d) =>
      createFixedParentChildChunks(d, {
        parentChunkSize: 2000,
        parentOverlap: 200,
        childChunkSize: 600,
        childOverlap: 100,
      }),
    "recursive-parent-child": (d) => createRecursiveParentChildChunks(d),
  };

  const emotionMap: Record<string, Record<string, number>> = {};

  await fs.mkdir(INDEX_DIR, { recursive: true });

  for (const [strategyName, chunkFn] of Object.entries(strategies)) {
    console.log(`\nBuilding ${strategyName} index...`);
    const chunks = chunkFn(docs);
    console.log(`  ${chunks.length} chunks created`);

    console.log(`  Embedding ${chunks.length} chunks...`);
    const batchSize = 32;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map((c) => c.text);
      const embeddings = await embedder.embedBatch(texts);
      for (let j = 0; j < batch.length; j++) {
        batch[j].embedding = embeddings[j];
      }
      console.log(
        `    Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} done`
      );
    }

    const outputPath = path.join(INDEX_DIR, `${strategyName}.json`);
    await fs.writeFile(outputPath, JSON.stringify(chunks));
    console.log(`  Saved to ${outputPath}`);

    emotionMap[strategyName] = {};
    for (const chunk of chunks) {
      for (const emotion of chunk.emotions) {
        emotionMap[strategyName][emotion] =
          (emotionMap[strategyName][emotion] || 0) + 1;
      }
    }
  }

  const emotionMapPath = path.join(INDEX_DIR, "emotion-map.json");
  await fs.writeFile(emotionMapPath, JSON.stringify(emotionMap, null, 2));
  console.log(`\nEmotion map saved to ${emotionMapPath}`);

  console.log("\n=== Build Statistics ===");
  console.log(`Total documents: ${docs.length}`);
  for (const [strategyName] of Object.entries(strategies)) {
    const indexPath = path.join(INDEX_DIR, `${strategyName}.json`);
    const data = JSON.parse(await fs.readFile(indexPath, "utf-8")) as Chunk[];
    const avgSize =
      data.length > 0
        ? Math.round(
            data.reduce((sum, c) => sum + c.text.length, 0) / data.length
          )
        : 0;
    console.log(
      `${strategyName}: ${data.length} chunks, avg size: ${avgSize} chars`
    );
  }
}

async function main() {
  try {
    await buildIndex();
    console.log("\nBuild complete!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { buildIndex };
