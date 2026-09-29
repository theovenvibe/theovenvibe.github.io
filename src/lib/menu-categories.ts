/** Empty draft categories never create empty customer sections. */
export const categoryAnchor=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function groupMenuCategories<T extends {category:string;status:string}>(items:T[],order?:string[]):{name:string;items:T[]}[]{
  const map=new Map<string,T[]>();
  for(const item of items)if(item.status==='available'){if(!map.has(item.category))map.set(item.category,[]);map.get(item.category)!.push(item);}
  const names=[...new Set([...(order||[]),...map.keys()])];
  return names.filter(name=>map.has(name)).map(name=>({name,items:map.get(name)!}));
}
