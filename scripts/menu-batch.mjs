import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import sharp from 'sharp';
const fields={Menu_Items:['product_code','product_images'],Combos:['combo_code','combo_images'],Add_ons:['addon_code','add_on_images']};
const safe=/^[A-Za-z0-9_-]{1,80}$/;
/** All writes are source files inside an isolated Actions checkout. */
export async function applyMenuBatch(manifest,root,fetchAsset,fetchSource=async(sha,path)=>{
  const response=await fetch('https://raw.githubusercontent.com/theovenvibe/theovenvibe.github.io/'+sha+'/'+path,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('Recorded source photo unavailable');return new Uint8Array(await response.arrayBuffer());
}){
  if(!/^[a-f0-9]{40}$/.test(manifest.base_sha)||!Number.isSafeInteger(manifest.version))throw new Error('Invalid batch manifest');
  const previous=JSON.parse(await readFile(resolve(root,'menu.json'),'utf8'));
  const config=JSON.parse(await readFile(resolve(root,'site.config.json'),'utf8'));
  const menu=structuredClone(manifest.menu),galleries=menu._draft_photos||{};
  const originalCodes=new Set(Object.entries(fields).flatMap(([k,[c]])=>previous[k].map(r=>String(r.image_code||r[c]))));
  let total=0;
  for(const [target,refs] of Object.entries(galleries)){
    const [key,code,...extra]=target.split(':'),definition=fields[key];
    if(extra.length||!definition||!safe.test(code)||!Array.isArray(refs)||refs.length>8||new Set(refs).size!==refs.length)throw new Error('Invalid gallery');
    const [codeKey,dir]=definition,row=menu[key].find(r=>String(r[codeKey])===code);if(!row)throw new Error('Gallery item missing');
    if(!refs.length)continue;
    const imageCode='OV-'+(key==='Menu_Items'?'item':key==='Combos'?'combo':'addon')+'-'+code;
    const images=[];
    // Read every source before writing; promotion must not overwrite its source.
    for(const ref of refs){
      let bytes;if(/^asset:[a-f0-9]{64}$/.test(ref)){bytes=Buffer.from(await fetchAsset(ref.slice(6)));}
      else if(/^public\/static\/images\/(product_images|combo_images|add_on_images)\/[A-Za-z0-9_-]+\.webp$/.test(ref))bytes=await readFile(resolve(root,ref));
      else if(/^source:[a-f0-9]{40}:public\/static\/images\/(product_images|combo_images|add_on_images)\/[A-Za-z0-9_-]+\.webp$/.test(ref)){const [,sha,...parts]=ref.split(':');bytes=Buffer.from(await fetchSource(sha,parts.join(':')));}
      else throw new Error('Unsafe photo reference');
      total+=bytes.length;if(bytes.length>512000||total>10485760)throw new Error('Photo budget exceeded');
      const isUpload=ref.startsWith('asset:');const meta=await sharp(bytes,{limitInputPixels:isUpload?240000:40000000,animated:false}).metadata();
      if(meta.format!=='webp'||!meta.width||!meta.height||(isUpload&&(meta.width!==600||meta.height!==400))||(meta.pages||1)!==1)throw new Error('Invalid photo format or dimensions');
      // Older published images include square add-ons and larger photos. Fit the
      // whole source into the new frame instead of rejecting or cropping it.
      images.push(await sharp(bytes).resize(600,400,{fit:'contain',background:'#111'}).webp({quality:86}).toBuffer());
    }
    const folder=resolve(root,'public/static/images',dir);await mkdir(folder,{recursive:true});
    for(let n=1;n<=8;n++)for(const format of ['webp','avif'])await unlink(resolve(folder,imageCode+(n===1?'':'-'+n)+'.'+format)).catch(e=>{if(e.code!=='ENOENT')throw e;});
    for(let i=0;i<images.length;i++){
      const stem=resolve(folder,imageCode+(i===0?'':'-'+(i+1)));
      // Re-encoding strips metadata; produce pairs for every existing gallery reader.
      await sharp(images[i]).webp({quality:86}).toFile(stem+'.webp');
      await sharp(images[i]).avif({quality:65,effort:4}).toFile(stem+'.avif');
    }
    row.image_code=imageCode;
  }
  delete menu._draft_photos;
  // Freeze each dish's ingredient recipe independently of editable names and
  // serving labels. Combos are rebuilt from their selected component quantities.
  const recipeFor=name=>/sandwich/i.test(name)?[{dish:'sandwich',units:1}]:/garlic bread/i.test(name)?[{dish:'garlic_bread',units:1}]:/pizza/i.test(name)?[{dish:'pizza',units:1}]:[];
  for(const [key,[codeKey]] of Object.entries(fields))if(key!=='Combos')for(const row of menu[key]){
    const old=previous[key].find(r=>String(r[codeKey])===String(row[codeKey]));
    row.stock_recipe=old?.stock_recipe??recipeFor(String(old?.item_name||old?.addon_name||row.item_name||row.addon_name)+' '+String(old?.category||row.category||''));
  }
  for(const row of menu.Combos){const totals=new Map();for(const code of row.items_included)for(const part of menu.Menu_Items.find(r=>String(r.product_code)===String(code)).stock_recipe){const qty=row.item_quantities?.[String(code)]||1;totals.set(part.dish,(totals.get(part.dish)||0)+part.units*qty);}row.stock_recipe=Array.from(totals,([dish,units])=>({dish,units}));}
  // Preserve late-night station policy through category/name edits.
  for(const row of menu.Menu_Items){
    const old=previous.Menu_Items.find(r=>String(r.product_code)===String(row.product_code));
    if(row.late_night_available===undefined)row.late_night_available=old?.late_night_available??(!config.delivery.late_night.unavailable_categories.includes(old?.category||row.category)&&!config.delivery.late_night.unavailable_items.includes(old?.item_name||row.item_name));
  }
  for(const row of menu.Combos){const old=previous.Combos.find(r=>String(r.combo_code)===String(row.combo_code));row.late_night_available=(old?.late_night_available??!config.delivery.late_night.unavailable_items.includes(old?.combo_name||row.combo_name))&&row.items_included.every(c=>menu.Menu_Items.find(r=>String(r.product_code)===String(c))?.late_night_available===true);}
  for(const row of menu.Add_ons){const old=previous.Add_ons.find(r=>String(r.addon_code)===String(row.addon_code));if(row.late_night_available===undefined)row.late_night_available=old?.late_night_available??!config.delivery.late_night.unavailable_items.includes(old?.addon_name||row.addon_name);}
  const usedCodes=new Set(Object.entries(fields).flatMap(([k,[c]])=>menu[k].map(r=>String(r.image_code||r[c]))));
  // A shared source is removed only after every row has stopped using it.
  for(const code of originalCodes)if(!usedCodes.has(code)&&safe.test(code))for(const [,dir] of Object.values(fields))for(let n=1;n<=8;n++)for(const ext of ['webp','avif'])await unlink(resolve(root,'public/static/images',dir,code+(n===1?'':'-'+n)+'.'+ext)).catch(e=>{if(e.code!=='ENOENT')throw e;});
  const hero=menu.Menu_Items.find(r=>String(r.product_code)===String(config.hero_dish_code));
  if(!hero||hero.status!=='available')throw new Error('Keep the configured hero dish listed.');
  if(Object.hasOwn(galleries,'Menu_Items:'+hero.product_code)){
    const path=resolve(root,'public/static/images/product_images',String(hero.image_code||hero.product_code)+'.webp');
    const og=resolve(root,'public/static/images/og/og-default.jpg');await mkdir(dirname(og),{recursive:true});
    await sharp(await readFile(path)).resize(1200,630,{fit:'cover',position:'centre'}).jpeg({quality:90}).toFile(og);
  }
  await writeFile(resolve(root,'menu.json'),JSON.stringify(menu,null,2)+'\n');
  return menu;
}
