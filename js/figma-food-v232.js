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
    if (isStation()) {
      // Line first (with search); once a line is chosen the station list follows.
      lineTrigger?.click();
    } else currentLocation?.click();
  });
  timeBtn.addEventListener('click', event => { event.stopPropagation(); timeButton?.click(); });
  // After a line is picked without a station, open the station list straight away.
  lineMenu?.addEventListener('click', event => {
    if (!event.target.closest('.recommend-native-option-line')) return;
    setTimeout(() => {
      if (isStation() && !$('recommend-station-code')?.classList.contains('is-empty')) return;
      if (isStation() && !stationTrigger?.disabled) stationTrigger.click();
    }, 0);
  });

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
      placeCode.hidden = !picked;
      if (picked) {
        placeCode.innerHTML = code.innerHTML;
        placeCode.style.borderColor = code.style.borderColor;
        const line = $('recommend-line-code')?.textContent.trim() || '';
        placeCode.dataset.line = line;
      }
      // Figma 2-2: 「府中駅」 (the station data holds 府中).
      placeName.textContent = picked ? (/[駅站]$/.test(name) ? name : name + '駅') : '駅を選ぶ';
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

  /* ---------- v2.0.40: station search shows the best match's number while typing ---------- */
  // The magnifier turns into the first result's station badge (line colour + number) and
  // follows every keystroke. recommend.js renders the results in its own input listener,
  // which was added before this one, so the first result is ready when this runs.
  const searchWrap = lineMenu?.querySelector('.recommend-station-search');
  const searchInput = searchWrap?.querySelector('input');
  if (searchWrap && searchInput) {
    const live = el('span', 'tt2-search-code');
    live.hidden = true;
    live.setAttribute('aria-hidden', 'true');
    searchWrap.insertBefore(live, searchInput);
    const updateLive = () => {
      const first = searchInput.value.trim() ? lineMenu.querySelector('.recommend-station-result .recommend-native-option-code') : null;
      live.hidden = !first;
      searchWrap.classList.toggle('has-match', !!first);
      if (!first) return;
      live.className = first.className + ' tt2-search-code';
      live.innerHTML = first.innerHTML;
      live.style.cssText = first.style.cssText;
      // line letters on top (BL / 06), as on the station row's badge
      const row = first.closest('.recommend-station-result');
      live.dataset.line = row?.dataset.line || (row?.dataset.value || '').replace(/[^A-Z]/g, '');
    };
    searchInput.addEventListener('input', updateLive);
    // Choosing a station clears the field without an input event.
    lineMenu.addEventListener('click', () => setTimeout(updateLive, 0));
  }

  document.addEventListener('tt:viewchange', event => { if (event.detail?.view === 'food') sync(); setNotes(false); });
  sync();
})();
