import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/intro",
        permanent: true,
      },
      {
        source: "/getting-started",
        destination: "/getting-started/installation",
        permanent: true,
      },
    ];
  },
};

export default withContentCollections(nextConfig);
