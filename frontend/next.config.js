/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3003',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/uploads/**',
      },
    ],
  },

  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1',
  },
};

module.exports = nextConfig;


