import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com", "http://100.121.94.27:3000"],
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "@untitledui/icons",
      "react-aria-components",
      "sonner",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
};

export default nextConfig;
