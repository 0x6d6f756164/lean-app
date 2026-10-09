import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...TOOLS.filter((t) => t.ready).map((t) => t.href)];
  return paths.map((path) => ({ url: `${SITE.url}${path}`, lastModified: new Date() }));
}