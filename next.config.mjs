/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimize build performance
  experimental: {
    optimizeCss: true,
    turbo: {
      rules: {
        '*.scss': {
          loaders: ['sass-loader'],
          as: '*.css',
        },
      },
    },
  },
  
  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Increase build timeout for Vercel
  staticPageGenerationTimeout: 180,
  
  // Optimize webpack for large CSS files and build performance
  webpack: (config, { isServer, dev }) => {
    // Optimize CSS handling
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
    }
    
    // Reduce memory usage during build
    if (!dev) {
      config.optimization.minimize = true;
      config.optimization.sideEffects = false;
    }
    
    // Handle large files
    config.performance = {
      maxAssetSize: 1000000,
      maxEntrypointSize: 1000000,
    };
    
    return config;
  },
  
  // Reduce build output
  output: 'standalone',
};

export default nextConfig;
