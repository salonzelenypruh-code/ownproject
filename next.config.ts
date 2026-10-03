import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Povoleno jen to, co web skutečně používá: GA4, Facebook Pixel, mapa Google (iframe), fotky z Vercel Blob.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.google-analytics.com https://*.googletagmanager.com https://www.facebook.com",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""} https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.facebook.com https://connect.facebook.net`,
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  serverExternalPackages: ["sharp", "@libsql/client"],
  experimental: { serverActions: { bodySizeLimit: "15mb" } },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Staré adresy statické verze (*.html) -> nové
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/:page(kosmetika|masaze|darkovy-poukaz|rezervace|kontakty|galerie).html", destination: "/:page", permanent: true },
    ];
  },
};

export default nextConfig;
