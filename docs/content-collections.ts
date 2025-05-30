import { rehypeSlug } from "@/lib/rehype-slug";
import { extractAttributes } from "@/lib/extract-attributes";
import { extractMethods } from "@/lib/extract-methods";
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import rehypePrettyCode, { type Options } from "rehype-pretty-code";

const prettyCodeOptions: Options = {
  theme: {
    dark: "tokyo-night",
    light: "catppuccin-latte",
  },
};

const createCollections = (version: 'pathfinding' | 'mas') => {
  const gettingStarted = defineCollection({
    name: `GettingStarted${version === 'pathfinding' ? 'Pathfinding' : 'MAS'}`,
    directory: `content/${version}/getting-started`,
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
        version,
      };
    },
  });

  const docs = defineCollection({
    name: `Doc${version === 'pathfinding' ? 'Pathfinding' : 'MAS'}`,
    directory: `content/${version}/docs`,
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
        attributes: extractAttributes(document.content),
        methods: extractMethods(document.content),
        version,
      };
    },
  });

  const guides = defineCollection({
    name: `Guides${version === 'pathfinding' ? 'Pathfinding' : 'MAS'}`,
    directory: `content/${version}/guides`,
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
        version,
      };
    },
  });

  return { gettingStarted, docs, guides };
};

const commonErrors = defineCollection({
  name: "CommonErrors",
  directory: `content/common-errors`,
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


// Create collections for both versions
const pathfindingCollections = createCollections('pathfinding');
const masCollections = createCollections('mas');

export default defineConfig({
  collections: [
    // Pathfinding collections
    pathfindingCollections.gettingStarted,
    pathfindingCollections.docs,
    pathfindingCollections.guides,

    // MAS collections
    masCollections.gettingStarted,
    masCollections.docs,
    masCollections.guides,

    commonErrors
  ],
});
