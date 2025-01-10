import { visit } from "unist-util-visit";
import { Node } from "unist";
import { Element } from "hast";

export const rehypeSlug = () => {
  return (tree: Node) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName && node.tagName.startsWith("h")) {
        const headerText = node.children
          .map((child) => (child.type === "text" ? child.value : ""))
          .join("")
          .split("(")[0]
          .trim();

        const cleanSlug = headerText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s-]/g, "")
          .replace(/\s+/g, "-");

        node.properties.id = cleanSlug;
      }
    });
  };
};
