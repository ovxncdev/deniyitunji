/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
<<<<<<< HEAD
  async rewrites() {
    return [
      { source: '/proxysocket',         destination: '/proxysocket.html' },
      { source: '/proxysocket/pay',     destination: '/proxysocket/pay/index.html' },
      { source: '/proxysocket/success', destination: '/proxysocket/success/index.html' },
      { source: '/proxysocket/redeem',  destination: '/proxysocket/redeem/index.html' },
    ]
  },
=======
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
}

export default nextConfig
