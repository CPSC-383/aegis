import { rehypeSlug } from "@/lib/rehype-slug";
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypePrettyCode, { type Options } from "rehype-pretty-code";

const prettyCodeOptions: Options = {
  theme: {
    dark: "tokyo-night",
    light: "catppuccin-latte",
  },
};

const gettingStarted = defineCollection({
  name: "GettingStarted",
  directory: "content/getting-started",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    assignment: z.string().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
    });
    return {
      ...document,
      mdx,
      slug: document._meta.path,
    };
  },
});

const docs = defineCollection({
  name: "Doc",
  directory: "content/docs",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    assignment: z.string().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
    });
    return {
      ...document,
      mdx,
      slug: document._meta.path,
    };
  },
});

const commonErrors = defineCollection({
  name: "CommonErrors",
  directory: "content/common-errors",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
    });
    return {
      ...document,
      mdx,
      slug: document._meta.path,
    };
  },
});

const guides = defineCollection({
  name: "Guides",
  directory: "content/guides",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    assignment: z.string().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
    });
    return {
      ...document,
      mdx,
      slug: document._meta.path,
    };
  },
});

export default defineConfig({
  collections: [gettingStarted, docs, commonErrors, guides],
});
