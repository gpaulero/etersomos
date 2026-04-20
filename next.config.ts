import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "*.space.z.ai",
    "preview-chat-326c756f-2bf5-451f-862d-fcf7067dd677.space.z.ai",
  ],
};

export default nextConfig;
