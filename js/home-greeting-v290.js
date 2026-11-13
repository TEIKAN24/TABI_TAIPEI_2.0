/* TABI TAIPEI v2.0.90 — the 1.0 greeting (js/hero-intro.js) back on the 2.0 home, small, centred
   at the bottom, at most two lines (css/home-greeting-v290.css).
   hero-intro.js still picks and changes the greeting as before (time of day, special days,
   no repeats, double / triple tap replies); it lived in .hero-stage, which 2.0 hides, so the
   element is moved out to #top. Emoji are left out of what is shown (the user's choice), and
   the greeting stays hidden whenever it would come within 20px of the index (short screens,
   Safari's toolbars). */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var hero = doc.getElementById('top'), greet = doc.getElementById('hero-greeting');
  if (!hero || !greet) return;
  greet.classList.add('tt290-greeting');
  hero.appendChild(greet);

  var EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}︎️‍⃣]/gu;
  function clean() {
    var lines = greet.querySelectorAll('.hero-greeting-line'), i, t, n;
    for (i = 0; i < lines.length; i++) {
      t = lines[i].textContent;
      n = t.replace(EMOJI, '').replace(/\s+$/, '').replace(/^\s+/, '');
      if (n !== t) lines[i].textContent = n;
      if (!n) lines[i].remove();
    }
  }

  var queued = 0;
  function check() {
    queued = 0;
    if (!root.classList.contains('tt-route-home')) return;
    greet.classList.remove('tt290-off');
    var items = doc.querySelectorAll('.tt-home-item'), bottom = 0, i, r;
    for (i = 0; i < items.length; i++) {
      r = items[i].getBoundingClientRect();
      if (r.height) bottom = Math.max(bottom, r.bottom);
    }
    var g = greet.getBoundingClientRect();
    if (!g.height || g.top < bottom + 20) greet.classList.add('tt290-off');
  }
  function later() { if (!queued) queued = requestAnimationFrame(check); }

  clean();
  // hero-intro.js rewrites the lines whenever the greeting changes or answers a tap
  new MutationObserver(function () { clean(); later(); }).observe(greet, {childList: true, subtree: true, characterData: true});
  new MutationObserver(later).observe(root, {attributes: true, attributeFilter: ['class']});
  addEventListener('resize', later);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(later);
  later();
})();
