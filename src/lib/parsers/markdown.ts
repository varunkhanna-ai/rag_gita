import matter from "gray-matter";
import { marked } from "marked";
import { ParsedDocument } from "@/types";

export async function parseMarkdown(
  filePath: string
): Promise<ParsedDocument[]> {
  try {
    const response = await fetch(filePath);
    const fileContent = await response.text();
    const { data: frontmatter, content } = matter(fileContent);
    const tokens = marked.lexer(content);

    const results: ParsedDocument[] = [];
    const fileName = filePath.split("/").pop() || filePath;
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
        if (text.trim()) {
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
