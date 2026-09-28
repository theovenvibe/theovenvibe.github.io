import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import sharp from 'sharp';
import {applyMenuBatch} from '../scripts/menu-batch.mjs';
const root=await mkdtemp(join(tmpdir(),'ov-menu-batch-'));
try{
  for(const path of ['menu.json','site.config.json','public/static/images'])await cp(path,join(root,path),{recursive:true});
  const menu=JSON.parse(await readFile('menu.json','utf8')),config=JSON.parse(await readFile('site.config.json','utf8'));
  const original=structuredClone(menu),hero=menu.Menu_Items.find(r=>String(r.product_code)===String(config.hero_dish_code));
  const heroCode=String(hero.image_code||hero.product_code),source='public/static/images/product_images/'+heroCode+'.webp';
  const asset=await readFile('public/static/images/product_images/745802351-2.webp');
  menu._draft_photos={['Menu_Items:'+hero.product_code]:['asset:'+'a'.repeat(64),source]};
  const pasta=menu.Menu_Items.find(r=>config.delivery.late_night.unavailable_categories.includes(r.category));assert.ok(pasta,'Actual unavailable station required');pasta.category='Renamed station';pasta.display_name='Renamed vegetarian dish';
  const sandwich=menu.Menu_Items.find(r=>/sandwich/i.test(r.item_name));sandwich.item_name='Vegetarian Toast';sandwich.category='Toasts';sandwich.serving={amount:8,unit:'pieces'};
  menu.Combos[0].items_included=[sandwich.product_code,hero.product_code];menu.Combos[0].item_quantities={[sandwich.product_code]:2,[hero.product_code]:3};
  const result=await applyMenuBatch({menu,base_sha:'a'.repeat(40),version:5},root,async()=>asset);
  assert.equal(result._draft_photos,undefined);assert.deepEqual(result.Menu_Items.map(r=>r.product_code),original.Menu_Items.map(r=>r.product_code));
  assert.equal(result.Menu_Items.find(r=>r.product_code===pasta.product_code).late_night_available,false,'Category/name edits must not reopen a boiling station');
  assert.deepEqual(result.Menu_Items.find(r=>r.product_code===sandwich.product_code).stock_recipe,[{dish:'sandwich',units:1}],'Rename and serving labels must not change ingredients');
  assert.deepEqual(result.Combos[0].stock_recipe,[{dish:'sandwich',units:2},{dish:'pizza',units:3}],'Combos consume every component quantity');
  const editedHero=result.Menu_Items.find(r=>r.product_code===hero.product_code),stem=join(root,'public/static/images/product_images',editedHero.image_code);
  for(const suffix of ['.webp','.avif','-2.webp','-2.avif']){const metadata=await sharp(await readFile(stem+suffix)).metadata();assert.equal(metadata.width,600);assert.equal(metadata.height,400);}
  const og=await sharp(await readFile(join(root,'public/static/images/og/og-default.jpg'))).metadata();assert.equal(og.format,'jpeg');assert.equal(og.width,1200);assert.equal(og.height,630);
  await writeFile(join(root,'menu.json'),JSON.stringify(original));
  const historic=structuredClone(original);historic._draft_photos={['Menu_Items:'+hero.product_code]:['source:'+'b'.repeat(40)+':public/static/images/product_images/removed-old-photo.webp']};
  const legacySquare=await sharp({create:{width:1024,height:1024,channels:3,background:'#ddaa55'}}).webp().toBuffer();
  let sourceRead=null;const historicalResult=await applyMenuBatch({menu:historic,base_sha:'a'.repeat(40),version:6},root,async()=>asset,async(sha,path)=>{sourceRead={sha,path};return legacySquare;});
  assert.deepEqual(sourceRead,{sha:'b'.repeat(40),path:'public/static/images/product_images/removed-old-photo.webp'});assert.ok(historicalResult.Menu_Items.find(r=>r.product_code===hero.product_code).image_code.startsWith('OV-item-'));
  const restoredImage=historicalResult.Menu_Items.find(r=>r.product_code===hero.product_code).image_code;
  const restoredMetadata=await sharp(await readFile(join(root,'public/static/images/product_images',restoredImage+'.webp'))).metadata();assert.equal(restoredMetadata.width,600);assert.equal(restoredMetadata.height,400,'Legacy square photos are normalized for customer cards');
  await writeFile(join(root,'menu.json'),JSON.stringify(original));
  const malicious=structuredClone(original);malicious._draft_photos={['Menu_Items:'+hero.product_code]:['../../outside.webp']};
  await assert.rejects(()=>applyMenuBatch({menu:malicious,base_sha:'a'.repeat(40),version:6},root,async()=>asset),/Unsafe photo/);
  console.log('Batch: isolated source writes, stable IDs, WebP/AVIF pairs, reordered photos, hero JPEG1200x630, late-night rename preservation and unsafe paths rejected.');
}finally{
  const absolute=resolve(root),parent=resolve(tmpdir());if(!absolute.startsWith(parent+requireSeparator())||!absolute.split(requireSeparator()).at(-1).startsWith('ov-menu-batch-'))throw new Error('Unsafe cleanup path');
  await rm(absolute,{recursive:true,force:true,maxRetries:5,retryDelay:100});
}
function requireSeparator(){return process.platform==='win32'?'\\':'/';}
