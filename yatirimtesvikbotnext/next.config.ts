import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Workspace root'u belirterek multiple lockfile uyarısını önle
  // Bu, Next.js'e proje root'unun nerede olduğunu söyler
  outputFileTracingRoot: path.resolve(process.cwd()),
  /* config options here */
};

export default nextConfig;
