import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { computeQuote, slabForDistance } from '../src/lib/pricing.ts';

const cfg = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url), 'utf8')).delivery;
const distances = [0, 1, 1.999, 2, 2.001, 3, 3.999, 4, 4.001, 5, 5.999, 6, 6.001];
const expected = [39, 39, 39, 39, 79, 79, 79, 79, 119, 119, 119, 119, null];
const baskets = [99, 100, 129, 199, 248, 249, 250, 398, 399, 400, 498, 499, 500, 618, 898, 899, 900, 1298, 1299, 1300];
const freeThreshold = (km) => km <= 2 ? 499 : km <= 4 ? 899 : 1299;
const quote = (subtotal, km, time = '19:00', dayOfWeek = 1, rain = false, prepaid = false) =>
  computeQuote(cfg, { subtotal, km, time, dayOfWeek, orderType: 'delivery', rain, prepaid, regular: false });
const amount = (result, label) => result.lines.find((line) => line.label.startsWith(label))?.amount;

for (const [i, km] of distances.entries()) {
  assert.equal(slabForDistance(cfg, km)?.charge ?? null, expected[i], `${km} km slab`);
  for (const food of baskets) {
    for (const [time, day] of [['19:00', 1], ['13:00', 1], ['13:00', 6], ['23:29', 1]]) {
      const result = quote(food, km, time, day);
      if (expected[i] === null) {
        assert.equal(result.kind, 'beyond', `${km} km out of range`);
        continue;
      }
      assert.equal(result.kind, 'ok', `₹${food} at ${km} km ${time}`);
      const delivery = food >= freeThreshold(km) ? 0 : expected[i];
      assert.equal(amount(result, 'Delivery'), delivery, `delivery ₹${food} at ${km} km`);
      assert.equal(result.total, food + delivery, `total ₹${food} at ${km} km ${time}`);
    }
  }
}

for (const [km, fee] of [[1, 39], [3, 79], [5, 119]]) {
  for (const food of baskets) {
    const night = quote(food, km, '23:30');
    assert.equal(night.kind, 'ok');
    assert.equal(amount(night, 'Delivery'), fee);
    assert.equal(amount(night, 'Late-night kitchen reopen surge (prepaid)'), 50);
    assert.equal(night.total, food + fee + 50);
    assert.equal(night.latenightPrepaid, true);
    assert.equal(night.lines.filter((line) => line.label.includes('Late-night')).length, 1);
    const wet = quote(food, km, '01:59', 2, true);
    assert.equal(wet.total, food + fee + 50 + 29);
    assert.equal(amount(wet, 'Rain surcharge'), 29);
    const normalWet = quote(food, km, '19:00', 2, true);
    assert.equal(normalWet.total, food + (food >= freeThreshold(km) ? 0 : fee) + 29);
    assert.equal(quote(food, km, '19:00', 2, true, true).total, normalWet.total);
    assert.equal(quote(food, km, '01:59', 2, true, true).total, wet.total);
  }
}

for (const [km, threshold, fee] of [[1, 499, 39], [3, 899, 79], [5, 1299, 119]]) {
  assert.equal(quote(threshold - 1, km).freeDeliveryNudge.needed, 1);
  assert.equal(quote(threshold, km).freeDeliveryNudge, undefined);
  assert.equal(quote(threshold + 1, km).total, threshold + 1);
  assert.equal(quote(threshold, km, '23:30').total, threshold + fee + 50);
}

assert.equal(quote(199, 1, '02:00').kind, 'ok');
assert.equal(quote(199, 1, '02:01').isLateNight, false);
assert.equal(quote(499, 1, '19:00').total, 499);
assert.equal(quote(499, 1, '23:30').total, 588);
assert.equal(quote(618, 1, '23:30').total, 707);
assert.equal(quote(618, 1, '23:30').lines[1].label, 'Delivery (0–2 km)');
for (const time of ['19:00', '23:30']) {
  const active = computeQuote({ ...cfg, rain: { ...cfg.rain, active: true } }, {
    subtotal: 129, km: 5, time, dayOfWeek: 1, orderType: 'delivery', rain: false, prepaid: true, regular: false,
  });
  assert.equal(amount(active, 'Rain surcharge'), 29, 'active mode cannot be removed by a customer tick');
}
console.log('delivery pricing matrix passed');
