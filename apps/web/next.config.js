/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@blocks/core", "@blocks/ui"],
  experimental: {
    optimizePackageImports: ["@blocks/ui", "lucide-react"],
  },
};

module.exports = nextConfig;

