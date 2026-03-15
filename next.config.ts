import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app-media.fly.storage.tigris.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
