/**
 * At most one ask on screen at a time.
 *
 * There are two things this site ever asks a customer for — notification
 * permission (PushSubscribe.astro) and an app install (PwaInstall.astro).
 * Both are centred dialogs since 2026-08-28, so this is no longer the layout
 * question it started as: showing both at once asks for two different things
 * in the same breath, which is how a site starts feeling like it wants
 * something from you.
 *
 * Both dialogs check this before opening, so whichever gets there first wins
 * and the other simply does not appear. The loser is not lost — each has its
 * own 30-day key and will come back around.
 */
export function anotherBannerVisible(): boolean {
  return document.querySelector('.push-ask-overlay:not([hidden])') !== null;
}

/**
 * Close the install dialog so the notification dialog can take the screen.
 *
 * Only the push ask calls this, and only because the two asks are not equal:
 * a notification permission is one-shot and permanent for the whole origin,
 * while an install can be offered again any time. When they race, the
 * irreversible one wins.
 */
export function hideOtherBanners(): void {
  const install = document.getElementById('pwaInstallOverlay');
  if (install) install.hidden = true;
  document.body.style.removeProperty('overflow');
}
