import assert from 'node:assert/strict';
import { readFileSync,readdirSync } from 'node:fs';
const origin=readFileSync('astro.config.mjs','utf8').match(/export const SITE_URL = '([^']+)'/)[1];
const keys=readdirSync('public').filter(n=>/^[a-f0-9]{32}\.txt$/.test(n));
assert.equal(keys.length,1,'One unambiguous public ownership file');
const key=readFileSync(`public/${keys[0]}`,'utf8').trim();
assert.equal(`${key}.txt`,keys[0]);
const urlList=[...readFileSync('dist/sitemap-0.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.ok(urlList.length>0 && urlList.length<=10000);
assert.ok(urlList.every(url=>new URL(url).origin===origin));
if(!process.argv.includes('--submit')) {
 console.log(JSON.stringify({mode:'preview only',endpoint:'https://api.indexnow.org/indexnow',urlCount:urlList.length,urlList},null,2));
} else {
 const proof=await fetch(`${origin}/${keys[0]}`,{signal:AbortSignal.timeout(20000)});
 assert.equal(proof.status,200,'Publish ownership file first');
 assert.equal((await proof.text()).trim(),key);
 for(const path of ['/choose/','/content-standards/']) {
  const response=await fetch(`${origin}${path}`,{signal:AbortSignal.timeout(20000)});
  assert.equal(response.status,200,`Publish content first: ${path}`);
 }
 const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({host:new URL(origin).host,key,keyLocation:`${origin}/${keys[0]}`,urlList}),signal:AbortSignal.timeout(30000)});
 console.log(JSON.stringify({submittedAt:new Date().toISOString(),urlCount:urlList.length,httpStatus:response.status,response:await response.text(),meaning:'Notification receipt only; not indexing, ranking or AI-citation confirmation.'},null,2));
 assert.ok([200,202].includes(response.status),'Notification accepted');
}
