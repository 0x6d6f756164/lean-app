import type { MetadataRoute } from "next";
import { SITE } from "./site";

export const PWA_ICONS: NonNullable<MetadataRoute.Manifest["icons"]> = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
  { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

export function buildManifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#0369a1",
    icons: PWA_ICONS,
  };
}