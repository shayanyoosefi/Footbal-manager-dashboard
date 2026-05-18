import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/manager",
        destination: "/coach",
        permanent: true,
      },
      {
        source: "/manager/:path*",
        destination: "/coach/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
