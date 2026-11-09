/* TABI TAIPEI v2.0.6 — Figma 4-1-1 museum-list presentation adapter.
 * The original directory JSON, link hrefs, tags and filtering/list code remain
 * authoritative. Only the DOM presentation of the first museum category is
 * extended with the Japanese/Chinese typographic hierarchy from Figma.
 */
(() => {
  'use strict';
  const section = document.querySelector('[data-tt2-panel-key="places"]');
  if (!section || !window.tabiDirectoryReady) return;
  const displayNames = new Map([
    ['國立故宮博物院','国立故宮博物院'],
    ['北投溫泉博物館','北投温泉博物館'],
    ['國家鐵道博物館','国家鉄道博物館'],
    ['國立臺灣博物館','国立台湾博物館']
  ]);
  const order = ['國立故宮博物院','北投溫泉博物館','國家鐵道博物館','國立臺灣博物館'];
  function enhanceMuseum() {
    const museum = section.querySelector('.tab-panel .venue-directory-list');
    if (!museum || museum.dataset.tt2Museums === '1') return;
    const entries = [...museum.querySelectorAll(':scope > li.venue-list-item')];
    if (!entries.length) return;
    entries.forEach((row) => {
      const a = row.querySelector('a.venue-main-link');
      if (!a) return;
      const original = a.textContent.trim();
      row.classList.add('tt2-museum-row');
      row.dataset.tt2OriginalName = original;
      if (!displayNames.has(original)) return;
      a.textContent = '';
      const ja = document.createElement('span');
      ja.className = 'tt2-museum-ja'; ja.lang = 'ja'; ja.textContent = displayNames.get(original);
      const zh = document.createElement('span');
      zh.className = 'tt2-museum-zh'; zh.lang = 'zh-Hant'; zh.textContent = original;
      a.append(ja, zh);
      a.title = original;
      const red = row.querySelector('.venue-tag--tone-red');
      if (red && original === '北投溫泉博物館') {
        // Figma text is the shorter visual label; retain the full original
        // status from the JSON in the tooltip/accessible text.
        red.title = red.textContent.trim();
        const concise = document.createElement('span');
        concise.className = 'tt2-museum-status-short';
        concise.textContent = '2027年10月まで休館';
        const full = document.createElement('span');
        full.className = 'tt2-museum-status-source';
        full.textContent = red.textContent.trim();
        red.replaceChildren(concise, full);
      }
    });
    const keyed = entries.map((row,i) => ({row,i,priority:order.indexOf(row.dataset.tt2OriginalName)}));
    keyed.sort((a,b) => (a.priority < 0 ? 99+a.i : a.priority) - (b.priority < 0 ? 99+b.i : b.priority));
    museum.replaceChildren(...keyed.map(x => x.row));
    museum.dataset.tt2Museums = '1';
    const tab = section.querySelector('.tab');
    const panels = tab?.querySelector('.tab-panels');
    if (tab && panels && !tab.querySelector('.tt2-sight-count')) {
      const count = document.createElement('div');
      count.className = 'tt2-sight-count';
      count.setAttribute('aria-live','polite');
      panels.prepend(count);
      const refresh = () => {
        const selected = tab.querySelector('.tab-pill[aria-selected="true"]');
        const panel = selected && document.getElementById(selected.getAttribute('aria-controls'));
        const all = panel?.querySelectorAll('.venue-list-item').length || 0;
        const closed = panel?.querySelectorAll('.venue-tag--tone-red').length || 0;
        count.textContent = `掲載 ${all}件　 /　 休館中 ${closed}件`;
      };
      tab.querySelector('.tab-pills')?.addEventListener('click',() => requestAnimationFrame(refresh));
      refresh();
    }
  }
  Promise.resolve(window.tabiDirectoryReady).then(enhanceMuseum);
})();
