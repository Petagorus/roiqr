import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output enables the slim Docker runtime image.
  output: "standalone",
  // QR images are generated as data-URLs client-side; no external image host.
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  // Single-file Docker image: keep the build self-contained.
};

export default nextConfig;
