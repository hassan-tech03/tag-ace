import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Self-contained server bundle (`.next/standalone`) for the Docker image.
  output: "standalone",

  // Shared workspace packages ship plain ESM source.
  transpilePackages: ["@mushk/db"],

  experimental: {
    // Trace dependencies from the monorepo root so hoisted node_modules and
    // packages/* end up in the standalone bundle.
    outputFileTracingRoot: repoRoot,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // Production build: strip console.* (except warn/error) so logs don't bloat
  // bundle size and leak debug noise to clients.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // The Unisex category was retired; keep old links working.
  async redirects() {
    return [{ source: "/shop/unisex", destination: "/shop", permanent: true }];
  },

  webpack: (config) => {
    // Stable chunk ids so dynamic chunk references don't break across deploys.
    config.optimization.moduleIds = "deterministic";
    config.optimization.chunkIds = "deterministic";
    config.performance = {
      maxAssetSize: 5_000_000,
      maxEntrypointSize: 5_000_000,
      hints: false,
    };
    return config;
  },
};

export default nextConfig;
