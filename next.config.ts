import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  images: { unoptimized: true },
  allowedDevOrigins: ["*.space.z.ai"],
};
export default nextConfig;
