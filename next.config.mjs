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
  
  // Minimal webpack config to avoid build issues
  webpack: (config, { isServer, dev }) => {
    // Increase memory limit
    if (!dev) {
      config.optimization.minimize = false; // Disable minification temporarily
    }
    
    // Handle large files more gracefully
    config.performance = {
      maxAssetSize: 5000000, // 5MB
      maxEntrypointSize: 5000000, // 5MB
      hints: false, // Disable warnings
    };
    
    return config;
  },
  
  // Use default output for now
  // output: 'standalone',
};

export default nextConfig;
