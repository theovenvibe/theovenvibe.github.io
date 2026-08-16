/**
 * Publishes the site config at `/site.config.json`.
 *
 * The backend Worker reads this to build the admin panel's locality dropdown
 * (`handleLocalities` in the-oven-vibe-backend/src/admin.ts) rather than
 * keeping its own copy of the delivery areas, so the two can never drift.
 *
 * It is emitted from `src/lib/data.ts`'s already-validated `site` object
 * rather than copying the file into `public/` — one source of truth, and the
 * schema check still runs over it at build time.
 *
 * Nothing here is secret: this config drives the public price calculator and
 * is already bundled into the client JavaScript (CLAUDE.md — no secret may
 * ever reach this repo).
 */
import type { APIRoute } from 'astro';
import { site } from '../lib/data';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(site), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
