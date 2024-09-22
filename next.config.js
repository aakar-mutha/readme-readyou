/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    largePageDataBytes: 128 * 100000, // 12.8MB
  },
}

module.exports = nextConfig
