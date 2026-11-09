/* TABI TAIPEI 2.0.13 / Figma 6-1, 6-1-1 and 6-1-2
 * Jiufen: new semantic, keyboard-operable UI; original day-trip DOM remains
 * the authoritative transport data source and the controller for the other
 * destinations. No API, JSON mutations, screen-sized imagery or fake routes.
 */
(() => {
  'use strict';
  const section = document.querySelector('#guide .sights-day-trips');
  if (!section) return;
  const nativeDest = [...section.querySelectorAll('.daytrip-destination-buttons > button')];
  const jiufen = document.querySelector('#daytrip-destination-panel-1');
  const nativeModes = [...jiufen?.querySelectorAll(':scope > .destination-body > .tab > .daytrip-transport > button.daytrip-transport-tab') || []];
  const modePages = [...jiufen?.querySelectorAll(':scope > .destination-body > .tab > .tab-panels > .tab-panel') || []];
  if (nativeDest.length !== 4 || nativeModes.length !== 3 || modePages.length !== 3) return;
  const modes = ['直通バス','台鉄 ＋ 乗換','十分から九份'];
  // Keep the original button and all of its native event listeners, but use
  // Figma's shorter displayed location names instead of the old '〜へ'.
  nativeDest.forEach((button,i)=>{
    const title=button.querySelector('.daytrip-destination-button-name');
    if(title) title.textContent=['九份','十分','基隆','野柳'][i];
  });
  const stage = document.createElement('div');
  stage.className = 'tt2-trip-stage';
  stage.setAttribute('aria-label', '九份への交通案内');
  stage.innerHTML = `<nav class="tt2-trip-modes" aria-label="九份への交通手段" role="tablist"></nav>
    <div class="tt2-trip-body" role="region" aria-label="選択した交通経路">
      <p class="tt2-trip-summary"></p>
      <p class="tt2-trip-warning">夜は復路のバス・タクシーが混雑します。<br>帰りの交通手段も事前に確認。</p>
      <div class="tt2-route-track" aria-label="交通経路"></div>
      <div class="tt2-route-choices" role="group" aria-label="路線を選択"></div>
    </div>`;
  section.querySelector('.daytrip-destination-buttons').after(stage);
  const modeBar = stage.querySelector('.tt2-trip-modes');
  const summaryEl = stage.querySelector('.tt2-trip-summary');
  const trackEl = stage.querySelector('.tt2-route-track');
  const choicesEl = stage.querySelector('.tt2-route-choices');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = el => el?.textContent.replace(/\s+/g,' ').trim() || '';
  const attr = (el, name) => el?.getAttribute(name) || '';
  let activeMode = 0;
  let selections = [0,0,0];
  let renderToken = 0;
  let active = false;
  const modeButtons = modes.map((label,index)=>{
    const b=document.createElement('button');b.type='button';b.role='tab';b.className='tt2-trip-mode';
    b.textContent=label;b.setAttribute('aria-selected',String(index===0));
    b.addEventListener('click',()=>{
      if(index===activeMode)return;
      activeMode=index;
      // Reuse, do not replace, the original transport tab's behavior.
      if(nativeModes[index].getAttribute('aria-selected')!=='true')nativeModes[index].click();
      // The original tab resets the subroute to its first option.  Sync to
      // that state so the new title, route drawing and old source agree.
      const src=[...modePages[index].querySelectorAll('.daytrip-bus-route-choice')];
      const newSelected=src.findIndex(x=>x.getAttribute('aria-pressed')==='true');
      if(newSelected>=0)selections[index]=newSelected;
      render();
      // The legacy handler may animate the hidden source. No screen jump.
      requestAnimationFrame(()=>{if(active)document.getElementById('guide').scrollTop=0;});
    });
    modeBar.append(b);return b;
  });
  function chosenRoutes(page) {
    const routes = [...page.querySelectorAll('.daytrip-bus-route')];
    if(routes.length)return routes;
    const t=page.querySelector('.timeline');
    return t?[t.closest('.route-panel')||t.parentElement]:[];
  }
  function getMeta(page, route, subIndex) {
    const key=route.dataset.route;
    const head=route.closest('.route-panel')?.querySelector('.rail-title') || page.querySelector('.rail-title');
    const items=[...head?.querySelectorAll('.daytrip-route-head-meta') || []];
    return items.find(n=>(key&&n.dataset.route===key)||n.dataset.route===String(subIndex)) || items[subIndex] || items.find(n=>!n.hidden) || null;
  }
  function stopData(el,index) {
    const label=el?.querySelector('.stop-name');
    const translated=el?.querySelector('.airsel-station-ja');
    const raw=text(label)||text(el?.querySelector('strong'));
    const link=el?.querySelector('.stop-body a[href]');
    let name=raw;
    // Only these source-verified station names use the concise Figma wording.
    if(activeMode===0 && index===0)name=selections[0]===0?'MRT 西門駅・北門駅付近':'MRT 忠孝復興駅付近';
    if(index===-1)name='九份';
    else if(translated && /瑞芳/.test(raw))name=text(translated);
    return {name,sub:translated?text(translated):'',url:link?.getAttribute('href')||''};
  }
  function stopHTML(el,index,kind) {
    const d=stopData(el,index===999?-1:index);
    const label=kind==='start'?'出発':kind==='end'?'到着':'乗換';
    const mark=kind==='transfer'?'tt2-route-mark-transfer':kind==='end'?'tt2-route-mark-end':'tt2-route-mark-start';
    const station=d.url?`<a href="${esc(d.url)}" target="_self">${esc(d.name)}</a>`:esc(d.name);
    return `<div class="tt2-route-stop tt2-route-stop-${kind}"><span class="tt2-route-status">${label}</span>
      <span class="tt2-route-dot ${mark}" aria-hidden="true"></span><span class="tt2-route-station">${station}</span></div>`;
  }
  function legHTML(el,i,count) {
    const line = text(el.querySelector('.line-name'));
    const company = text(el.querySelector('.station-count'));
    const direction = text(el.querySelector('.direction'));
    const note = text(el.querySelector('.direction-note'));
    // Figma shows operator + route number as an understated upper label.
    const routeTitle = /^\d+$/.test(line) ? `${company.replace(/[・]直通/g,'').replace(/^・/,'')}　${line}番` : line;
    return `<div class="tt2-route-leg tt2-route-leg-${i}" style="--leg-fraction:${(i+1)/(count+1)}">
      <span class="tt2-route-line-name">${esc(routeTitle)}</span>
      <span class="tt2-route-direction">${esc(direction)}</span>
      ${note?`<span class="tt2-route-note">${esc(note)}</span>`:''}
      ${company&&(!/^\d+$/.test(line))?`<span class="tt2-route-note">${esc(company)}</span>`:''}
    </div>`;
  }
  function subrouteControls(page,routes) {
    choicesEl.replaceChildren();
    if(routes.length<2){choicesEl.hidden=true;return;}
    choicesEl.hidden=false;
    const origChoices=[...page.querySelectorAll('.daytrip-bus-route-choice')];
    routes.forEach((route,index)=>{
      const source=origChoices[index];
      const line=text(source?.querySelector('strong'))|| (activeMode===0?(index===0?'965':'1062'): index===0?'788・827':'タクシー');
      const fallback=activeMode===0?index===0?'MRT西門駅・北門駅から':'MRT忠孝復興駅から':'瑞芳駅から';
      const srcLabel=text(source?.querySelector('span'));
      const shortLabel=srcLabel.replace(/・(?:路線バス|タクシー)$/, '')||fallback;
      const operator=activeMode===0 ? (index===0?'台北客運':'基隆客運') : (index===0?'台北客運':'タクシー');
      const b=document.createElement('button');b.type='button';b.className='tt2-route-choice';
      b.setAttribute('aria-pressed',String(index===selections[activeMode]));
      const service=activeMode===0 ? `${operator}　${line}番` : (index===0?`路線バス　${line}番`:'タクシー');
      b.innerHTML=`<small>${esc(shortLabel)}</small><strong>${esc(service)}</strong>`;
      b.addEventListener('click',()=>{
        if(selections[activeMode]===index)return;
        selections[activeMode]=index;
        if(source)source.click(); // original route controller owns source state
        render();
      });
      choicesEl.append(b);
    });
  }
  function render() {
    const token=++renderToken;
    modeButtons.forEach((b,i)=>b.setAttribute('aria-selected',String(i===activeMode)));
    stage.dataset.tripMode=String(activeMode);
    const page=modePages[activeMode];
    const routes=chosenRoutes(page);
    const chosen=Math.max(0,Math.min(selections[activeMode],routes.length-1));
    const route=routes[chosen];
    if(!route)return;
    const metadata=getMeta(page,route,chosen);
    const metaItems=[...metadata?.querySelectorAll('span')||[]].map(text).filter(Boolean);
    const title=metaItems.join('　');
    summaryEl.textContent=title;
    const timeline=route.querySelector('.timeline')||route.closest('.timeline');
    if(!timeline)return;
    trackEl.setAttribute('aria-label',attr(timeline,'aria-label')||'九份への交通経路');
    const stops=[...timeline.querySelectorAll(':scope > .timeline-stop')];
    const legs=[...timeline.querySelectorAll(':scope > .timeline-leg')];
    let markup='<span class="tt2-route-growline" aria-hidden="true"></span>';
    stops.forEach((s,i)=>{
      const kind=i===0?'start':i===stops.length-1?'end':'transfer';
      const stationIndex=i===stops.length-1?999:i;
      const offset=(i/(stops.length-1||1))*267;
      markup += `<div class="tt2-route-stop-wrap" style="--stop-index:${i};top:${offset.toFixed(2)}px">${stopHTML(s,stationIndex,kind)}</div>`;
    });
    markup += legs.map((leg,i)=>legHTML(leg,i,legs.length)).join('');
    // Keep the public timeline from the original data, rendered as editable HTML.
    trackEl.innerHTML=markup;
    subrouteControls(page,routes);
    stage.classList.remove('tt2-route-animate');
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void stage.offsetWidth;stage.classList.add('tt2-route-animate');
    }
    // No async background work: stale transition events from old panels do not
    // rebuild this view after a newer route has already been selected.
    stage.dataset.renderToken=String(token);
  }
  function sync() {
    const view=document.documentElement.dataset.ttView;
    const expanded=nativeDest.findIndex(n=>n.getAttribute('aria-expanded')==='true');
    active=view==='day-trips' && (expanded===0);
    section.classList.toggle('tt2-trip-jiufen',active);
    section.classList.toggle('tt2-trip-legacy',view==='day-trips'&&expanded>0);
    stage.hidden=!active;
    if(active){
      // The legacy destination controller resets a reopened destination to
      // its first mode. Follow its *actual* selected state, not stale view state.
      const sourceIndex=nativeModes.findIndex(b=>b.getAttribute('aria-selected')==='true');
      if(sourceIndex>=0)activeMode=sourceIndex;
      const page=modePages[activeMode];
      const srcChoice=[...page.querySelectorAll('.daytrip-bus-route-choice')];
      const srcChoiceIndex=srcChoice.findIndex(b=>b.getAttribute('aria-pressed')==='true');
      if(srcChoiceIndex>=0)selections[activeMode]=srcChoiceIndex;
      render();
    }
  }
  // A Figma destination tab stays selected when tapped again: do not let
  // the legacy expandable-card handler collapse the only new route screen.
  nativeDest[0].addEventListener('click',e=>{
    if(document.documentElement.dataset.ttView==='day-trips' &&
       nativeDest[0].getAttribute('aria-expanded')==='true') {
      e.preventDefault();e.stopImmediatePropagation();
    }
  },true);
  nativeDest.forEach((b,i)=>b.addEventListener('click',()=>{
    // The original controller is attached before us and updates aria-expanded
    // synchronously. The new rendering mirrors the native state.
    sync();
  }));
  document.addEventListener('tt:viewchange',e=>{
    if(e.detail?.view!=='day-trips')return;
    // A Figma page is an open route screen, not the legacy closed accordion.
    // Only auto-open Jiufen when no other destination is currently expanded.
    if(nativeDest.every(b=>b.getAttribute('aria-expanded')!=='true')) nativeDest[0].click();
    sync();
    const guide=document.getElementById('guide');if(guide)guide.scrollTop=0;
  });
  sync();
})();


