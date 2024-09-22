/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    largePageDataBytes: 128 * 100000, // 12.8MB
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.buymeacoffee.com',
      },
    ],
  },
}

module.exports = nextConfig
