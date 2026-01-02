import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Generates the 'out' folder instead of '.next'
  basePath: '/greenview-web', // MUST match your GitHub repository name
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js image optimization
  },
};

export default nextConfig;
