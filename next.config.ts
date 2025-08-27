import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Enable MDX support
const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  // Make Next.js recognize .mdx files as pages/components
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  // Allow external image domains
  images: {
    domains: ["images.unsplash.com"], // add any other domains you might use
  },
};

export default withMDX(nextConfig);