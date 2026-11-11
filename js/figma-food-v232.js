/* TABI TAIPEI v2.0.32 — 02 味わい, Figma 2-1 (現在地) / 2-2 (駅から探す) / 2-3 (一覧).
 * Presentation layer only. js/recommend.js still owns the data, the ranking, GPS, stations,
 * time bands, conditions and the 一覧 list; every control here clicks the original one.
 *  - three tabs replace the front/back flip (no 3D turn)
 *  - one row shows the place (district or station) and the time band; tapping a side opens
 *    the original picker (GPS refresh, line → station menus, time options)
 *  - 注意事項: the original disclaimer and status messages, written out in place
 *  - 一覧 uses the shared infinite category wheel (js/infinite-category-wheel.js)
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const section = document.getElementById('food-recommend-section');
  const drawer = document.getElementById('taipei-recommender');
  if (!section || !drawer) return;
  const $ = id => document.getElementById(id);
  const picker = $('recommend-main-picker');
  const areaButton = $('recommend-area-trigger');
  const currentLocation = $('recommend-current-location');
  const lineTrigger = $('recommend-line-trigger');
  const stationTrigger = $('recommend-station-trigger');
  const lineMenu = $('recommend-line-menu');
  const timeButton = $('recommend-time-trigger');
  const disclaimer = $('recommend-disclaimer');
  const statusLine = $('recommend-location-status');
  const relaxed = $('recommend-relaxed');
  const isStation = () => picker?.classList.contains('is-station');
  const face = () => (window.tabiFoodFace ? window.tabiFoodFace() : 'front');
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

  /* ---------- tabs ---------- */
  const bar = el('nav', 'tt2-chapter-tabs tt2-food-tabs');
  bar.setAttribute('aria-label', '味わいの探し方');
  const TABS = [['current', '現在地'], ['station', '駅から探す'], ['list', '一覧']];
  const tabButtons = TABS.map(([key, label]) => {
    const b = el('button', 'tt2-chapter-tab', label);
    b.type = 'button'; b.dataset.tt2FoodTab = key;
    b.addEventListener('click', () => choose(key));
    bar.append(b);
    return b;
  });
  section.before(bar);

  // Keep the screen fixed: the original flip may scroll its panel into view.
  const keepPlace = fn => {
    const guide = $('guide'), body = section.parentElement;
    const g = guide?.scrollTop || 0, p = body?.scrollTop || 0;
    fn();
    if (guide) guide.scrollTop = g;
    if (body) body.scrollTop = p;
  };
  function choose(key) {
    if (key === 'list') {
      if (face() !== 'back') keepPlace(() => window.tabiFoodTurnTo?.('back'));
    } else {
      if (face() !== 'front') keepPlace(() => window.tabiFoodTurnTo?.('front'));
      // The original button toggles 現在地 ⇄ 駅から検索 (and refreshes GPS on return).
      if ((key === 'station') !== isStation()) areaButton?.click();
    }
    section.classList.remove('tt2-food-fade');
    void section.offsetWidth;
    section.classList.add('tt2-food-fade');
    sync();
  }

  /* ---------- place / time row ---------- */
  const where = el('div', 'tt2-food-where');
  const placeBtn = el('button', 'tt2-food-where-place');
  placeBtn.type = 'button';
  const placeLabel = el('span', 'tt2-food-where-label');
  const placeValue = el('span', 'tt2-food-where-value');
  const placeCode = el('span', 'tt2-food-where-code');
  const placeName = el('span', 'tt2-food-where-name');
  const placeHint = el('span', 'tt2-food-where-hint');
  placeValue.append(placeCode, placeName, placeHint);
  placeBtn.append(placeLabel, placeValue);
  const timeBtn = el('button', 'tt2-food-where-time');
  timeBtn.type = 'button';
  const timeLabel = el('span', 'tt2-food-where-label', '時間帯');
  const timeValue = el('span', 'tt2-food-where-value');
  timeBtn.append(timeLabel, timeValue);
  where.append(placeBtn, timeBtn);
  drawer.querySelector('.recommend-controls')?.before(where);

placeBtn.addEventListener('click', event => {
  event.stopPropagation();
  if (isStation()) stationPicker.toggle();
  else currentLocation?.click();
});
timeBtn.addEventListener('click', event => { event.stopPropagation(); stationPicker.close(); timeButton?.click(); });

