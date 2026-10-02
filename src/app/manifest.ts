import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kosmetika a masáže na Zeleném pruhu",
    short_name: "Zelený pruh",
    start_url: "/",
    display: "standalone",
    background_color: "#06160c",
    theme_color: "#06160c",
    lang: "cs",
    icons: [
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
