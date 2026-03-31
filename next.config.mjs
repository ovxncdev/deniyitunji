/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/proxysocket',         destination: '/proxysocket.html' },
      { source: '/proxysocket/pay',     destination: '/proxysocket/pay/index.html' },
      { source: '/proxysocket/success', destination: '/proxysocket/success/index.html' },
      { source: '/proxysocket/redeem',  destination: '/proxysocket/redeem/index.html' },
    ]
  },
}

export default nextConfig
