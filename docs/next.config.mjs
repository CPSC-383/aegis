import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "export",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  basePath: process.env.NODE_ENV === "production" ? "/aegis" : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
