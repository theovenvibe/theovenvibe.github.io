import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHmac} from 'node:crypto';
import {applyMenuBatch} from './menu-batch.mjs';
const id=process.env.MENU_JOB_ID,key=process.env.MENU_BUILD_KEY,origin=process.env.MENU_BACKEND_URL;
if(!/^[a-f0-9-]{36}$/.test(id||'')||!key||key.length<32||origin!=='https://api.theovenvibe.com')throw new Error('Invalid build configuration');
const token=createHmac('sha256',key).update(id).digest('hex');
// Mask before any request or possible diagnostic output. Never log response bodies.
console.log('::add-mask::'+token);
const base=origin+'/menu-build/'+id;
const request=async(path,body)=>{
  const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw new Error('Menu build request failed ('+r.status+')');return r;
};
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const mode=process.argv[2];
if(mode==='prepare'){
  const manifest=await (await request('/manifest')).json();
  if(git('rev-parse','HEAD')!==manifest.base_sha)throw new Error('Published source moved; refusing to prepare this batch.');
  await request('/status',{status:'validating',run_id:Number(process.env.GITHUB_RUN_ID)});
  await applyMenuBatch(manifest,process.cwd(),async(asset)=>new Uint8Array(await (await request('/assets/'+asset)).arrayBuffer()));
  await writeFile('PROGRESS.md',(await readFile('PROGRESS.md','utf8'))+'\n## Owner menu batch '+id+'\nDraft revision '+manifest.version+'. Prepared as one batch; no production merge or deploy from this workflow.\n');
  await writeFile('/tmp/ov-menu-batch.json',JSON.stringify({base_sha:manifest.base_sha,version:manifest.version}));
}else if(mode==='result'){
  const result=JSON.parse(await readFile('/tmp/ov-menu-result.json','utf8'));
  await request('/status',{status:'building',run_id:Number(process.env.GITHUB_RUN_ID),commit_sha:result.commit_sha,pr_number:result.pr_number});
}else if(mode==='failed'){
  await request('/status',{status:'failed',run_id:Number(process.env.GITHUB_RUN_ID),error:'Batch validation or build failed. Review the GitHub run; the published menu is unchanged.'});
}else throw new Error('Unknown build step');
