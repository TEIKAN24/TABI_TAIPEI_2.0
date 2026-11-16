/* TABI TAIPEI v2.0.123 — js/tt2-hints.js: first-time hints (css/tt2-hints.css).
   Tried out first in experiments/hints (the lab, not published).
   One hint per kind of control, shown the first time that control is on screen anywhere on the
   site (the wheel: on whichever page a wheel is first met), never again (localStorage). It appears
   0.6s after the control has been fully in view, at most one at a time, with a small motion on or
   over the control; a touch, a scroll or 4s takes it away (demos keep it until they end).
   No dimming. Reduced motion: text only.
   The 料理辞典 (opened from the menu) is a walk (runTour): steps with 「次へ」 between them, the rest dimmed, no skipping. */
(() => {
  'use strict';
  if (window.tt2Hints) return;
  const KEY = 'tt2-hint:';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const EASE = 'cubic-bezier(.22,1,.36,1)';
  const seen = id => { try { return localStorage.getItem(KEY + id) === '1'; } catch (_) { return false; } };
  const mark = id => { try { localStorage.setItem(KEY + id, '1'); } catch (_) {} };
  const view = () => document.documentElement.dataset.ttView || 'home';

  const headerBottom = () => (document.querySelector('.tt-sitebar')?.getBoundingClientRect().bottom || 0);
  // fully on screen (below the header unless it is in the header), not covered by anything
  const inView = (el, header) => {
    if (!el || !el.getClientRects().length) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom > innerHeight - 8 || r.top < (header ? 0 : headerBottom() + 4)) return false;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && (el === hit || el.contains(hit) || hit.contains(el) || !!hit.closest('.ec-scroller')); // calendar cards lie under its touch layer
  };
  const first = (sel, pick) => { const list = [...document.querySelectorAll(sel)].filter(e => inView(e)); return pick ? pick(list) : list[0]; };
  const sheetOpen = () => document.body.matches('.food-drawer-open, .tt2d-on');
  const busy = () => document.documentElement.matches('.tt-nav-open, .tt2-airsheet-open') || sheetOpen();

  // ---------- motions ----------
  const at = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  function ripple(el, size = 40, waves = 2) {          // rings spreading from the control's centre
    const [x, y] = at(el);
    for (let k = 0; k < waves * 2; k++) {
      const d = document.createElement('i');
      d.className = 'tt2-hint-ripple';
      Object.assign(d.style, {left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px'});
      document.body.append(d);
      d.animate([{transform: 'translate(-50%,-50%) scale(.35)', opacity: .75}, {transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0}],
        {duration: 1100, delay: Math.floor(k / 2) * 1300 + (k % 2) * 380, easing: 'ease-out', fill: 'both'}).finished.then(() => d.remove(), () => d.remove());
    }
  }
  function ringBox(el) {                               // a rounded outline spreading off a box (the 料理辞典 card)
    const r = el.getBoundingClientRect(), d = document.createElement('i');
    d.className = 'tt2-hint-ring';
    Object.assign(d.style, {left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
      borderRadius: getComputedStyle(el).borderRadius});
    document.body.append(d);
    d.animate([{transform: 'scale(1)', opacity: .9}, {transform: `scale(${1 + 16 / r.width}, ${1 + 16 / r.height})`, opacity: 0}],
      {duration: 900, easing: 'ease-out', fill: 'both'}).finished.then(() => d.remove(), () => d.remove());
  }
  function fingers(el) {                                // two fingertips over the map: pinch out, back, then a drag
    const [x, y] = at(el);
    const g = document.createElement('div'); g.className = 'tt2-hint-fingers';
    Object.assign(g.style, {left: x + 'px', top: y + 'px'});
    g.innerHTML = '<i></i><i></i>';
    document.body.append(g);
    const [a, b] = g.children, o = {duration: 2600, easing: 'ease-in-out', fill: 'both'};
    const path = s => [
      {translate: '0 0', opacity: 0, offset: 0}, {translate: '0 0', opacity: 1, offset: .08},
      {translate: s * 34 + 'px ' + s * -26 + 'px', offset: .35}, {translate: '0 0', offset: .55},
      {translate: '42px 0', offset: .85, opacity: 1}, {translate: '42px 0', opacity: 0, offset: 1}];
    a.animate(path(-1), o);
    b.animate(path(1), o).finished.then(() => g.remove(), () => g.remove());
  }
  let demo = false;
  // open, wait, close again — the page's scroll is put back afterwards
  function openClose(el, isOpen, hold = 1500) {
    const box = el.closest('.tt269-page') || document.querySelector('#guide');
    const scrolls = [box, document.scrollingElement].map(s => [s, s?.scrollTop || 0]);
    demo = true;
    if (!isOpen()) el.click();
    setTimeout(() => { if (isOpen()) el.click(); }, hold);
    setTimeout(() => { scrolls.forEach(([s, t]) => s && s.scrollTo({top: t, behavior: 'smooth'})); }, hold + 450);
    setTimeout(() => { demo = false; }, hold + 1100);
  }

  // the 料理辞典 walk plays only when the sheet was opened from the menu's 料理検索 (not from a 名物 chip …)
  let dictFromMenu = false;
  addEventListener('click', e => { if (e.target instanceof Element && e.target.closest('.tt-side-menu [data-tt-dict]')) dictFromMenu = true; }, true);
  new MutationObserver(() => { if (!document.body.classList.contains('tt2d-on')) dictFromMenu = false; })
    .observe(document.body, {attributes: true, attributeFilter: ['class']});

  const HINTS = [
    // v2.0.134: the menu hint (open and close once) is gone
    {id: 'home', text: 'ロゴをタップでホームへ', header: true,
      find: () => { const b = document.querySelector('.tt-sitebar .tt-brand'); return view() !== 'home' && inView(b, true) ? b : null; },
      motion: el => ripple(el.querySelector('.tt-brand-main') || el, 46)},
    {id: 'wheel', text: '左右にスワイプしてカテゴリーを切り替え', side: 'below', // above it would cover the chapter's tabs
      find: () => first('#guide .tt2-wheel'),
      motion: el => el.querySelector('.tt2-wheel-track')?.animate(
        [{transform: 'translateX(0)'}, {transform: 'translateX(-46px)', offset: .45}, {transform: 'translateX(0)'}],
        {duration: 1000, iterations: 2, easing: EASE, composite: 'add'})},
    {id: 'map', text: 'ドラッグで移動・2本の指で拡大縮小', wait: 1000,
      find: () => first('#guide .nm-stage[data-view="map"] .nm-map'),
      motion: el => fingers(el)},
    {id: 'pin', text: 'ピンをタップで詳細',
      find: () => first('#guide .nm-stage[data-view="map"] .nm-pin', list => {
        const m = document.querySelector('#guide .nm-map')?.getBoundingClientRect();
        if (!m) return list[0];
        const cx = m.left + m.width / 2, cy = m.top + m.height / 2;
        return list.sort((a, b) => { const p = at(a), q = at(b); return Math.hypot(p[0] - cx, p[1] - cy) - Math.hypot(q[0] - cx, q[1] - cy); })[0];
      }),
      motion: el => ripple(el, 44)},
    {id: 'specialty', text: 'タップで料理辞典を開く',
      find: () => first('#guide .nm-detail .nm-specialty'),
      motion: el => ripple(el, 40)},   // v2.0.130: the chip has no chevron to nudge any more
    {id: 'route', text: 'タップで路線図を表示', wait: 2200,
      find: () => first('#guide .tt269-way-head'),
      motion: el => openClose(el, () => el.getAttribute('aria-expanded') === 'true')},
    {id: 'note', text: 'タップで詳しく表示', wait: 2200,
      find: () => first('#guide .tt2-note-summary'),
      motion: el => openClose(el, () => !!el.parentElement?.open)},
    {id: 'calendar', text: 'タップでカレンダー表示・長押しで日付を選ぶ', wait: 2400,
      find: () => first('#guide #event-calendar .ec-card', list => {
        const s = document.querySelector('#event-calendar .ec-scroller')?.getBoundingClientRect();
        return s ? list.find(c => { const r = c.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - (s.left + s.width / 2)) < 20; }) : list[0];
      }),
      motion: el => {          // the card's own tap: to the calendar face, and back
        const s = document.querySelector('#event-calendar .ec-scroller');
        const tap = () => { const [x, y] = at(el); s?.dispatchEvent(new MouseEvent('click', {bubbles: true, clientX: x, clientY: y})); };
        tap(); setTimeout(tap, 1500);
      }},
    {id: 'conditions', text: '時間帯・並び順・料理の種類を指定',
      find: () => first('#guide .recommend-advanced-trigger'),
      motion: el => (el.querySelector('.recommend-advanced-plus') || el).animate(
        [{rotate: '0deg'}, {rotate: '90deg'}, {rotate: '0deg'}], {duration: 800, iterations: 1, easing: EASE})},
    {id: 'dictionary', sheet: true, tour: 'dictionary',      // a walk through the sheet (DICT_STEPS), only when opened from the menu
      find: () => { const s = document.querySelector('#food-search .search-shell'); return dictFromMenu && document.body.matches('.food-drawer-settled') && s?.getClientRects().length ? s : null; }},   // once the sheet has slid up
  ];

  // ---------- walks (料理辞典, the menu) ----------
  // ---------- 料理辞典: search, the card, its related dishes, several words, scanning a menu ----------
  // A walk the visitor watches to the end: the page around the part in focus darkens softly (a
  // wide oval, no hard edge) and takes no touches; 「次へ」 under the text, live once a step's
  // motion is done, moves on. The tip floats by the part in focus like the other hints.
  // Typed into the field without focusing it (no keyboard); the search is emptied after.
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const dq = s => document.querySelector('#food-search ' + s);
  const field = () => dq('#search');
  const typed = v => { const f = field(); f.value = v; f.dispatchEvent(new Event('input', {bubbles: true})); };
  async function typeIn(text, from = '') {
    for (const ch of [...text]) { from += ch; typed(from); await pause(170); }
  }
  const chip = () => [...document.querySelectorAll('#food-search .tt2d-chip')].find(c => c.textContent === '蟹粉小籠包') || dq('.tt2d-chip');
  const DICT_STEPS = [
    {text: '料理名を入力して検索（中国語・日本語どちらでも）', side: 'above', find: () => dq('.search-shell'),
      async run(el) { ripple(el.querySelector('.search-svg') || el, 36, 1); await pause(700); await typeIn('小籠包'); await pause(700); }},
    {text: 'いちばん近い料理の説明', side: 'below', find: () => dq('.tt2d-card'), spot: () => [dq('.tt2d-card')],
      async run() { await pause(500); }},
    {text: '同じ字を含む関連メニュー。タップで説明が切り替わります', side: 'below', still: true,
      find: () => dq('.tt2d-chips'), spot: () => [dq('.tt2d-section'), dq('.tt2d-chips')],   // the tip under all the chips
      async run() {
        const el = chip(); if (!el) return;
        ripple(el, 40, 1); await pause(1300);
        el.click(); target = dq('.tt2d-chips') || target;   // the chips are drawn anew
        await pause(120); const c = dq('.tt2d-card'); if (c) ringBox(c);   // the card it opened (蟹粉小籠包) rings once
        spots = () => [dq('.tt2d-card'), dq('.tt2d-chips')]; await pause(900);
      }},
    {text: 'スペースで区切ると、複数まとめて調べられます', side: 'above', find: () => dq('.search-shell'), spot: () => [dq('.search-shell'), dq('.tt2d-view')],
      async run() { await typeIn(' 豆花', field().value.trim()); await pause(900); }},
    {text: 'メニューの文字は、入力欄をタップ →「自動入力」→「テキストをスキャン」でカメラから入力できます', side: 'above', find: () => dq('.search-shell'),
      async run(el) { typed(''); ripple(el, 46, 2); await pause(1200); }},
  ];
  // ---------- running a walk ----------
  const TOURS = {
    dictionary: {steps: DICT_STEPS, end() { typed(''); const v = dq('.tt2d-view'); if (v) v.scrollTop = 0; }},
  };
  let tourOn = false, spots = null, nextGo = null, tourNow = null, stillAt = null;
  const dim = document.createElement('div'); dim.className = 'tt2-hint-dim'; dim.hidden = true;
  const block = document.createElement('div'); block.className = 'tt2-hint-block'; block.hidden = true;
  for (const t of ['touchmove', 'wheel']) block.addEventListener(t, e => e.preventDefault(), {passive: false});
  document.body.append(dim, block);

  async function runTour(h) {
    const tour = tourNow = TOURS[h.tour];
    tourOn = true; demo = true;
    tour.start?.();
    tip.classList.add('is-tour', 'has-step');
    dim.hidden = block.hidden = false;
    if (!reduce.matches) dim.animate([{opacity: 0}, {opacity: 1}], {duration: 300, easing: 'ease-out'});
    const next = tip.querySelector('.tt2-hint-next'), steps = tour.steps;
    for (const [k, step] of steps.entries()) {
      const el = step.find();
      if (!el) continue;
      showing = {...h, side: step.side, header: true, still: step.still}; target = el; stillAt = null; spots = step.spot || (() => [el]);
      tip.querySelector('.tt2-hint-text').textContent = step.text;
      tip.querySelector('.tt2-hint-step').textContent = (k + 1) + '/' + steps.length;
      next.textContent = k === steps.length - 1 ? 'はじめる' : '次へ';
      next.disabled = true;
      if (k && !reduce.matches) tip.animate([{opacity: .3}, {opacity: 1}], {duration: 240, easing: EASE});
      await pause(260);
      await step.run(target);
      next.disabled = false;
      await new Promise(r => { nextGo = r; });
    }
    endTour();
  }
  function endTour() {
    tourOn = false; demo = false; spots = null;
    tourNow?.end?.(); tourNow = null;
    block.hidden = true;
    const out = () => { dim.hidden = true; tip.classList.remove('is-tour', 'has-step'); tip.querySelector('.tt2-hint-step').textContent = ''; };
    if (reduce.matches) out(); else dim.animate([{opacity: 1}, {opacity: 0}], {duration: 220, easing: 'ease-out'}).finished.then(out, out);
    hide();
  }
  // the dim: clear over the parts in focus, darkening outward in a wide oval
  function dimAround() {
    const rs = (spots?.() || []).filter(e => e && e.getClientRects().length).map(e => e.getBoundingClientRect());
    if (!rs.length) { dim.style.background = 'rgba(0,0,0,.62)'; return; }
    const l = Math.min(...rs.map(r => r.left)), t = Math.max(0, Math.min(...rs.map(r => r.top)));
    const r = Math.max(...rs.map(r => r.right)), b = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)));
    const k = Math.SQRT2 * 1.3;                    // the oval holds the whole box inside its clear part
    const rx = (r - l) / 2 * k + 16, ry = (b - t) / 2 * k + 28;
    dim.style.background = `radial-gradient(${rx}px ${ry}px at ${(l + r) / 2}px ${(t + b) / 2}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 72%, rgba(0,0,0,.62) 100%)`;
  }


  // ---------- the tip ----------
  const tip = document.createElement('div');
  tip.className = 'tt2-hint'; tip.setAttribute('role', 'status'); tip.hidden = true;
  tip.innerHTML = '<span class="tt2-hint-step"></span><span class="tt2-hint-text"></span><button type="button" class="tt2-hint-next">次へ</button><i class="tt2-hint-caret" aria-hidden="true"></i>';
  document.body.append(tip);
  tip.addEventListener('click', e => { if (e.target.closest('.tt2-hint-next') && nextGo) { const r = nextGo; nextGo = null; r(); } });
  let showing = null, target = null, hideTimer = 0;
  function place() {
    if (!showing || !target) return;
    if (tourOn) dimAround();
    if (showing.still && stillAt) return;   // a step that changes the page under it: the tip stays where it first stood
    const r = target.getBoundingClientRect(), t = tip.getBoundingClientRect();
    const below = showing.side === 'below' || r.top - t.height - 12 < (showing.header ? 4 : headerBottom() + 8);
    const x = Math.max(12, Math.min(innerWidth - t.width - 12, r.left + r.width / 2 - t.width / 2));
    tip.style.left = x + 'px';
    tip.style.top = (below ? r.bottom + 10 : r.top - t.height - 10) + 'px';
    tip.classList.toggle('is-below', below);
    tip.style.setProperty('--caret', Math.max(14, Math.min(t.width - 14, r.left + r.width / 2 - x)) + 'px');
    if (showing.still) stillAt = true;
  }
  function follow() { if (!showing) return; place(); requestAnimationFrame(follow); }   // the control may move (demos)
  function show(h, el) {
    showing = h; target = el; mark(h.id);
    if (h.tour) {
      tip.hidden = false; tip.style.removeProperty('width'); follow();
      if (!reduce.matches) tip.animate([{opacity: 0, translate: '0 4px'}, {opacity: 1, translate: '0 0'}], {duration: 260, easing: EASE, fill: 'both'});
      clearTimeout(hideTimer); runTour(h); return;
    }
    tip.querySelector('.tt2-hint-text').textContent = h.text;
    tip.style.removeProperty('width');
    tip.hidden = false; place(); follow();
    if (!reduce.matches) {
      tip.animate([{opacity: 0, translate: '0 4px'}, {opacity: 1, translate: '0 0'}], {duration: 260, easing: EASE, fill: 'both'});
      setTimeout(() => { if (showing === h) h.motion?.(el); }, 300);
    }
    clearTimeout(hideTimer); hideTimer = setTimeout(hide, (h.wait || 0) + 4000);
  }
  function hide() {
    if (!showing || tourOn) return;     // the 料理辞典 walk ends only through its own button
    showing = null; target = null; clearTimeout(hideTimer);
    if (reduce.matches) { tip.hidden = true; return; }
    tip.animate([{opacity: 1}, {opacity: 0}], {duration: 180, easing: 'ease-out', fill: 'both'}).finished.then(() => { if (!showing) tip.hidden = true; });
  }
  addEventListener('pointerdown', () => hide(), true);
  addEventListener('scroll', () => { if (!demo) hide(); }, true);
  addEventListener('hashchange', () => hide());

  // ---------- watching: a control must stay in view 0.6s ----------
  const since = new Map();
  function tick() {
    if (showing || demo || document.hidden) { since.clear(); return; }
    const now = performance.now();
    for (const h of HINTS) {
      if (seen(h.id) || (busy() && !(h.sheet && sheetOpen() && !document.documentElement.matches('.tt-nav-open')))) continue;
      const el = h.find();
      if (!el) { since.delete(h.id); continue; }
      if (!since.has(h.id)) { since.set(h.id, now); continue; }
      if (now - since.get(h.id) >= 600) { since.clear(); show(h, el); return; }
    }
  }
  setInterval(tick, 200);

  window.tt2Hints = {HINTS, reset: id => { try { for (const h of HINTS) if (!id || h.id === id) localStorage.removeItem(KEY + h.id); } catch (_) {} },
    seen, hide};
})();
