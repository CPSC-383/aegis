import { allDocs } from "content-collections";

export const searchIndex = allDocs.map((doc) => ({
  title: doc.title,
  slug: `/docs/${doc.slug}`,
  description: doc.description,
  content: doc.content,
}));
