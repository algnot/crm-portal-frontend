import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:slug/portal/invite",
        destination: "/portal/invite",
      },
    ];
  },
};

export default nextConfig;
