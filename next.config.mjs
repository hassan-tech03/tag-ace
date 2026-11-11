/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // Static-page generation can include database calls. Give them headroom
  // so the build doesn't bail out on a cold (scaled-to-zero) Neon compute.
  staticPageGenerationTimeout: 180,

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
