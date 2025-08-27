import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  images: {
    domains: ["images.unsplash.com"],
  },

  // 🚨 This is the key
  eslint: {
    ignoreDuringBuilds: true,
  },

  // optional: disable type-checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withMDX(nextConfig);