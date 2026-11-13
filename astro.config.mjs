import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO: set to your real domain before deploying (used for sitemap + canonical URLs)
export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
