/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  reactStrictMode: true,
  // Avoid Webpack filesystem cache on WSL (/mnt/c) which causes ENOENT rename errors
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache or disable entirely to prevent rename issues
      // Using false is the most robust on Windows/WSL
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;