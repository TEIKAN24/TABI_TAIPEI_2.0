/* TABI TAIPEI 2.0.16 / 06 遠出: all four places share the Jiufen route hierarchy.
 * Original HTML routes remain authoritative, including fares, stations, stops,
 * warning notes, detail links and alternative routes. This module only presents.
 */
(() => {
  'use strict';
  const section = document.querySelector('#guide .sights-day-trips');
  const jiufenStage = section?.querySelector('.tt2-trip-stage');
  const destButtons = [...section?.querySelectorAll('.daytrip-destination-buttons > button') || []];
  const sources = [1,2,3].map(i => document.getElementById('daytrip-destination-panel-' + (i + 1)));
  if (!section || !jiufenStage || destButtons.length !== 4 || sources.some(n => !n)) return;
  const shifenTabs = [...sources[0].querySelectorAll(':scope > .destination-body > .tab > .daytrip-transport > .daytrip-transport-tab')];
  const shifenPages = [...sources[0].querySelectorAll(':scope > .destination-body > .tab > .tab-panels > .tab-panel')];
  const yehliuChoices = [...sources[2].querySelectorAll('.daytrip-bus-route-choice')];
  const yehliuRoutes = [...sources[2].querySelectorAll('.daytrip-bus-route')];
  if (shifenTabs.length !== 2 || shifenPages.length !== 2 || yehliuChoices.length !== 2 || yehliuRoutes.length !== 2) return;

  const stage = document.createElement('section');
  stage.className = 'tt2-trip-stage tt2-trip-stage--extended';
  stage.hidden = true;
  stage.setAttribute('aria-label','遠出の交通経路');
  stage.innerHTML = `<div class="tt2-trip-body">
    <p class="tt2-trip-summary"></p>
    <p class="tt2-trip-warning"></p>
    <div class="tt2-route-track" role="group" aria-label="交通経路"></div>
    <div class="tt2-route-choices" role="group" aria-label="路線選択"></div>
    <button type="button" class="tt2-trip-detail-trigger" hidden aria-expanded="false" aria-controls="tt2-trip-detail-pane">詳細を見る <span aria-hidden="true">＋</span></button>
    <div class="tt2-trip-detail-pane" id="tt2-trip-detail-pane" hidden>
      <div class="tt2-trip-detail-heading"><span>交通・見どころ</span><button type="button" class="tt2-trip-detail-close" aria-label="詳細を閉じる">×</button></div>
      <div class="tt2-trip-detail-content"></div>
    </div>
  </div>`;
  jiufenStage.after(stage);
  const summary = stage.querySelector('.tt2-trip-summary');
  const warning = stage.querySelector('.tt2-trip-warning');
  const track = stage.querySelector('.tt2-route-track');
  const choices = stage.querySelector('.tt2-route-choices');
  const detailTrigger = stage.querySelector('.tt2-trip-detail-trigger');
  const detailPane = stage.querySelector('.tt2-trip-detail-pane');
  const detailContent = stage.querySelector('.tt2-trip-detail-content');
  const detailClose = stage.querySelector('.tt2-trip-detail-close');
  let destination = -1;
  let renderSerial = 0;
  const text = node => (node?.textContent || '').replace(/\s+/g,' ').trim();
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const visible = node => !!node && !node.hidden && node.getAttribute('aria-hidden') !== 'true';
  const currentIndex = buttons => Math.max(0,buttons.findIndex(button => button.getAttribute('aria-selected') === 'true' || button.getAttribute('aria-pressed') === 'true'));
  const closeDetails = () => {
    detailPane.hidden = true;
    detailTrigger.setAttribute('aria-expanded','false');
    detailTrigger.querySelector('span').textContent = '＋';
  };
  detailTrigger.addEventListener('click',() => {
    const next = detailPane.hidden;
    detailPane.hidden = !next;
    detailTrigger.setAttribute('aria-expanded',String(next));
    detailTrigger.querySelector('span').textContent = next ? '−' : '＋';
  });
  detailClose.addEventListener('click',() => {closeDetails();detailTrigger.focus();});
  stage.addEventListener('keydown',event => {
    if (event.key === 'Escape' && !detailPane.hidden) {
      closeDetails();detailTrigger.focus();event.stopPropagation();
    }
  });

  function sourceState(index) {
    const panel = sources[index - 1];
    if (index === 1) {
      const pageIndex = currentIndex(shifenTabs);
      const page = shifenPages[pageIndex];
      const routePanel = page.querySelector('.route-panel');
      return {panel,page,routePanel,route:routePanel,routeKey:null,index:pageIndex};
    }
    if (index === 2) {
      const routePanel = panel.querySelector('.route-panel');
      return {panel,page:panel,routePanel,route:routePanel,routeKey:null,index:0};
    }
    const choiceIndex = currentIndex(yehliuChoices);
    const route = yehliuRoutes[choiceIndex];
    return {panel,page:panel,routePanel:route.closest('.route-panel'),route,routeKey:route.dataset.route,index:choiceIndex};
  }
  function metaSummary(state) {
    const items = [...state.routePanel?.querySelectorAll('.rail-title .daytrip-route-head-meta') || []];
    const found = items.find(n => state.routeKey && n.dataset.route === state.routeKey) || items[state.index] || items.find(visible);
    const labels = [...found?.querySelectorAll(':scope > span') || []].map(text).filter(Boolean);
    return labels.length ? labels.join('　') : text(found);
  }
  function stationData(stop) {
    const primary = text(stop.querySelector('.stop-name')) || text(stop.querySelector('.stop-body strong'));
    const japanese = text(stop.querySelector('.airsel-station-ja'));
    const name = japanese || primary;
    const anchor = stop.querySelector('.stop-body a[href]');
    return {name,href:anchor?.getAttribute('href')||''};
  }
  function stationHTML(stop,index,total) {
    const type = index===0?'start':index===total-1?'end':'transfer';
    const point = stationData(stop);
    const place = point.href
      ? `<a href="${esc(point.href)}" target="_self" rel="noopener noreferrer">${esc(point.name)}</a>`
      : esc(point.name);
    const label = type==='start'?'出発':type==='end'?'到着':'乗換';
    const mark = type==='end'?'tt2-route-mark-end':type==='transfer'?'tt2-route-mark-transfer':'tt2-route-mark-start';
    const offset = total > 1 ? (index/(total-1))*267 : 0;
    return `<div class="tt2-route-stop-wrap" style="top:${offset.toFixed(1)}px;--stop-index:${index}">
      <div class="tt2-route-stop tt2-route-stop-${type}">
        <span class="tt2-route-status">${label}</span>
        <span class="tt2-route-dot ${mark}" aria-hidden="true"></span>
        <span class="tt2-route-station">${place}</span>
      </div></div>`;
  }
  function legHTML(leg,index,mode) {
    const line = text(leg.querySelector('.line-name'));
    const count = text(leg.querySelector('.station-count'));
    const dir = text(leg.querySelector('.direction'));
    const note = text(leg.querySelector('.direction-note'));
    const operator = text(leg.querySelector('.operator-name'));
    const metadata = /^\d+$/.test(line) ? [operator, count.replace(/^・/,'').replace(/直通/g,'').trim(),line+'番'].filter(Boolean).join('　') : line;
    return `<div class="tt2-route-leg tt2-route-leg-${index}">
      <span class="tt2-route-line-name">${esc(metadata||line)}</span>
      <span class="tt2-route-direction">${esc(dir)}</span>
      ${note?`<span class="tt2-route-note">${esc(note)}</span>`:''}
      ${count && !/^\d+$/.test(line) && count !== line ? `<span class="tt2-route-note">${esc(count)}</span>` : ''}
    </div>`;
  }
  function makeExtra(state,index) {
    const source = state.page;
    const strings = [];
    // Find the official/source-specific explanatory paragraphs, not sample copy.
    for (const n of source.querySelectorAll('.daytrip-note, .footnote, .daytrip-canonical-note, .daytrip-rail-note, .route-fare-note, .daytrip-rail-traffic-note')) {
      const val = text(n);
      if (val && !strings.includes(val)) strings.push(val);
    }
    const blocks = state.panel.querySelectorAll('details.daytrip-inline-accordion');
    const details = [...blocks].map(el => el.cloneNode(true));
    detailContent.replaceChildren();
    const block = document.createElement('div');
    block.className='tt2-trip-detail-copy';
    strings.forEach(str => {const p=document.createElement('p');p.textContent=str;block.append(p);});
    detailContent.append(block,...details);
    const hasDetail = strings.length || details.length;
    detailTrigger.hidden = !hasDetail;
    detailTrigger.firstChild.textContent = index===1?'交通の注意事項を見る':index===2?'見どころ・詳細を見る':'見どころを見る';
    closeDetails();
    // Summarize with the original first sentence, retaining full original detail
    // via disclosure. Keelung's note is not a route safety warning.
    if (strings.length) {
      const first = strings[0].split('。')[0];
      warning.textContent = first ? first + '。' : strings[0];
    } else {
      warning.textContent = '';
    }
    warning.hidden = !strings.length;
  }
  function update() {
    if (destination < 1 || destination > 3) return;
    const state = sourceState(destination);
    if (!state.route) return;
    const timeline = state.route.querySelector('.timeline');
    if (!timeline) return;
    closeDetails();
    const stops = [...timeline.querySelectorAll(':scope > .timeline-stop')];
    const legs = [...timeline.querySelectorAll(':scope > .timeline-leg')];
    summary.textContent = metaSummary(state);
    stage.dataset.tt2Destination = String(destination);
    stage.dataset.tt2Mode = String(state.index);
    stage.dataset.tt2StopCount = String(stops.length);
    track.setAttribute('aria-label',timeline.getAttribute('aria-label')||'交通経路');
    track.innerHTML = '<span class="tt2-route-growline" aria-hidden="true"></span>'
      +stops.map((stop,index) => stationHTML(stop,index,stops.length)).join('')
      +legs.map((leg,index) => legHTML(leg,index,stops.length)).join('');
    // Yehliu's mode strip already selects 1815 vs. 790. Do not repeat the
    // same choices at the bottom of the page.
    choices.hidden = true;
    choices.replaceChildren();
    makeExtra(state,destination);
    stage.classList.remove('tt2-route-animate');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void stage.offsetHeight;
      stage.classList.add('tt2-route-animate');
    }
    stage.dataset.renderToken = String(++renderSerial);
  }
  function sync() {
    if (document.documentElement.dataset.ttView !== 'day-trips') {
      destination = -1;
      section.classList.remove('tt2-trip-modern');
      stage.hidden = true;
      closeDetails();
      return;
    }
    const current = destButtons.findIndex(button => button.getAttribute('aria-expanded') === 'true');
    section.classList.toggle('tt2-trip-modern',current >= 1);
    if (current < 1) {
      stage.hidden = true;
      destination = current;
      closeDetails();
      return;
    }
    stage.hidden = false;
    stage.setAttribute('aria-label', ['','十分','基隆','野柳'][current]+'への交通案内');
    destination = current;
    section.scrollLeft = 0;
    update();
  }
  // Legacy destination focus helpers can scroll the -16px horizontal
  // overhang into view, shifting the whole four-button row to the left.
  // This route screen never needs horizontal scrolling of its parent.
  section.addEventListener('scroll',()=>{
    if (document.documentElement.dataset.ttView === 'day-trips' && section.scrollLeft) section.scrollLeft = 0;
  },{passive:true});
  destButtons.forEach(b => b.addEventListener('click',()=>requestAnimationFrame(()=>{section.scrollLeft=0;sync();})));
  shifenTabs.forEach(b => b.addEventListener('click',()=>requestAnimationFrame(update)));
  yehliuChoices.forEach(b => b.addEventListener('click',()=>requestAnimationFrame(update)));
  document.addEventListener('tt:viewchange',()=>requestAnimationFrame(sync));
  sync();
})();
