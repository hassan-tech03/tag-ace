/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporarily disable for build
  
  // Aggressive build optimizations
  experimental: {
    optimizeCss: false, // Disable CSS optimization temporarily
  },
  
  // Disable console removal during build to prevent issues
  compiler: {
    removeConsole: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Increase timeouts significantly
  staticPageGenerationTimeout: 300,
  
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.minimize = false;
    }

    // Stable chunk IDs prevent "Cannot find module './XXX.js'" on hot reload
    config.optimization.moduleIds = 'deterministic';
    config.optimization.chunkIds = 'deterministic';

    config.performance = {
      maxAssetSize: 5000000,
      maxEntrypointSize: 5000000,
      hints: false,
    };

    return config;
  },
  
  // Use default output for now
  // output: 'standalone',
};

export default nextConfig;
