import assert from 'node:assert/strict';
import { addItem, setAddonQty, replaceCart, getCart, onCartChange } from '../src/lib/cart.ts';

const storage = new Map();
globalThis.window = {
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  addEventListener() {}, removeEventListener() {},
};
addItem('combo-old', 2);
setAddonQty('combo-old', 'addon-cheese', 1);
addItem('item-new', 3);
let updates = 0;
const unsubscribe = onCartChange(() => updates++);
replaceCart([{ id: 'item-new', qty: 1, addons: {} }]);
assert.deepEqual(getCart(), [{ id: 'item-new', qty: 1, addons: {} }]);
assert.equal(updates, 1, 'handoff publishes one complete basket update');
replaceCart([{ id: 'combo-old', qty: 1, addons: {} }]);
assert.deepEqual(getCart(), [{ id: 'combo-old', qty: 1, addons: {} }], 'old attached extras are not resurrected');
unsubscribe();
console.log('calculator cart handoff regression passed');
