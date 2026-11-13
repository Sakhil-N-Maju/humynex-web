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
  // UI-only demo deploys (npm run build:demo) build a seeded SQLite file at
  // build time and ship it read-only with every server function.
  outputFileTracingIncludes: {
    "/**": ["./prisma/demo.db"],
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
