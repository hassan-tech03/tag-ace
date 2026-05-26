/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // Static-page generation can include calls to MongoDB. Give them headroom
  // so the build doesn't bail out on a cold connection.
  staticPageGenerationTimeout: 180,

  // Production build: strip console.* (except warn/error) so logs don't bloat
  // bundle size and leak debug noise to clients.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
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
