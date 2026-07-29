/* Phase 3.5 — cursor-tracking card glow (G1 "Living cards").
   Sets --mx/--my on hovered cards for polish.css's radial gradient.
   Mouse/trackpad only (pointer:fine); off with reduced-motion; rAF-throttled. */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SELECTOR = '.menu-card, .feature-card, .blog-card';
  var pending = false;
  var lastEvent = null;

  function apply() {
    pending = false;
    var card = lastEvent.target.closest && lastEvent.target.closest(SELECTOR);
    if (!card) return;
    var rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (lastEvent.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (lastEvent.clientY - rect.top) + 'px');
  }

  document.addEventListener(
    'pointermove',
    function (e) {
      lastEvent = e;
      if (!pending) {
        pending = true;
        requestAnimationFrame(apply);
      }
    },
    { passive: true }
  );
})();
