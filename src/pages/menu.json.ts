/**
 * Publishes the menu at `/menu.json`.
 *
 * The backend Worker reads this to list items in the admin panel's Menu tab
 * (P0-A, live availability) rather than keeping its own copy of the menu — a
 * mirror would be a second thing to keep in sync, and the menu drifting
 * without the Worker noticing is exactly what would make the sold-out list
 * wrong.
 *
 * Served from the same validated `menu` object the site renders from, for the
 * same reason `site.config.json.ts` exists: one source of truth, and the Zod
 * schema still runs over it at build time.
 *
 * Nothing here is secret — it is the public menu, already in every page.
 */
import type { APIRoute } from 'astro';
import menu from '../../menu.json';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(menu), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
