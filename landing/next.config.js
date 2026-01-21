/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the landing page to link to the workflow builder
  async rewrites() {
    return [
      {
        source: '/builder',
        destination: process.env.NEXT_PUBLIC_WORKFLOW_BUILDER_URL || 'http://localhost:5173',
      },
    ];
  },
}

module.exports = nextConfig
