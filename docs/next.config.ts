import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

export default withContentCollections(nextConfig);
