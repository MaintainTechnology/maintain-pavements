import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// ponytail: allow everything. Preview deployments sit behind Vercel's default deployment
// protection, so only production is crawlable.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: new URL("/sitemap.xml", siteUrl).href };
}
