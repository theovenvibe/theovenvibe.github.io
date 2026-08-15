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
  integrations: [
    sitemap({
      // /checkout/ is one customer's basket, and empty for everyone else. It
      // carries noindex, and a URL that is both noindex and in the sitemap is
      // a contradictory signal — Phase 4 removed exactly that pattern from the
      // v1 stubs, so don't reintroduce it here.
      filter: (page) => !page.includes('/checkout'),
      // lastmod = build time: pages are regenerated wholesale each deploy,
      // so the build date is the honest per-URL modification signal here.
      serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
    }),
  ],
});
