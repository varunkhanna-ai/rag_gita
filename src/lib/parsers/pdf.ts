import * as fs from "fs/promises";
import * as path from "path";
import { ParsedDocument } from "@/types";

export async function parsePDF(filePath: string): Promise<ParsedDocument[]> {
  try {
    // pdfjs-dist's legacy build is ESM-only; this module runs under ts-node's
    // CommonJS build script, so it must be loaded via dynamic import.
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const buffer = await fs.readFile(filePath);
    const data = new Uint8Array(buffer);
    const fileName = path.basename(filePath);

    const pdf = await pdfjsLib.getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise;

    const results: ParsedDocument[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .trim();

      if (text) {
        results.push({
          text,
          sourceFile: fileName,
          pageNumber: i,
        });
      }
    }

    if (results.length === 0) {
      console.warn(
        `  No extractable text in ${fileName} (likely a scanned/image-only PDF — OCR would be required)`
      );
    }

    return results;
  } catch (error) {
    console.error(`Failed to parse PDF ${filePath}:`, error);
    return [];
  }
}
