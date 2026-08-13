/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Keep the dev overlay out of the bottom-left corner, where the signature sits.
  devIndicators: {
    position: 'bottom-right',
  },
}

export default nextConfig
