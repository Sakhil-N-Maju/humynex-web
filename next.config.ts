import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages here read the session cookie and live database on almost every request
  // (stock, prices, cart, admin edits), so per-request rendering is the default.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // Admin image uploads and 3D model files go through server actions.
      bodySizeLimit: "64mb",
    },
  },
};

export default nextConfig;
