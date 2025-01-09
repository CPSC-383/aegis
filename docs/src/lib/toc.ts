import { TableOfContentsItem } from "@/types";

export function getHeadings(content: string): TableOfContentsItem[] {
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks: string[] = [];

  // Replace code blocks with placeholders and store them
  const contentWithoutCode = content.replace(codeBlockRegex, (match) => {
    codeBlocks.push(match);
    return `CODE_BLOCK_${codeBlocks.length - 1}`;
  });

  // Match all headers (h1-h6) that use the # syntax
  const headerRegex = /^#{1,6}\s+(.+)$/gm;
  const slugRegex = /[^a-zA-Z0-9\-\s]/g;
  const headers: TableOfContentsItem[] = [];
  let match;

  while ((match = headerRegex.exec(contentWithoutCode)) !== null) {
    let headerText = match[1].trim();
    const level = match[0].split(" ")[0].length;

    headerText = headerText.split("(")[0].trim();
    const slug = headerText
      .toLowerCase()
      .replace(slugRegex, "")
      .replace(/\s+/g, "-");

    headers.push({
      level,
      text: headerText,
      slug,
    });
  }

  return headers;
}
