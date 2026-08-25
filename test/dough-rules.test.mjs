// ── the two implementations under test, copied verbatim from the shipped code ──
const CAP_PCT = 0.1;
const MRP = new Set(['900000001','900000002']);
const bare = c => c.replace(/^(item|combo|addon)-/,'');

const usableDough = (bal, spendable, minimum, foodTotal) =>
  Math.max(0, Math.min(bal, Math.floor(spendable*CAP_PCT), Math.max(0, foodTotal-minimum)));

const spendableBase = (lines, offers) => Math.max(0, lines.reduce((s,l)=>{
  const c = bare(l.catalog_id);
  return (offers.has(c) || MRP.has(c)) ? s : s + l.unit_price*l.qty;
}, 0));

const earnableBase = lines => Math.max(0, lines.reduce((s,l)=>
  MRP.has(bare(l.catalog_id)) ? s : s + l.unit_price*l.qty, 0));

const spendCap = (base, bal) => Math.max(0, Math.min(Math.floor(base*CAP_PCT), Math.floor(Math.max(0,bal))));
const earnFor = paid => Math.floor(Math.max(0,paid)*0.05);

let pass=0, fail=0; const failures=[];
const t=(name,got,want)=>{
  const ok = got===want; ok?pass++:(fail++, failures.push(`${name}: got ${got}, want ${want}`));
  if(!ok) console.log(`  FAIL  ${name}  got ${got} want ${want}`);
};

console.log('=== 1. INVARIANTS: brute force 100k random baskets ===');
let neg=0, overBal=0, overCap=0, underMin=0, nonInt=0;
for(let i=0;i<100000;i++){
  const bal = Math.floor(Math.random()*500);
  const spendable = Math.floor(Math.random()*2000);
  const foodTotal = spendable + Math.floor(Math.random()*2000);
  const minimum = Math.floor(Math.random()*400);
  const u = usableDough(bal, spendable, minimum, foodTotal);
  if(u<0) neg++;
  if(u>bal) overBal++;
  if(u>Math.floor(spendable*CAP_PCT)) overCap++;
  if(foodTotal-u < minimum && u>0) underMin++;
  if(!Number.isInteger(u)) nonInt++;
}
t('never negative', neg, 0);
t('never exceeds balance', overBal, 0);
t('never exceeds 10% of spendable', overCap, 0);
t('never drags order under its minimum', underMin, 0);
t('always an integer rupee', nonInt, 0);

console.log('\n=== 2. THE OWNER-REPORTED BUG ===');
t("3x Crunchy@139 (offer) + Paneer Tikka 169, Rs7 bal, Rs299 min", usableDough(7,169,299,586), 7);
t("...and the broken version returned", Math.max(0,Math.min(7,16,Math.max(0,169-299))), 0);

console.log('\n=== 3. BOUNDARIES ===');
t('balance 0', usableDough(0,1000,0,1000), 0);
t('spendable 0 (all offers)', usableDough(50,0,0,1000), 0);
t('foodTotal exactly at minimum -> 0 headroom', usableDough(50,500,299,299), 0);
t('foodTotal 1 above minimum', usableDough(50,500,299,300), 1);
t('spendable 9 -> floor to 0', usableDough(50,9,0,500), 0);
t('spendable 10 -> exactly 1', usableDough(50,10,0,500), 1);
t('spendable 19 -> floors to 1', usableDough(50,19,0,500), 1);
t('minimum 0', usableDough(7,169,0,586), 7);
t('balance exactly equals cap', usableDough(16,169,0,586), 16);
t('balance 1 over cap', usableDough(17,169,0,586), 16);

console.log('\n=== 4. spendableBase / earnableBase ===');
const OFF = new Set(['745802364','745802381']);
const basket = [
  {catalog_id:'item-745802381', qty:3, unit_price:139},   // ON OFFER
  {catalog_id:'item-752623131', qty:1, unit_price:169},   // full price
  {catalog_id:'item-900000001', qty:2, unit_price:20},    // drink
  {catalog_id:'addon-747584740', qty:1, unit_price:59},   // add-on, full price
];
t('spendable excludes offers + drinks', spendableBase(basket,OFF), 169+59);
t('earnable excludes drinks only', earnableBase(basket), 417+169+59);
t('empty basket spendable', spendableBase([],OFF), 0);
t('empty basket earnable', earnableBase([]), 0);
t('combo prefix stripped', spendableBase([{catalog_id:'combo-745802348',qty:1,unit_price:239}], new Set(['745802348'])), 0);
t('combo not on offer counts', spendableBase([{catalog_id:'combo-745802348',qty:1,unit_price:239}], new Set()), 239);
t('no offers live -> everything but drinks', spendableBase(basket,new Set()), 417+169+59);
t('qty multiplies', spendableBase([{catalog_id:'item-X',qty:7,unit_price:11}], new Set()), 77);

console.log('\n=== 5. WORKER spendCap (server side) ===');
t('worker: owner case', spendCap(169, 7), 7);
t('worker: balance beats cap', spendCap(169, 5), 5);
t('worker: cap beats balance', spendCap(169, 100), 16);
t('worker: zero base', spendCap(0, 100), 0);
t('worker: negative balance guarded', spendCap(500, -50), 0);
t('worker: fractional balance floored', spendCap(500, 7.9), 7);

console.log('\n=== 6. EARN ===');
t('earn 5% floored', earnFor(198), 9);
t('earn on 0', earnFor(0), 0);
t('earn never negative', earnFor(-100), 0);
t('earn 19 -> 0', earnFor(19), 0);
t('earn 20 -> 1', earnFor(20), 1);

console.log('\n=== 7. FRONTEND vs WORKER AGREE (the disagreement that shipped) ===');
let mismatch=0;
for(let i=0;i<20000;i++){
  const bal=Math.floor(Math.random()*200);
  const spendable=Math.floor(Math.random()*1500);
  const foodTotal=spendable+Math.floor(Math.random()*1500);
  const front=usableDough(bal,spendable,0,foodTotal);   // minimum 0 = pickup/no gate
  const worker=spendCap(spendable,Math.min(front,bal));
  if(worker!==front) mismatch++;
}
t('frontend number is always honoured by the worker', mismatch, 0);

console.log(`\n${pass} passed, ${fail} failed`);
if(fail) { console.log('\nFAILURES:'); failures.forEach(f=>console.log('  '+f)); }
process.exit(fail?1:0);
