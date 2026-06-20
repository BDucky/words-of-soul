import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Firebase Storage
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      // Unsplash placeholder images
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
