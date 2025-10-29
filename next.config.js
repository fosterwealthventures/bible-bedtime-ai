/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  reactStrictMode: true,
  async rewrites() {
    // Map normalized art paths to current filenames that contain
    // spaces/case differences. Safe to remove once files are renamed.
    return [
      { source: '/art/noah-ark.png', destination: '/art/noahs-ark.png' },
      { source: '/art/shepherd-psalm-23.png', destination: '/art/shepherd-psalms 23.png' },
      { source: '/art/jesus-calms-the-storm.png', destination: '/art/Jesus-calms-the storm.png' },
      { source: '/art/good-samaritan.png', destination: '/art/good-samritan.png' },
      { source: '/art/loving-father.png', destination: '/art/Loving-father.png' },
      { source: '/art/esther-brave-choice.png', destination: '/art/Esther-brave-choice.png' },
      { source: '/art/elijah-fed.png', destination: '/art/Elijah-fed.png' },
      { source: '/art/jairus-daughter.png', destination: '/art/Jarius-daughter.png' },
      { source: '/art/jesus-birth.png', destination: '/art/Jesus-birth.png' },
    ];
  },
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
