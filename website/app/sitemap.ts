import type { MetadataRoute } from "next";
import { nav } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...nav.map((item) => item.href)].map((path) => ({ url: new URL(path, siteUrl).href }));
}
