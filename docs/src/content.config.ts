import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/docs/" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

const gettingStarted = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/getting-started/" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { docs, "getting-started": gettingStarted };
