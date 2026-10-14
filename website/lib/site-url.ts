// The canonical origin for absolute URLs (Open Graph, sitemap, robots). On Vercel it is the
// production domain, even in preview builds; set SITE_URL to override it anywhere.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = new URL(process.env.SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000"));
