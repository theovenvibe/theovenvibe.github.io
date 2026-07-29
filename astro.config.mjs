// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Single source of truth for the canonical origin (PRD §9 "domain-ready"):
// when a custom domain arrives, change ONLY this line (+ DNS/CNAME).
export const SITE_URL = 'https://theovenvibe.github.io';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
