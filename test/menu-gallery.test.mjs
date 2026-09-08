/**
 * Menu photo gallery — the contract for items that have more than one photo.
 *
 * Two halves:
 *  1. On disk: every extra photo (`<code>-2`, `-3`, …) is a complete
 *     avif+webp pair whose code is a real catalogue code. A half-converted
 *     photo is the failure this catches — the webp lands, the avif doesn't,
 *     and only AVIF browsers see a broken card.
 *  2. In the built HTML: an item with two photos renders a two-slide
 *     gallery, and an item with one photo renders exactly what it always
 *     did (no track, no dots) — the no-regression half.
 *
 * Run: npm run test:gallery   (needs `npm run build` first for part 2)
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const IMG_DIR = 'public/static/images/product_images';
const menu = JSON.parse(readFileSync('menu.json', 'utf8'));
const codes = new Set([
  ...menu.Menu_Items.map((i) => String(i.image_code ?? i.product_code)),
  ...menu.Combos.map((c) => String(c.image_code)),
  ...menu.Add_ons.map((a) => String(a.image_code)),
]);

let pass = 0,
  fail = 0;
const t = (name, ok, detail = '') => {
  ok ? pass++ : (fail++, console.log(`  FAIL  ${name}${detail ? '  ' + detail : ''}`));
};

console.log('=== 1. extra photos on disk are complete pairs ===');
const extras = readdirSync(IMG_DIR).filter((f) => /-\d+\.(webp|avif)$/.test(f));
const extraCodes = new Set(extras.map((f) => f.replace(/-\d+\.(webp|avif)$/, '')));
t('some extra photos exist', extras.length > 0, `found ${extras.length}`);
for (const f of extras) {
  const base = f.replace(/\.(webp|avif)$/, '');
  t(`${base} has both avif and webp`, existsSync(join(IMG_DIR, `${base}.webp`)) && existsSync(join(IMG_DIR, `${base}.avif`)));
}
for (const code of extraCodes) {
  t(`${code} is a real catalogue code`, codes.has(code));
  t(`${code} has a photo 1`, existsSync(join(IMG_DIR, `${code}.webp`)));
}

console.log('=== 2. built HTML renders the gallery ===');
const INDEX = 'dist/index.html';
if (!existsSync(INDEX)) {
  console.log('  SKIP  dist/index.html missing — run `npm run build` first');
} else {
  const html = readFileSync(INDEX, 'utf8');
  const cards = html.split('<article').slice(1);
  const cardFor = (code) => cards.find((c) => c.includes(`/${code}.webp`));

  // Any code that has a second photo on disk — which items those are changes
  // as the owner swaps photos in, so the test finds one rather than naming it.
  const galleryCode = [...extraCodes].find((c) => cardFor(c));
  t('a card with two photos exists in the build', !!galleryCode, `codes with extras: ${[...extraCodes].join(', ')}`);
  const withGallery = galleryCode && cardFor(galleryCode);
  if (withGallery) {
    t('renders a gallery track', withGallery.includes('menu-card-gallery'));
    t('renders the second photo', withGallery.includes(`/${galleryCode}-2.webp`));
    t('renders two slides', (withGallery.match(/menu-card-slide/g) || []).length === 2);
    // `menu-card-dots` (the container) also contains the string, so match the
    // dot class only where the class attribute ends or continues with a space.
    const dotRe = /menu-card-dot[ "]/g;
    t('renders two dots', (withGallery.match(dotRe) || []).length === 2);
  }

  // Ultimate Cheese Delight Pizza has one photo — must look exactly as before.
  const single = cardFor('745802358');
  t('single-photo card exists in the build', !!single);
  if (single) {
    t('single-photo card has no gallery track', !single.includes('menu-card-gallery'));
    t('single-photo card has no dots', !/menu-card-dot[ "]/.test(single));
    t('single-photo card still has its image', single.includes('menu-card-img'));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
