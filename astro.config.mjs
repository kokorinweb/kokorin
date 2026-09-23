import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Боевой домен задаётся по умолчанию; для GitHub Pages workflow
// подставляет SITE_URL и BASE_PATH через переменные окружения.
const site = process.env.SITE_URL || 'https://agency-kokorin.ru';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
