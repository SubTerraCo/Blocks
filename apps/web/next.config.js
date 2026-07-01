/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@blocks/ui", "lucide-react"],
  },
  transpilePackages: ["@blocks/core", "@blocks/ui"],
};

module.exports = nextConfig;

