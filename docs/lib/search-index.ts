import { allDocPathfindings, allDocMAS } from "content-collections";

export const searchPathfinding = allDocPathfindings.map((doc) => ({
  title: doc.title,
  slug: `/pathfinding/docs/${doc.slug}`,
  description: doc.description,
  content: doc.content,
  attributes: doc.attributes,
  methods: doc.methods,
}));

export const searchMas = allDocMAS.map((doc) => ({
  title: doc.title,
  slug: `/mas/docs/${doc.slug}`,
  description: doc.description,
  content: doc.content,
  attributes: doc.attributes,
  methods: doc.methods,
}));
