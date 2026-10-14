# Maintain Pavements · website

Next.js 16 (App Router, every route prerendered static), built on the Standing Ground design system in `../design-system`.

```bash
npm install
npm run dev      # http://localhost:3000 — copies ../design-system/tokens.css in first
npm run build    # production build
npm run check    # self-check for the enquiry form logic
```

## Where things live

| Path | What |
|---|---|
| `content/site.ts` | All copy, from Jon's SuperBase capability statement. Say nothing stronger than it: see `../MaintainPavements/01 Jon's Plan/Claims Register.md`. |
| `content/images.ts` | Image slots and alt text. |
| `app/globals.css` | Components and motion. Tokens come from `app/tokens.css`, a synced copy; edit `../design-system/tokens.css` instead. |
| `components/` | `ui.tsx` (server parts), plus `NavLinks`, `RevealObserver` and `ContactForm` (client). |

## Deploy on Vercel

1. In Vercel, choose **Add New → Project** and import `MaintainTechnology/maintain-pavements`.
2. Set **Root Directory** to `website`. Vercel detects Next.js; keep the default build settings.
3. Deploy. No environment variables are needed: absolute URLs (Open Graph, sitemap, robots) come from the project's production domain. Set `SITE_URL` only to force a different origin.

After that, pushes to `main` deploy to production and other branches get preview URLs, which are behind Vercel login by default.

- `package.json` pins Node 22.x (`engines`), the version the site was built and checked on locally.
- `../.vercelignore` limits uploads to this folder plus `design-system/tokens.css`, so the repo-root `.env` (image-generation keys) and the footage never leave this machine. Don't add `GEMINI_API_KEY` to Vercel; the site doesn't use it.
- `next.config.ts` sends baseline security headers on every route.
- Replace the placeholder images (below) before the first production deploy.

## Images

`npm run images` generates every section image with Gemini (`GEMINI_API_KEY` from the repo-root `.env`) and skips files that already exist. Until the key has credit again, the slots hold placeholders cropped from the photos in Jon's PDF. To replace them all:

```bash
npm run images -- --force
```

One image only: `npm run images -- hero-yard`. `evidence-forklift.webp` is Jon's own site photo and is never generated.

## Not built yet

- **Testimonials:** `testimonials` in `content/site.ts` is empty on purpose. Add real quotes with written approval and the section appears.
- **Form delivery:** the contact form writes the email in the visitor's own mail app; there is no backend. Swap in a Server Action once an email provider is chosen.
