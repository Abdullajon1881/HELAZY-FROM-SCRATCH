/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.healzy.uz', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
