import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "id-preview--f9a2ee83-d805-4d9f-8d98-613ba44001b3.lovable.app",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
