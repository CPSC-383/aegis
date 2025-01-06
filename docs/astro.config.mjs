// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import rehypeSlug from "rehype-slug";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/docs": "/docs/getting-started/introduction",
  },
  markdown: {
    shikiConfig: {
      theme: "tokyo-night",
    },
  },
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    mdx({
      rehypePlugins: [rehypeSlug],
    }),
  ],
});
