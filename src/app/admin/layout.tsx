import type { Metadata, Viewport } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Administrace", template: "%s · Administrace" },
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg?v=2", apple: "/apple-touch-icon.png?v=2" },
};
export const viewport: Viewport = { themeColor: "#0d2a18", width: "device-width", initialScale: 1 };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="adm">{children}</body>
    </html>
  );
}
