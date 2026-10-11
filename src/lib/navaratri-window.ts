/** 21 October 2026, 06:00 Asia/Kolkata. */
export const NAVARATRI_END_UTC = '2026-10-21T00:30:00Z';
export const NAVARATRI_CODES = new Set([
  'NAV2026001', 'NAV2026002', 'NAV2026003', 'NAV2026004',
  'NAV2026005', 'NAV2026006', 'NAV2026007',
]);

export function navaratriExpired(now = Date.now()): boolean {
  return now >= Date.parse(NAVARATRI_END_UTC);
}

export function isNavaratriCatalogId(id: string): boolean {
  return NAVARATRI_CODES.has(id.replace(/^item-/, ''));
}