/* ---------- v2.0.43: 駅検索 A — one panel under the row (Figma 定案) ----------
   search field · a row of line chips · the chosen line's stations in two columns. Typing
   shows recommend.js's own search results instead. Every tap clicks the original (hidden)
   line / station option, so recommend.js still owns the choice; the panel only reads. */
const stationMenu = $('recommend-station-menu');
const stationPicker = (() => {
  const panel = el('div', 'tt2-station-picker');
  panel.id = 'tt2-station-picker';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', '駅を選ぶ');
  const lineTitle = el('p', 'tt2-sp-title', '路線');
  const chips = el('div', 'tt2-sp-chips');
  const lineName = el('p', 'tt2-sp-line');
  const stationTitle = el('p', 'tt2-sp-title', '駅');
  const grid = el('div', 'tt2-sp-grid');
  const searchWrap = lineMenu?.querySelector('.recommend-station-search');
  const results = lineMenu?.querySelector('.recommend-native-list');
  if (searchWrap) panel.append(searchWrap);
  panel.append(lineTitle, chips, lineName, stationTitle, grid);
  if (results) { results.classList.add('tt2-sp-results'); panel.append(results); }
  where.after(panel);
  let line = '';
  let lines = [];
  const input = searchWrap?.querySelector('input');
  const searching = () => !!input?.value.trim();
  function readLines() {
    const found = [...(results?.querySelectorAll('.recommend-native-option-line') || [])].map(b => {
      const badge = b.querySelector('.recommend-native-option-code');
      return {id: b.dataset.value, color: badge?.style.backgroundColor || '#4288c9',
        name: b.querySelector('strong')?.textContent || '', en: b.querySelector('small')?.textContent || ''};
    });
    if (found.length) lines = found;
  }
  function lineButton(id) {
    if (searching()) { input.value = ''; input.dispatchEvent(new Event('input', {bubbles: true})); }
    return results?.querySelector(`.recommend-native-option-line[data-value="${id}"]`);
  }
  function paint() {
    readLines();
    const query = searching();
    panel.classList.toggle('is-searching', query);
    line = line || $('recommend-line-code')?.textContent.trim() || lines[0]?.id || '';
    chips.replaceChildren(...lines.map(l => {
      const b = el('button', 'tt2-sp-chip', l.id);
      b.type = 'button';
      b.style.backgroundColor = l.color;
      b.setAttribute('aria-label', l.name);
      b.setAttribute('aria-pressed', String(l.id === line));
      b.addEventListener('click', () => {
        const original = lineButton(l.id);
        line = l.id;
        original?.click();          // recommend.js: state.line, station options, closes its menus
        paint();
      });
      return b;
    }));
    const current = lines.find(l => l.id === line);
    const options = [...(stationMenu?.querySelectorAll('.recommend-native-option-station') || [])];
    lineName.replaceChildren(el('b', '', current?.name || ''), document.createTextNode(current ? `  ${current.en}  ·  ${options.length}駅` : ''));
    grid.replaceChildren(...options.map(o => {
      const cell = el('button', 'tt2-sp-cell');
      cell.type = 'button';
      cell.setAttribute('aria-pressed', String(o.getAttribute('aria-selected') === 'true'));
      const badge = o.querySelector('.recommend-native-option-code')?.cloneNode(true);
      if (badge) { badge.className = 'tt2-sp-badge'; badge.dataset.line = line; cell.append(badge); }
      cell.append(el('span', 'tt2-sp-name', o.querySelector('strong')?.textContent || ''));
      cell.addEventListener('click', () => { o.click(); close(); });
      return cell;
    }));
    if (!options.length) grid.append(el('p', 'tt2-sp-hint', '路線を選ぶと駅が表示されます'));
  }
  function open() {
    readLines();
    if (!lines.length) return;           // stations not loaded yet
    line = $('recommend-line-code')?.textContent.trim() || line;
    if (line && !stationMenu?.querySelector('.recommend-native-option-station')) lineButton(line)?.click();
    paint();
    panel.hidden = false;
    placeBtn.setAttribute('aria-expanded', 'true');
    later();
  }
  function close() {
    if (panel.hidden) return;
    panel.hidden = true;
    placeBtn.setAttribute('aria-expanded', 'false');
    if (input?.value) { input.value = ''; input.dispatchEvent(new Event('input', {bubbles: true})); }
    later();
  }
  input?.addEventListener('input', () => { if (!panel.hidden) panel.classList.toggle('is-searching', searching()); });
  // A search result (click or Enter) chooses a station: recommend.js handles it, then close.
  results?.addEventListener('click', event => { if (event.target.closest('.recommend-station-result')) setTimeout(close, 0); });
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') setTimeout(() => { if (!searching()) close(); }, 0);
    if (event.key === 'Escape') { event.stopPropagation(); close(); placeBtn.focus({preventScroll: true}); }
  }, true);
  panel.addEventListener('click', event => event.stopPropagation());
  document.addEventListener('click', event => { if (!panel.hidden && !panel.contains(event.target) && !placeBtn.contains(event.target)) close(); });
  document.addEventListener('tt:viewchange', close);
  return {open, close, toggle: () => (panel.hidden ? open() : close()), isOpen: () => !panel.hidden, panel};
})();

  /* ---------- 注意事項 ---------- */
  // v2.0.33: written out in place (no button): the original disclaimer, plus the GPS /
  // relaxed-condition messages when there are any. Updated whenever they change.
  const notesWrap = el('div', 'tt2-food-notes');
  notesWrap.setAttribute('role', 'note');
  notesWrap.setAttribute('aria-live', 'polite');
  disclaimer?.after(notesWrap);
  const setNotes = () => {};
  function fillNotes() {
    const lines = [disclaimer?.textContent, statusLine && !statusLine.hidden ? statusLine.textContent : '', relaxed && !relaxed.hidden ? relaxed.textContent : '']
      .map(t => String(t || '').trim()).filter(Boolean);
    const next = lines.join('\n');
    if (notesWrap.dataset.text === next) return;
    notesWrap.dataset.text = next;
    notesWrap.replaceChildren(...lines.map(t => el('p', '', t)));
  }

  /* ---------- mirror the original state ---------- */
  function sync() {
    const station = isStation(), list = face() === 'back';
    const key = list ? 'list' : station ? 'station' : 'current';
    tabButtons.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tt2FoodTab === key)));
    section.dataset.tt2FoodMode = key;
    if (station) {
      placeLabel.textContent = '駅周辺';
      const name = $('recommend-station-label')?.textContent.trim() || '';
      const code = $('recommend-station-code');
      const picked = code && !code.classList.contains('is-empty');
      const preview = searchPreview();
      placeCode.hidden = !picked && !preview;
      placeValue.classList.toggle('is-preview', !!preview);
      if (preview) {
        placeCode.innerHTML = preview.code.innerHTML;
        placeCode.style.borderColor = preview.code.style.borderColor;
        placeCode.dataset.line = preview.line;
      } else if (picked) {
        placeCode.innerHTML = code.innerHTML;
        placeCode.style.borderColor = code.style.borderColor;
        const line = $('recommend-line-code')?.textContent.trim() || '';
        placeCode.dataset.line = line;
      }
      // Figma 2-2: 「府中駅」 (the station data holds 府中).
      const shown = preview ? preview.name : picked ? name : '';
      placeName.textContent = shown ? (/[駅站]$/.test(shown) ? shown : shown + '駅') : '駅を選ぶ';
      placeHint.textContent = '';
      placeBtn.setAttribute('aria-label', picked ? `駅周辺：${name}（タップして駅を変更）` : '駅を選ぶ');
    } else {
      placeLabel.textContent = '現在地';
      placeCode.hidden = true;
      const name = $('recommend-district-name')?.textContent.trim() || '現在地';
      const hint = $('recommend-district-en')?.textContent.trim() || '';
      const located = /[市区]/.test(name) && !/エリア外/.test(name);
      placeName.textContent = name === '現在地' ? '現在地を取得' : name;
      // Status messages (denied, outside the area…) are listed under 注意事項 instead.
      placeHint.textContent = '';
      placeBtn.title = hint;
      placeBtn.setAttribute('aria-label', located ? `現在地：${name}（タップして再取得）` : '現在地を取得');
    }
    const band = $('recommend-time-label');
    timeValue.textContent = band?.textContent.trim() || '';
    timeValue.classList.toggle('is-breathing', !!band?.classList.contains('is-breathing'));
    timeBtn.setAttribute('aria-label', `時間帯：${timeValue.textContent}（タップして変更）`);
    fillNotes();
  }
  let queued = false;
  const later = () => { if (queued) return; queued = true; queueMicrotask(() => { queued = false; sync(); }); };
  const watch = node => node && new MutationObserver(later)
    .observe(node, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'hidden', 'style']});
  // Not #food-flip's subtree: it contains this row, and sync() writes to it.
  [picker, disclaimer, statusLine, relaxed].forEach(watch);
  $('food-flip') && new MutationObserver(sync).observe($('food-flip'), {attributes: true, attributeFilter: ['data-face']});

  /* ---------- 一覧: 掲載 N店, category wheel ---------- */
  const panel = $('food-directory-panel');
  const relabel = () => {
    const count = panel?.querySelector('.food-directory-summary-count');
    const n = count?.textContent.match(/\d+/)?.[0];
    if (count && n && count.dataset.tt2 !== n) { count.dataset.tt2 = n; count.textContent = `掲載 ${n}店`; }
  };
  panel && new MutationObserver(relabel).observe(panel, {childList: true});
  relabel();
  const mountWheel = () => {
    if ($('food-directory-tabs')?.querySelector('.food-directory-tab')) window.tt2WheelMount?.('food');
  };
  const tabsNode = $('food-directory-tabs');
  if (tabsNode) {
    const once = new MutationObserver(() => { if (tabsNode.querySelector('.food-directory-tab')) { once.disconnect(); mountWheel(); } });
    once.observe(tabsNode, {childList: true});
    mountWheel();
  }

  /* ---------- v2.0.43: pager instead of 「ほかの3軒を見る」 ---------- */
  // 「17軒中 1–3軒目」 on the left, the original button (same click: next three, wrapping
  // to the start) as the white 「次の3軒 ›」 capsule on the right. recommend.js writes the
  // total and the page onto the button as data-total / data-page.
  const moreBtn = $('recommend-more');
  if (moreBtn) {
    const pager = el('div', 'tt2-food-pager');
    const pos = el('span', 'tt2-food-pager-pos');
    pos.setAttribute('aria-live', 'polite');
    moreBtn.before(pager);
    pager.append(pos, moreBtn);
    const label = el('span', 'tt2-food-pager-label', '次の3軒');
    moreBtn.append(label);
    const paint = () => {
      const total = +moreBtn.dataset.total || 0, page = +moreBtn.dataset.page || 0;
      pager.hidden = !total;
      if (!total) return;
      const a = page * 3 + 1, b = Math.min(total, page * 3 + 3);
      pos.replaceChildren(document.createTextNode(`${total}軒中  `), el('b', '', a === b ? `${a}軒目` : `${a}–${b}軒目`));
      const last = b >= total;
      label.textContent = last ? '最初から' : '次の3軒';
      moreBtn.setAttribute('aria-label', last ? '最初の3軒に戻る' : 'ほかの3軒を見る');
    };
    new MutationObserver(paint).observe(moreBtn, {attributes: true, attributeFilter: ['data-total', 'data-page', 'hidden']});
    paint();
  }

  /* ---------- v2.0.41: the station row previews the best search match ---------- */
  // While a station is being searched, the row above shows the first result live: its
  // badge (line colour, line letters, number) and its name. recommend.js re-renders the
  // results inside the picker, which the observer above already turns into a sync().
  // Closing the menu without choosing (the field is cleared or hidden) restores the row.
  const searchInput = stationPicker.panel.querySelector('.recommend-station-search-input');
  function searchPreview() {
    if (!searchInput || !stationPicker.isOpen() || !searchInput.value.trim()) return null;
    const row = stationPicker.panel.querySelector('.recommend-station-result');
    const code = row?.querySelector('.recommend-native-option-code');
    if (!row || !code) return null;
    return {code, line: row.dataset.line || (row.dataset.value || '').replace(/[^A-Z]/g, ''),
      name: row.querySelector('.recommend-native-option-copy strong')?.textContent.trim() || ''};
  }
  searchInput?.addEventListener('input', later);
  // Closing the menu by tapping elsewhere only hides it; restore the row then too.
  lineMenu && new MutationObserver(later).observe(lineMenu, {attributes: true, attributeFilter: ['hidden']});

  document.addEventListener('tt:viewchange', event => { if (event.detail?.view === 'food') sync(); setNotes(false); });
  sync();
})();
