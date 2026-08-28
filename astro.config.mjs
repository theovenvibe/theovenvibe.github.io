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
      // /offer/ joined /checkout/ in carrying noindex (it is a landing page for
      // an ad, not something to rank), and it was still being listed here —
      // the same contradictory signal, reintroduced by a later page. Keep this
      // list and the noindex props in step: a URL should never be both.
      // /r/ is the third: it is a redirect to Google's review box that exists
      // only to shorten a link inside a WhatsApp bill. It carries noindex, so
      // by the rule above it must not be listed here either.
      filter: (page) =>
        !page.includes('/checkout') && !page.includes('/offer') && !page.endsWith('/r/'),
      // lastmod = build time: pages are regenerated wholesale each deploy,
      // so the build date is the honest per-URL modification signal here.
      serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
    }),
  ],
});
