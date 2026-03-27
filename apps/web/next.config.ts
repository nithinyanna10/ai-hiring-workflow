import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@hiring-workflow/shared",
    "@hiring-workflow/ai-engine",
    "@hiring-workflow/workflow-engine",
  ],
};

export default nextConfig;