/* TABI TAIPEI 2.0.14 / shared submode shelf for Jiufen + Shifen */
(() => {
  'use strict';
  const section = document.querySelector('#guide .sights-day-trips');
  if (!section) return;
  const destRow = section.querySelector('.daytrip-destination-buttons');
  const destButtons = [...destRow?.querySelectorAll(':scope > .daytrip-destination-button') || []];
  const stage = section.querySelector('.tt2-trip-stage');
  const jiufenButtons = [...stage?.querySelectorAll('.tt2-trip-modes > .tt2-trip-mode') || []];
  const shifenPanel = document.getElementById('daytrip-destination-panel-2');
  const shifenButtons = [...shifenPanel?.querySelectorAll(':scope > .destination-body > .tab > .daytrip-transport > .daytrip-transport-tab') || []];
  const yehliuPanel = document.getElementById('daytrip-destination-panel-4');
  const yehliuChoices = [...yehliuPanel?.querySelectorAll('.daytrip-bus-route-choice') || []];
  if (destButtons.length !== 4 || !destRow || !stage || jiufenButtons.length !== 3 || shifenButtons.length !== 2 || yehliuChoices.length !== 2) return;

  shifenPanel.dataset.tt2Submode = 'true';
  const shelf = document.createElement('div');
  shelf.className = 'tt2-submode-shelf';
  shelf.setAttribute('aria-hidden', 'true');
  shelf.innerHTML = '<nav class="tt2-submode-nav" role="tablist" aria-label="交通手段"></nav>';
  destRow.after(shelf);
  const nav = shelf.querySelector('.tt2-submode-nav');
  let activeDestination = -1;
  let activeButtons = [];
  let openTimer = 0;
  let revealToken = 0;

  const viewIsDayTrips = () => document.documentElement.dataset.ttView === 'day-trips';
  const selectedIndex = buttons => Math.max(0, buttons.findIndex(b => (b.getAttribute('aria-selected') || b.getAttribute('aria-pressed')) === 'true'));
  const labelText = button => button.textContent.replace(/\s+/g, ' ').trim();

  function modeConfig(destIndex) {
    if (destIndex === 0) return {
      key: 'jiufen',
      labels: jiufenButtons.map(labelText),
      selected: selectedIndex(jiufenButtons),
      click: index => jiufenButtons[index]?.click()
    };
    if (destIndex === 1) return {
      key: 'shifen',
      labels: shifenButtons.map(labelText),
      selected: selectedIndex(shifenButtons),
      click: index => shifenButtons[index]?.click()
    };
    // These labels come from the actual existing routes, not generated transport data.
    if (destIndex === 2) return {
      key: 'keelung', labels: ['台鉄'], selected: 0, click: () => {}
    };
    if (destIndex === 3) return {
      key: 'yehliu',
      labels: yehliuChoices.map(x => x.dataset.route + '番'),
      selected: selectedIndex(yehliuChoices),
      click: index => yehliuChoices[index]?.click()
    };
    return null;
  }

  function syncButtonState() {
    const config = modeConfig(activeDestination);
    if (!config || !activeButtons.length) return;
    activeButtons.forEach((button, index) => {
      button.setAttribute('aria-selected', String(index === config.selected));
    });
  }

  function buildShelf(destIndex) {
    const config = modeConfig(destIndex);
    if (!config) return hideShelf();
    const switching = activeDestination !== -1 && activeDestination !== destIndex;
    // A newly chosen destination opens its own second row from zero height,
    // including when switching directly from Jiufen to Shifen and back.
    if (switching && shelf.classList.contains('is-open')) {
      shelf.classList.remove('is-open');
      void shelf.offsetHeight;
    }
    const token = ++revealToken;
    activeDestination = destIndex;
    section.dataset.tt2Submode = config.key;
    nav.style.setProperty('--tt2-submode-cols', String(config.labels.length));
    nav.innerHTML = '';
    activeButtons = config.labels.map((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tt2-submode-button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(index === config.selected));
      button.innerHTML = `<span class="tt2-submode-button-label">${label}</span>`;
      button.addEventListener('click', () => {
        config.click(index);
        requestAnimationFrame(syncButtonState);
      });
      nav.append(button);
      return button;
    });
    shelf.setAttribute('aria-hidden', 'false');
    clearTimeout(openTimer);
    requestAnimationFrame(() => {
      if (token === revealToken) shelf.classList.add('is-open');
    });
  }

  function hideShelf() {
    ++revealToken;
    activeDestination = -1;
    activeButtons = [];
    delete section.dataset.tt2Submode;
    shelf.classList.remove('is-open');
    shelf.setAttribute('aria-hidden', 'true');
    clearTimeout(openTimer);
    openTimer = window.setTimeout(() => {
      if (shelf.classList.contains('is-open')) return;
      nav.innerHTML = '';
    }, 260);
  }

  function syncShelf() {
    if (!viewIsDayTrips()) return hideShelf();
    const expanded = destButtons.findIndex(button => button.getAttribute('aria-expanded') === 'true');
    if (expanded >= 0 && expanded <= 3) {
      const needRebuild = expanded !== activeDestination || !activeButtons.length;
      if (needRebuild) buildShelf(expanded);
      else syncButtonState();
      return;
    }
    hideShelf();
  }

  destButtons.forEach(button => button.addEventListener('click', () => requestAnimationFrame(syncShelf)));
  jiufenButtons.forEach(button => button.addEventListener('click', () => requestAnimationFrame(syncButtonState)));
  shifenButtons.forEach(button => button.addEventListener('click', () => requestAnimationFrame(syncButtonState)));
  yehliuChoices.forEach(button => button.addEventListener('click', () => requestAnimationFrame(syncButtonState)));
  document.addEventListener('tt:viewchange', () => requestAnimationFrame(syncShelf));
  syncShelf();
})();