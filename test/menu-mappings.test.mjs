import assert from 'node:assert/strict';
import {groupMenuCategories,categoryAnchor} from '../src/lib/menu-categories.ts';
assert.equal(categoryAnchor('Signature Pizza'),'signature-pizza');assert.equal(categoryAnchor('Signature-Pizza'),categoryAnchor('Signature Pizza'));assert.equal(categoryAnchor('Sides & Snacks'),'sides-snacks');
const grouped=groupMenuCategories([{category:'Classic',status:'available',code:'one'},{category:'Signature',status:'available',code:'two'},{category:'Private',status:'unavailable',code:'three'}],['Empty','Signature','Classic','Private']);
assert.deepEqual(grouped.map(r=>r.name),['Signature','Classic'],'Explicit order respected; empty and unlisted-only sections stay hidden');assert.equal(grouped[0].items[0].code,'two');assert.deepEqual(groupMenuCategories([{category:'Legacy',status:'available'}]).map(r=>r.name),['Legacy'],'Legacy menus keep item-derived categories');
import {allowedAddonCodes} from '../src/lib/menu-mappings.ts';
import {menuSchema} from '../src/schemas/menu.ts';
import {readFileSync} from 'node:fs';
const base=JSON.parse(readFileSync(new URL('../menu.json',import.meta.url),'utf8'));
assert.equal(menuSchema.safeParse(base).success,true);
const categoryMenu=structuredClone(base);categoryMenu.Menu_Categories=[...new Set(base.Menu_Items.map(r=>r.category)),'Private empty category'];categoryMenu.Addon_Mappings={categories:{'Private empty category':[]}};assert.equal(menuSchema.safeParse(categoryMenu).success,true);
for(const name of ['Signature-Pizza','Menu','Sec combos','!!!']){const m=structuredClone(categoryMenu);m.Menu_Categories.push(name);assert.equal(menuSchema.safeParse(m).success,false,'Reject category anchor collisions and empty/reserved anchors');}
const edited=structuredClone(base);
edited.legacy={keep:true};edited.Menu_Items[0].legacy='retained';
edited.Menu_Items[0].tags=['Spicy'];edited.Menu_Items[0].serving={amount:2,unit:'slices'};
edited.Addon_Mappings={items:{[String(base.Menu_Items[0].product_code)]:[]}};
const parsed=menuSchema.parse(edited);
assert.deepEqual(parsed.legacy,{keep:true});assert.equal(parsed.Menu_Items[0].legacy,'retained');
assert.deepEqual(parsed.Menu_Items[0].serving,{amount:2,unit:'slices'});
for(const mutate of [m=>m.Menu_Items[0].price=1.5,m=>m.Menu_Items.push(structuredClone(m.Menu_Items[0])),m=>m.Addon_Mappings={items:{missing:[]}},m=>m.Combos[0].items_included=['missing'],m=>m.Menu_Items[0].veg=false]) {
 const m=structuredClone(base);mutate(m);assert.equal(menuSchema.safeParse(m).success,false);
}
const all=['a','b'];
assert.deepEqual(allowedAddonCodes('p','Pizza',all),all);
const mappings={categories:{Pizza:['a']},items:{p:[]}};
assert.deepEqual(allowedAddonCodes('p','Pizza',all,mappings),[]);
assert.deepEqual(allowedAddonCodes('q','Pizza',all,mappings),['a']);
assert.deepEqual(allowedAddonCodes('q','Burger',all,mappings),all);
assert.deepEqual(allowedAddonCodes('constructor','Burger',all,mappings),all);
console.log('Menu mapping precedence, empty override, legacy fallback and own-property checks pass.');
