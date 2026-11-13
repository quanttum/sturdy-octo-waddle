# Personal site — Consulting · Fintech · Implementation

Dark, minimal portfolio + services site built with [Astro](https://astro.build) and Tailwind CSS v4. Static output, no backend.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Where to edit content

| What | File |
| --- | --- |
| Name, headline, tagline, email, LinkedIn, photo | `src/site.config.ts` |
| Services (3) | `src/content/services/*.md` |
| Packages (scope, duration, price) | `src/content/packages.json` |
| Platforms delivered | `src/content/platforms.json` |
| Case studies | `src/content/case-studies/*.md` (add a file → new page) |
| Testimonials (section hidden while empty) | `src/content/testimonials.json` |
| Career timeline | `src/content/timeline.json` |
| Home proof strip and stats | `src/pages/index.astro` |
| About bio, education, FAQ | `src/pages/about.astro` |
| Colors & type | `src/styles/global.css` (`@theme` block) |
| Domain (sitemap/canonical) | `astro.config.mjs` → `site`, and `public/robots.txt` |
| Social preview / favicon | `public/og.png`, `public/favicon.svg` |

Search the repo for `TODO` to find every placeholder.

## Deploy (Vercel or Netlify)

1. Push this repo to GitHub.
2. In Vercel or Netlify, **Import project** → pick the repo. Framework is auto-detected as Astro (build `npm run build`, output `dist`).
3. Add your custom domain in the host's dashboard, then set `site` in `astro.config.mjs` to that domain.

Every push to the main branch redeploys automatically.
