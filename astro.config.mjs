import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// TODO: set to your real domain before deploying (used for sitemap + canonical URLs)
export default defineConfig({
  site: 'https://example.com',
  output: 'static', // pages are prerendered; only /api/* runs as Vercel functions
  adapter: vercel(),
  integrations: [sitemap({ filter: (page) => !page.includes('/api/') })],
  vite: { plugins: [tailwindcss()] },
});
