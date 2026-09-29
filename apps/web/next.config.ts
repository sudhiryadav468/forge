import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The browser only talks to its own origin. This proxy forwards API calls server-side.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000'}/api/:path*` }];
  },
  allowedDevOrigins: ['*.e2b.app', '127.0.0.1', 'localhost'],
  devIndicators: false,
};
export default nextConfig;
