import { TableOfContentsItem } from "@/types";

export function getHeadings(
  content: string,
  tabName: string | null,
): TableOfContentsItem[] {
  const codeBlockRegex = /```[\s\S]*?```/g;

  // Replace code blocks with placeholders to ignore them while scanning for headings
  const contentWithoutCode = content.replace(codeBlockRegex, "");

  // First, get all the general headers (those outside any TabsContent)
  // and track the positions of each TabsContent section
  const headers: TableOfContentsItem[] = [];
  const tabsPositions: { start: number; end: number; value: string }[] = [];

  // Find all TabsContent sections and their positions
  const tabsContentRegex =
    /<TabsContent\s+value=["'`](.*?)["'`]>([\s\S]*?)<\/TabsContent>/gi;
  let tabMatch;
  while ((tabMatch = tabsContentRegex.exec(contentWithoutCode)) !== null) {
    tabsPositions.push({
      start: tabMatch.index,
      end: tabMatch.index + tabMatch[0].length,
      value: tabMatch[1],
    });
  }

  // Extract headers from the whole document
  const headerRegex = /^#{1,6}\s+(.+)$/gm;
  const slugRegex = /[^a-zA-Z0-9\-\s]/g;
  let headerMatch;

  while ((headerMatch = headerRegex.exec(contentWithoutCode)) !== null) {
    // Check if this header is inside any TabsContent section
    const headerPosition = headerMatch.index;
    const isInTab = tabsPositions.some(
      (tab) => headerPosition > tab.start && headerPosition < tab.end,
    );

    // If this header is inside a tab, only include it if it's in the selected tab
    if (isInTab) {
      // Find which tab it's in
      const containingTab = tabsPositions.find(
        (tab) => headerPosition > tab.start && headerPosition < tab.end,
      );

      // Only include this header if it's in the requested tab
      if (containingTab && tabName && containingTab.value === tabName) {
        let headerText = headerMatch[1].trim();
        const level = headerMatch[0].split(" ")[0].length;
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
    } else {
      // This header is not in any tab, so include it always
      let headerText = headerMatch[1].trim();
      const level = headerMatch[0].split(" ")[0].length;
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
  }

  return headers;
}
