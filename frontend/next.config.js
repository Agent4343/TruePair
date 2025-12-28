/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.dicebear.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
