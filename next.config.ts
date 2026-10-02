import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["sharp", "@libsql/client"],
  experimental: { serverActions: { bodySizeLimit: "15mb" } },
  async redirects() {
    // Staré adresy statické verze (*.html) -> nové
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/:page(kosmetika|masaze|darkovy-poukaz|rezervace|kontakty|galerie).html", destination: "/:page", permanent: true },
    ];
  },
};

export default nextConfig;
