/** Only one soft-banner (install prompt, push soft-ask) on screen at once — they share the same fixed bottom-center slot. */
export function anotherBannerVisible(): boolean {
  return document.querySelector('.soft-banner:not([hidden])') !== null;
}
