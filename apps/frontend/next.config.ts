import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', 'localhost', 'http://127.0.0.1:3000'],
};

export default nextConfig;
