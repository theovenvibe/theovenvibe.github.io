// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Single source of truth for the canonical origin (PRD §9 "domain-ready"):
// when a custom domain arrives, change ONLY this line (+ DNS/CNAME).
export const SITE_URL = 'https://theovenvibe.com';

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
      // /claim/ is the fourth, found 31 Aug 2026 while chasing the domain
      // move: it carries noindex and was still listed here. It must stay out
      // of the index for a business reason, not just a technical one -- the
      // page grants Rs 100 of Dough, and the campaign only works because the
      // link is handed out deliberately. Indexed, anyone could search for it
      // and claim.
      filter: (page) => !['/checkout', '/offer', '/claim', '/r', '/404'].includes(new URL(page).pathname.replace(/\/$/, '')),
      // Builds alone are not substantive page edits. Do not advance lastmod
      // on every deployment; genuine article edit dates live with the article.
      serialize: (item) => ({ ...item, url: `${item.url.replace(/\/$/, '')}/` }),
    }),
  ],
});
