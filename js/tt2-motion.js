/* TABI TAIPEI v2.0.109 — js/tt2-motion.js: motion inside a chapter.
   1. Switching inside a chapter (the chapter tabs, the category wheel, sub tabs): what appears
      comes in from top to bottom — each row / card fades in and rises 6px, 0.48s, 70ms apart (v2.0.109, was 0.28s / 45ms),
      at most 10. The site's own easing (cubic-bezier(.22,1,.36,1)), nothing that slows a tap.
      How: a capture listener notes what is on screen before the switch; two frames later the
      blocks that are new (rows, cards, notes; else the new box itself) are animated.
   2. 味わい: the three restaurants slide in from the left one after another, top to bottom
      (28px, 0.56s, 0.15s apart; v2.0.109, was a drop from the top), as if the list had just
      been run — when the result changes, on 味わい's tabs and on entering the chapter. A refresh
      of the same three (open-now text) does not replay.
   `translate` and `filter: opacity()` are animated (not `transform` / `opacity`): elements that are
   already transformed keep it, and a card whose opacity is pinned !important still fades.
   Nothing moves under prefers-reduced-motion. */
(() => {
  'use strict';
  const guide = document.getElementById('guide');
  if (!guide || !Element.prototype.animate) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const EASE = 'cubic-bezier(.22,1,.36,1)';
  const SWITCH = '[role="tab"], .ct-tab, .tt2-chapter-tab, .tab-pill, .tt2-wheel, [data-tt-travel-tab]';
  const SKIP = '.ct-tabs, .tt2-chapter-tabs, .tt-travel-tabs, .tt2-wheel, .tab-pills, [role="tablist"], .nm-map, #recommend-results, #food-search, .tt-chapter-heading';
  const ROWS = 'li, article, .tt2-note';

  const shown = e => e.getClientRects().length > 0;
  const onScreen = e => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && (r.width || r.height); };
  function visibleSet() {
    const set = new Set();
    for (const e of guide.querySelectorAll('*')) if (shown(e)) set.add(e);
    return set;
  }

  /* ---------- 1. switches ---------- */
  let before = null, frame = 0, food = false;
  addEventListener('click', e => {
    if (reduce.matches || !(e.target instanceof Element)) return;
    const control = e.target.closest(SWITCH);
    if (!control || !guide.contains(control)) return;
    before = visibleSet();
    food = !!control.closest('[data-tt2-food-tab]');
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(play); });
  }, true);

  function play() {
    const was = before; before = null;
    if (!was) return;
    const fresh = new Set();
    for (const e of guide.querySelectorAll('*')) if (!was.has(e) && shown(e) && !e.closest(SKIP)) fresh.add(e);
    if (!fresh.size) { if (food) dropCards(true); return; }
    const tops = [...fresh].filter(e => { for (let p = e.parentElement; p && p !== guide; p = p.parentElement) if (fresh.has(p)) return false; return true; });
    let units = [];
    for (const t of tops) {
      if (t.matches(ROWS)) { units.push(t); continue; }
      const rows = [...t.querySelectorAll(ROWS)].filter(r => shown(r) && !r.parentElement.closest(ROWS));
      if (rows.length >= 2) units.push(...rows); else units.push(t);
    }
    // the results of 味わい came back into view: their own drop-in
    // 味わい's own tabs (現在地 / 駅から探す): the three that show drop in again
    if (food || [...fresh].some(e => e.contains?.(results))) dropCards(true);
    units = units.filter(onScreen).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).slice(0, 10);
    units.forEach((u, i) => u.animate(
      [{filter: 'opacity(0)', translate: '0 6px'}, {filter: 'opacity(1)', translate: '0 0'}],
      {duration: 480, delay: i * 70, easing: EASE, fill: 'backwards'}));
  }

  /* ---------- 2. 味わい: three restaurants, from the left, top to bottom ---------- */
  const results = document.getElementById('recommend-results');
  let lastSig = '', forceUntil = 0;
  function dropCards(force) {
    if (!results || reduce.matches) return;
    // recommend.js may build the three again right after a switch: the new ones drop in too
    if (force) forceUntil = performance.now() + 600; else if (performance.now() < forceUntil) force = true;
    const cards = [...results.querySelectorAll(':scope > .recommend-card')].filter(shown);
    if (!cards.length) return;
    const sig = cards.map(c => c.querySelector('.recommend-venue')?.textContent.trim() || '').join('|');
    if (!force && sig === lastSig) return;
    lastSig = sig;
    cards.forEach((c, i) => c.animate(
      [{filter: 'opacity(0)', translate: '-28px 0'}, {filter: 'opacity(1)', translate: '0 0'}],
      {duration: 560, delay: 80 + i * 150, easing: EASE, fill: 'backwards'}));
  }
  if (results) {
    let queued = 0;
    new MutationObserver(() => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(() => { if (shown(results)) dropCards(false); });
    }).observe(results, {childList: true});
  }
  // into the 味わい chapter: the first look at the three also drops in
  document.addEventListener('tt:viewchange', () => {
    if (document.documentElement.dataset.ttView === 'food') requestAnimationFrame(() => requestAnimationFrame(() => dropCards(true)));
  });
})();
