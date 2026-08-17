/**
 * The Oven Vibe — shared interactive behaviour, ported from v1's script.js.
 * Loaded on every page from Layout.astro.
 *
 * What's deliberately DIFFERENT from v1 (Phase 3, invisible-only per PRD §8):
 * - Menu/combo/add-on cards and their accordions are already in the DOM at
 *   parse time (rendered build-time from menu.json) instead of being
 *   fetch()'d and injected after DOMContentLoaded. That removes the empty
 *   "#menu"/"#addonsSection" flash v1 had while the fetch was in flight, and
 *   removes the need for the setTimeout()-based "pending accordion open"
 *   workaround v1 used to cope with that race — the target elements now
 *   always exist by the time a click handler runs.
 * - The generic accordion open/close toggle (independent per item) is wired
 *   directly here instead of being attached ad hoc inside each of v1's
 *   `createAccordionItem()` / `renderAddons()` builder functions.
 * Everything else (scroll-reveal, mobile menu overlay, in-page nav-link
 * scrolling + accordion-opening behaviour) matches v1 exactly, including the
 * quirk where only `.nav-links a` (the desktop nav) gets the special
 * hash-anchor handling — footer links and mobile-nav-links just do a plain
 * browser scroll-to-anchor, same as in v1.
 */
document.addEventListener('DOMContentLoaded', function () {
  // ===============================
  // Scroll Animations (IntersectionObserver)
  // ===============================
  var observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
    observer.observe(el);
  });

  // ===============================
  // Mobile Menu Logic (Overlay)
  // ===============================
  var mobileMenuToggle = document.getElementById('mobileMenuToggle');
  var mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  var closeMenuBtn = document.getElementById('closeMenuBtn');
  var mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  /*
   * The overlay takes a history entry while it is open.
   *
   * Without it the hardware back button skips straight past the menu and leaves
   * the page — and in the installed app, leaves the app. The same bug was found
   * and fixed in the Kitchen Console on 2026-08-18; this is its twin on the
   * customer side, and it is the reason a full-screen overlay on a phone must
   * never be pure CSS state.
   *
   * `menuHasEntry` tracks whether the entry is ours to consume, so closing by
   * tapping X pops it, while closing by a back press does not pop twice.
   */
  var menuHasEntry = false;

  function openMenu() {
    if (!mobileMenuOverlay) return;
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (!menuHasEntry) {
      history.pushState({ ovMenu: true }, '');
      menuHasEntry = true;
    }
  }

  function closeMenu(opts) {
    if (!mobileMenuOverlay) return;
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
    var fromBack = opts && opts.fromBack;
    if (menuHasEntry && !fromBack) {
      menuHasEntry = false;
      history.back();
    } else if (fromBack) {
      menuHasEntry = false;
    }
  }

  window.addEventListener('popstate', function () {
    if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
      closeMenu({ fromBack: true });
    }
  });

  if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', function () { closeMenu(); });
  mobileNavLinks.forEach(function (link) {
    // A nav link navigates away, so the overlay's entry must go with it —
    // otherwise the new page starts with a stale entry and back does nothing
    // on the first press.
    link.addEventListener('click', function () {
      if (menuHasEntry) { menuHasEntry = false; history.back(); }
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ===============================
  // Desktop nav-link in-page anchor handling (+ accordion pre-open)
  // ===============================
  var pendingAccordionOpens = { combos: false, addons: false };

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        var target = document.querySelector(href);

        if (href === '#menu') {
          var waBanner = document.querySelector('.hero-cta');
          target = waBanner || document.querySelector('#menu');
        }

        if (href === '#sec-combos') {
          var comboSection = document.querySelector('#sec-combos');
          if (comboSection) {
            target = comboSection;
            pendingAccordionOpens.combos = true;
            var comboHeader = comboSection.querySelector('.accordion-header');
            if (comboHeader && !comboSection.classList.contains('active')) comboHeader.click();
          } else {
            pendingAccordionOpens.combos = true;
          }
        }

        if (href === '#addonsSection') {
          var addonsSection = document.querySelector('#addonsSection');
          if (addonsSection) {
            target = addonsSection;
            pendingAccordionOpens.addons = true;
            var addonAccordion = addonsSection.querySelector('.accordion-item');
            if (addonAccordion) {
              var addonHeader = addonAccordion.querySelector('.accordion-header');
              if (addonHeader && !addonAccordion.classList.contains('active')) addonHeader.click();
            }
          } else {
            pendingAccordionOpens.addons = true;
          }
        }

        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    });
  });

  // ===============================
  // Accordion toggle (menu categories, combos, add-ons) — independent
  // open/close per item, same as v1's createAccordionItem()/renderAddons().
  // ===============================
  document.querySelectorAll('#menu .accordion-item, #addonsSection .accordion-item').forEach(function (item) {
    var header = item.querySelector('.accordion-header');
    var content = item.querySelector('.accordion-content');
    if (!header || !content) return;
    header.addEventListener('click', function () {
      var isActive = item.classList.contains('active');
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        item.classList.remove('active');
        content.style.maxHeight = null;
      }
    });
  });

  // ===============================
  // Lead events for Umami (Phase 5) — no-op when analytics is off, since
  // Layout.astro only loads the Umami script when site.config.json's
  // analytics.umami_website_id is non-empty. `window.umami` is then simply
  // undefined and every call below is skipped.
  // ===============================
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.umami) window.umami.track('call_click');
    });
  });
  document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.umami) window.umami.track('wa_click');
    });
  });
});
