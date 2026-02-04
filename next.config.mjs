/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    // Disable React Compiler for now to fix parsing issues
    reactCompiler: false,
  },
};

export default nextConfig;
