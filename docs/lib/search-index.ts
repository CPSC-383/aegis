import { allDocPathfindings, allDocMAS } from "content-collections";

const allDocs = [...allDocPathfindings, ...allDocMAS]

export const searchIndex = allDocs.map((doc) => ({
  title: doc.title,
  slug: `/docs/${doc.slug}`,
  description: doc.description,
  content: doc.content,
  attributes: doc.attributes,
  methods: doc.methods,
  assignment: doc.assignment,
}));
