/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation-registration',
  },
}

module.exports = nextConfig
