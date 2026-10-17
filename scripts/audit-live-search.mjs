import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const origin=readFileSync('astro.config.mjs','utf8').match(/export const SITE_URL = '([^']+)'/)[1];
const baseline=process.argv.includes('--baseline');
async function get(path) {
 const url=new URL(path,origin);
 assert.equal(url.origin,origin,'Only this business host');
 const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
 assert.equal(response.status,200,`${url.pathname}: HTTP ${response.status}`);
 assert.equal(new URL(response.url).origin,origin,'No unexpected host redirect');
 assert.doesNotMatch(response.headers.get('x-robots-tag')??'',/noindex/i,`${url.pathname}: indexable response header`);
 return response.text();
}
const index=await get('/sitemap-index.xml');
const urls=[];
for (const map of [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])) {
 const xml=await get(map); urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
}
assert.ok(urls.length>=15,'Expected established public routes');
for (const url of urls) {
 const html=await get(url);
 assert.ok(html.includes(`rel="canonical" href="${url}"`),`Canonical ${url}`);
 assert.doesNotMatch(html,/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
 assert.equal((html.match(/<h1(?:\s|>)/g)??[]).length,1,`H1 ${url}`);
 assert.match(html,/<meta name="description" content="[^"]+"/);
 const graphs=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
 assert.ok(graphs.length>0,`JSON-LD ${url}`); for(const block of graphs)JSON.parse(block[1]);
 assert.doesNotMatch(html,/Bhuk\s+Lagla/i,'Separate business');
}
const robots=await get('/robots.txt');
assert.match(robots,/User-agent: \*\s+Allow: \/(?:\s|$)/i);
assert.ok(robots.includes(`${origin}/sitemap-index.xml`));
if(!baseline) for(const route of ['/faq/','/choose/','/content-standards/'])assert.ok(urls.includes(`${origin}${route}`),`Released guide in sitemap: ${route}`);
console.log(JSON.stringify({checkedAt:new Date().toISOString(),origin,mode:baseline?'pre-release baseline':'release audit',publicPagesChecked:urls.length,result:'passed',scope:'Public HTTP, sitemap, canonical, H1, JSON-LD, metadata and indexability. Not actual bot access logs, indexing, ranking or AI-citation confirmation.'},null,2));
