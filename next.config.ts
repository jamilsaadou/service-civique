import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  // Configuration pour les API routes
  // api: {
  //   bodyParser: {
  //     sizeLimit: "100mb",
  //   },
  //   responseLimit: "100mb",
  // },
};

export default nextConfig;
