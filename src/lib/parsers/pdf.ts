import * as pdfjsLib from "pdfjs-dist";
import { ParsedDocument } from "@/types";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";

export async function parsePDF(filePath: string): Promise<ParsedDocument[]> {
  try {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const results: ParsedDocument[] = [];

    const fileName = filePath.split("/").pop() || filePath;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      results.push({
        text,
        sourceFile: fileName,
        pageNumber: i,
      });
    }

    return results;
  } catch (error) {
    console.error(`Failed to parse PDF ${filePath}:`, error);
    return [];
  }
}
