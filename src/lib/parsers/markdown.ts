import * as fs from "fs/promises";
import * as path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { ParsedDocument } from "@/types";

export async function parseMarkdown(
  filePath: string
): Promise<ParsedDocument[]> {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data: frontmatter, content } = matter(fileContent);
    const tokens = marked.lexer(content);

    const results: ParsedDocument[] = [];
    const fileName = path.basename(filePath);
    let currentHeading: string | undefined;

    for (const token of tokens) {
      if (token.type === "heading") {
        currentHeading = (token as { text: string }).text;
      } else if (
        token.type === "paragraph" ||
        token.type === "text" ||
        token.type === "blockquote"
      ) {
        const text = (token as { text?: string; raw?: string }).text || (token as { raw: string }).raw;
        if (text && text.trim()) {
          results.push({
            text: text.trim(),
            sourceFile: fileName,
            heading: currentHeading,
            frontmatter: { ...frontmatter },
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error(`Failed to parse markdown ${filePath}:`, error);
    return [];
  }
}
