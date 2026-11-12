/* TABI TAIPEI v2.0.59 — 空港アクセス, Figma 「空港アクセス 新案 A1 / A2」 (css/figma-airport-v255.css).
 * guide.js rebuilds the timeline for every route; after each build this adds what the markup lacks:
 *   - 台北MRT station codes as a square two-line badge (BR / 13); 空港MRT codes stay as they are
 *   - a mark on every ride, on the line: BR / BL in the line colour, the 空港MRT logo on white,
 *     or the bus / taxi icon on grey
 *   - the transfer row: 「乗換」 on the line, a rule across, and 「{next line}に乗り換え」
 * Nothing is computed here; everything comes from the timeline guide.js wrote. */
(() => {
  'use strict';
  const timeline = document.getElementById('airsel-timeline');
  if (!timeline) return;
  const el = (tag, cls, text) => { const n = document.createElement(tag); n.className = cls; if (text) n.textContent = text; return n; };
  const AIRPORT = /A978D5|478ED1/i, BUS = /AEB4BC/i, TAXI = /D9B65F/i;

  function codes() {
    for (const c of timeline.querySelectorAll('.stop-body .code:not([data-tt2a])')) {
      c.dataset.tt2a = '1';
      const m = c.textContent.trim().match(/^(BR|BL)(\d+)$/);
      if (!m) continue;                       // 空港MRT (A12, A1…) keeps the horizontal badge
      c.classList.add('tt2a-code-sq');
      c.replaceChildren(el('span', 'tt2a-code-l', m[1]), el('span', 'tt2a-code-n', m[2]));
    }
  }
  function marks() {
    for (const leg of timeline.querySelectorAll(':scope > .timeline-leg')) {
      const content = leg.querySelector('.leg-content');
      if (!content || content.querySelector(':scope > .tt2a-mark')) continue;
      const line = leg.querySelector('.line-name')?.textContent.trim() || '';
      const style = leg.getAttribute('style') || '';
      let mark;
      if (line === '文湖線') mark = el('span', 'tt2a-mark tt2a-mark--br', 'BR');
      else if (line === '板南線') mark = el('span', 'tt2a-mark tt2a-mark--bl', 'BL');
      else if (AIRPORT.test(style)) mark = el('span', 'tt2a-mark tt2a-mark--ty');
      else {
        mark = el('span', 'tt2a-mark tt2a-mark--ground');
        const icon = document.querySelector('#airsel-company-fallback svg');   // the bus / taxi icon of this tab
        if (icon && (BUS.test(style) || TAXI.test(style))) mark.append(icon.cloneNode(true));
      }
      mark.setAttribute('aria-hidden', 'true');
      content.prepend(mark);
    }
  }
  function transfers() {
    for (const stop of timeline.querySelectorAll(':scope > .timeline-stop.transfer')) {
      const body = stop.querySelector('.stop-body');
      if (!body || body.querySelector('.tt2a-xfer-text')) continue;
      const next = stop.nextElementSibling?.querySelector('.line-name')?.textContent.trim();
      body.append(el('span', 'tt2a-xfer-rule'), el('span', 'tt2a-xfer-text', next ? `${next}に乗り換え` : '乗り換え'), el('span', 'tt2a-xfer-end'));
    }
  }
  // v2.0.60: each ride's order, for the line that grows from the top (css: --tt2a-leg-i)
  const order = () => timeline.querySelectorAll(':scope > .timeline-leg').forEach((leg, i) => leg.style.setProperty('--tt2a-leg-i', i));
  const run = () => { codes(); marks(); transfers(); order(); };
  new MutationObserver(run).observe(timeline, {childList: true});
  run();

  // v2.0.63 — temporary diagnostics: tap the 「空港アクセス」 heading 5 times to show what this phone
  // really measures (viewport units, safe area, the box sizes and the CSS version it loaded).
  // Tap the panel to close it. Remove once the home-screen layout is confirmed.
  const heading = document.querySelector('#airport-route-selector .section-top h2');
  let taps = [], panel = null;
  const probe = css => { const p = document.createElement('div'); p.style.cssText = 'position:fixed;left:0;top:0;width:1px;visibility:hidden;pointer-events:none;' + css; document.body.append(p); const r = p.getBoundingClientRect(); p.remove(); return r; };
  const r1 = n => Math.round(n * 10) / 10;
  function report() {
    const q = s => document.querySelector('#airport-route-selector ' + s);
    const box = n => n ? `${r1(n.getBoundingClientRect().top)}→${r1(n.getBoundingClientRect().bottom)} (h${r1(n.getBoundingClientRect().height)})` : '-';
    const ver = h => (document.querySelector(`link[href*="${h}"],script[src*="${h}"]`)?.getAttribute('href') || document.querySelector(`script[src*="${h}"]`)?.getAttribute('src') || '-').split('?')[1] || '-';
    const sa = probe('height:0;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);');
    return [
      `css airport ${ver('figma-airport-v255.css')} · js ${ver('figma-airport-v259.js')}`,
      `sw ${navigator.serviceWorker?.controller ? 'on' : 'off'} · standalone ${navigator.standalone === true} / ${matchMedia('(display-mode: standalone)').matches}`,
      `innerH ${innerHeight} · screenH ${screen.height} · vvH ${r1(visualViewport?.height || 0)} · docClientH ${document.documentElement.clientHeight}`,
      `100vh ${r1(probe('height:100vh').height)} · svh ${r1(probe('height:100svh').height)} · dvh ${r1(probe('height:100dvh').height)} · lvh ${r1(probe('height:100lvh').height)}`,
      `safe top+bottom ${r1(sa.height)} · fixed bottom:0 at ${r1(probe('top:auto;bottom:0;height:1px').bottom)}`,
      `mq max-height:740 ${matchMedia('(max-height: 740px)').matches}`,
      `body ${box(document.body)}`,
      `#guide ${box(document.getElementById('guide'))}`,
      `section ${box(document.getElementById('airport-route-selector'))}`,
      `timeline ${box(timeline)} css-h ${getComputedStyle(timeline).height}`,
      `facts ${box(q('#airsel-facts'))} · foot ${box(q('#airsel-footnote'))}`,
    ].join('\n');
  }
  heading?.addEventListener('click', () => {
    const now = Date.now(); taps = taps.filter(t => now - t < 2000); taps.push(now);
    if (taps.length < 5) return;
    taps = [];
    if (panel) { panel.remove(); panel = null; return; }
    panel = document.createElement('pre');
    panel.style.cssText = 'position:fixed;left:8px;right:8px;top:110px;z-index:2147483647;margin:0;padding:10px;white-space:pre-wrap;word-break:break-all;' +
      'font:11px/1.45 ui-monospace,Menlo,monospace;color:#9fe39f;background:rgba(0,0,0,.92);border:1px solid #3a3a3a;border-radius:6px;-webkit-user-select:text;user-select:text;';
    panel.textContent = report();
    panel.addEventListener('click', () => { panel.remove(); panel = null; });
    document.body.append(panel);
  });
})();
