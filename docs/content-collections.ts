import { defineCollection, defineConfig } from "@content-collections/core";

const documents = defineCollection({
  name: "Doc",
  directory: "content/getting-started",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
  }),
  transform: (doc) => ({
    ...doc,
    slugAsParams: doc._meta.path.split("/").slice(1).join("/"),
  }),
});

export default defineConfig({
  collections: [documents],
});
