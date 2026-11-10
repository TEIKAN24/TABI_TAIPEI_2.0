/* TABI TAIPEI 2.0.24 — Figma 6-1-1 / 6-1-2 shared route system.
 * Presentation reads the original four destination panels. Their timetable,
 * operator, fare, stop and original data are not modified. Cross-destination
 * taxi routes are displayed from the opposite panel, where they are already
 * stored in the correct direction.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const section = document.querySelector('#guide .sights-day-trips');
  if (!section) return;
  const destinations = [...section.querySelectorAll('.daytrip-destination-buttons > button')];
  const panels = [1,2,3,4].map(i => document.getElementById(`daytrip-destination-panel-${i}`));
  if (destinations.length !== 4 || panels.some(p => !p)) return;
  const srcTabs = n => [...panels[n].querySelectorAll(':scope > .destination-body > .tab > .daytrip-transport > .daytrip-transport-tab')];
  const srcPages = n => [...panels[n].querySelectorAll(':scope > .destination-body > .tab > .tab-panels > .tab-panel')];
  const jiufenPages = srcPages(0), shifenPages = srcPages(1);
  if (jiufenPages.length !== 3 || shifenPages.length !== 2) return;
  const txt = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routeNodes = page => {
    const routes = [...page.querySelectorAll('.daytrip-bus-route')];
    return routes.length ? routes : [page.querySelector('.route-panel')].filter(Boolean);
  };
  const D = (panel, page, i, label, type, reverse=false) => ({panel,page,i,label,type,reverse,
    get route(){return routeNodes(page)[i]},
  });
  const configs = [
    [
      {label:'直通バス', options:[D(panels[0],jiufenPages[0],0,'台北客運 965番','direct'),D(panels[0],jiufenPages[0],1,'基隆客運 1062番','direct')]},
      {label:'台鉄 ＋ 乗換', options:[D(panels[0],jiufenPages[1],0,'路線バス','railbus'),D(panels[0],jiufenPages[1],1,'タクシー','railtaxi')]},
      {label:'九份 → 十分', options:[D(panels[1],shifenPages[1],0,'タクシー','taxi',true)]}
    ],
    [
      {label:'台鉄',options:[D(panels[1],shifenPages[0],0,'台鉄','rail')]},
      {label:'十分 → 九份',options:[D(panels[0],jiufenPages[2],0,'タクシー','taxi',true)]}
    ],
    [{label:'台鉄',options:[D(panels[2],panels[2],0,'台鉄','rail')]}],
    [{label:'路線バス',options:[D(panels[3],panels[3],0,'國光客運 1815番','bus'),D(panels[3],panels[3],1,'基隆客運 790番','bus')]}]
  ];
  const names = ['九份','十分','基隆','野柳'];
  const nav = document.createElement('nav');
  nav.className='tt221-mode-nav';nav.setAttribute('aria-label','移動方法');
  const stage = document.createElement('section');
  stage.className='tt221-stage';stage.setAttribute('aria-label','交通経路案内');
  stage.innerHTML=`<div class="tt221-pick-row">
     <div class="tt221-pick-wrap"><span class="tt221-pick-tag" hidden>乗換</span>
       <button type="button" class="tt221-pick-button" aria-haspopup="listbox" aria-expanded="false"><span class="tt221-pick-label"></span><span class="tt221-pick-chevron" aria-hidden="true"></span></button>
       <div class="tt221-pick-menu" role="listbox" aria-label="利用路線" hidden></div>
     </div>
     <a class="tt221-map-link" href="#" target="_blank" rel="noopener noreferrer">経路を見る</a>
   </div>
   <div class="tt221-glow" aria-hidden="true"></div>
   <div class="tt221-route">
     <div class="tt221-route-meta"><span class="tt221-fare"></span><strong class="tt221-duration"></strong><span class="tt221-meta-note"></span></div>
     <div class="tt221-track" role="group" aria-label="経路"></div>
   </div>
   <p class="tt221-warning"></p>`;
  const firstRow = section.querySelector('.daytrip-destination-buttons');
  firstRow.after(nav,stage);
  section.classList.add('tt221-ready');
  const pickWrap=stage.querySelector('.tt221-pick-wrap'), pick=stage.querySelector('.tt221-pick-button'),
    pickTag=stage.querySelector('.tt221-pick-tag'), pickLabel=stage.querySelector('.tt221-pick-label'),
    pickMenu=stage.querySelector('.tt221-pick-menu'), fare=stage.querySelector('.tt221-fare'),
    duration=stage.querySelector('.tt221-duration'), metaNote=stage.querySelector('.tt221-meta-note'),
    track=stage.querySelector('.tt221-track'), warning=stage.querySelector('.tt221-warning'),
    mapLink=stage.querySelector('.tt221-map-link');
  let dest=0, mode=0;
  const picks = configs.map(modes=>modes.map(()=>0));
  const inside = e => pickWrap.contains(e.target);
  const closeMenu = () => {pickMenu.hidden=true;pick.setAttribute('aria-expanded','false');};
  const isDayTrips = () => root.dataset.ttView === 'day-trips';
  function changeDestination(i) {
    if (!isDayTrips())return;
    dest=i;mode=0;
    stage.setAttribute('aria-label',`${names[i]}の交通経路案内`);
    renderModes();render();
  }
  function renderModes(){
    nav.replaceChildren();
    nav.style.setProperty('--tt221-columns',String(configs[dest].length));
    configs[dest].forEach((c,i)=>{
      const b=document.createElement('button');b.type='button';b.className='tt221-mode';b.role='tab';
      b.setAttribute('aria-selected',String(i===mode));b.textContent=c.label;
      b.addEventListener('click',()=>{if(mode===i)return;mode=i;closeMenu();renderModes();render();});
      nav.append(b);
    });
  }
  function sourceMetadata(option) {
    const head=option.route?.closest('.route-panel')?.querySelector('.rail-title') || option.page.querySelector('.rail-title');
    const entries=[...head?.querySelectorAll('.daytrip-route-head-meta')||[]];
    const selected=entries.find(e=>option.route?.dataset.route&&e.dataset.route===option.route.dataset.route)
      || entries[option.i] || entries.find(e=>!e.hidden) || null;
    const labels=[...selected?.querySelectorAll(':scope > span')||[]].map(txt).filter(Boolean);
    return labels;
  }
  function getWarnings(option) {
    const page=option.page;
    const notes=[...page.querySelectorAll('.daytrip-note--important, .footnote, .daytrip-note, .daytrip-canonical-note')]
      .map(txt).filter(Boolean);
    if(dest===0 && mode!==2) return '夜は復路のバス・タクシーが混雑します。\n帰りの交通手段も事前に確認。';
    if(dest===0 && mode===2) return '十分と九份を巡る際は乗車場所と運賃を事前に確認。';
    if(dest===1 && mode===1) return 'タクシーの乗車場所・運賃を事前に確認。';
    if(dest===1) return '平渓線は約1時間に1本。\n時刻と復路の交通手段を事前に確認。';
    if(dest===2) return '基隆駅から港周辺へは徒歩でアクセスできます。\n運賃は乗車券・列車により異なります。';
    if(dest===3) return '路線によって出発地と運賃が異なります。\n運行状況と復路の時刻も事前に確認。';
    return notes[0]||'';
  }
  function segmentKind(leg, option, n) {
    if(option.type==='railtaxi') return n===0?'rail':'taxi';
    if(option.type==='railbus') return n===0?'rail':'bus';
    if(option.type==='rail') return 'rail';
    if(option.type==='taxi') return 'taxi';
    if(option.type==='direct'||option.type==='bus') return 'bus';
    const raw=txt(leg);
    if(/徒歩/.test(raw)) return 'walk';
    if(/タクシー/.test(raw)) return 'taxi';
    if(/台鉄|台鐵|平渓線/.test(raw))return 'rail';
    return 'bus';
  }
  function stationInfo(stop, index, total, option) {
    const primary=txt(stop.querySelector('.stop-name'))||txt(stop.querySelector('.stop-body strong'));
    const translated=txt(stop.querySelector('.airsel-station-ja'));
    let name=translated||primary;
    let sub='';
    if(dest===0 && mode===0 && index===0){
      if(picks[dest][mode]===0){name='捷運西門站';sub='バス停「MRT Ximen Sta.」';}
      else{name='捷運忠孝復興站';sub='MRT 忠孝復興駅付近';}
    } else if(index===0 && /台北駅・松山駅/.test(name)){
      name='台北駅';sub='松山駅などからも乗車可能';
    } else if(index===total-1){
      if(dest===0 && mode!==2) name='九份';
      if(dest===1 && mode===0) name='十分';
      if(dest===2) name='基隆';
      if(dest===3) name='野柳';
    }
    if(index!==0 && index!==total-1){
      // The transfer is expressed ONLY by the concentric node and white
      // 「乗換」 badge; no extra transport-description line is rendered.
      if(/瑞芳/.test(name))name='瑞芳駅';
      sub='';
    }
    return {name,sub};
  }
  function legInfo(leg,option,i) {
    const line=txt(leg.querySelector('.line-name'));
    const company=txt(leg.querySelector('.station-count'));
    const dir=txt(leg.querySelector('.direction'));
    const note=txt(leg.querySelector('.direction-note'));
    let head=line;
    if(option.type==='direct') head=(option.i===0?'台北客運':'基隆客運')+`　${option.i===0?'965':'1062'}番`;
    else if(option.type==='railbus' && i===1)head='路線バス　788番・827番';
    else if(option.type==='bus')head=(option.i===0?'國光客運　1815番':'基隆客運　790番');
    else if(line==='台鉄')head='台鉄';
    const kind=segmentKind(leg,option,i);
    let detail=note;
    if(!detail && kind==='rail') detail='瑞芳に停まる列車に乗車';
    if(!detail && kind==='bus' && option.type==='railbus')detail='路線バスに乗車';
    if(!detail && kind==='taxi')detail='乗車場所・料金を事前に確認';
    return {head,dir,detail,kind};
  }
  function routeURL(stops,option) {
    const start=stationInfo(stops[0],0,stops.length,option).name;
    const end=stationInfo(stops[stops.length-1],stops.length-1,stops.length,option).name;
    return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(start)
      +'&destination='+encodeURIComponent(end)+'&travelmode='+(option.type==='taxi'?'driving':'transit');
  }
  function render() {
    const options=configs[dest][mode].options;
    picks[dest][mode]=Math.min(picks[dest][mode],options.length-1);
    const opt=options[picks[dest][mode]];
    const timeline=opt.route?.querySelector('.timeline');
    if(!timeline)return;
    const stops=[...timeline.querySelectorAll(':scope > .timeline-stop')], legs=[...timeline.querySelectorAll(':scope > .timeline-leg')];
    if(stops.length<2)return;
    stage.dataset.tt221Destination=String(dest);
    stage.dataset.tt221Mode=String(mode);
    stage.dataset.tt221Stops=String(stops.length);
    stage.dataset.tt221Kind=opt.type;
    const multi=options.length>1;
    pickWrap.classList.toggle('tt221-single',!multi);
    pickLabel.textContent=opt.label;
    pick.disabled=!multi;
    pick.removeAttribute('aria-haspopup');
    if(multi)pick.setAttribute('aria-haspopup','listbox');
    pickTag.hidden = !(opt.type==='railbus'||opt.type==='railtaxi');
    pickMenu.replaceChildren();closeMenu();
    if(multi) options.forEach((item,i)=>{
      const b=document.createElement('button');b.type='button';b.role='option';b.className='tt221-menu-item';
      b.setAttribute('aria-selected',String(i===picks[dest][mode]));b.textContent=item.label;
      b.addEventListener('click',()=>{picks[dest][mode]=i;render();pick.focus();});pickMenu.append(b);
    });
    const meta=sourceMetadata(opt);
    const time=meta.find(v=>/分|時間/.test(v))||'';
    const price=meta.find(v=>/NT\$|料金|運賃|メーター/.test(v))||'';
    fare.textContent=price;
    duration.textContent=time;
    metaNote.textContent=price.includes('タクシー')||opt.type==='taxi' ? '※タクシーは概算・事前確認' : '※列車・運行状況により';
    if(dest===0 && mode===0 && picks[0][0]===0){fare.textContent='片道 NT$90';}
    warning.textContent=getWarnings(opt);
    mapLink.href=routeURL(stops,opt);
    track.setAttribute('aria-label',timeline.getAttribute('aria-label')||`${names[dest]}への経路`);
    const parts=[];
    for(let i=0;i<legs.length;i++) {
      const kind=segmentKind(legs[i],opt,i);
      const pct0=(i/(stops.length-1))*100, pct1=((i+1)/(stops.length-1))*100;
      // Preserve the authored 5px clearance on both sides of every dot.
      // The 18px transfer node is centred on the same axis as the prior 22px one.
      const startGap = i===0 ? 16 : 20;
      const endGap = i+1===stops.length-1 ? 4 : 8;
      parts.push(`<span aria-hidden="true" class="tt221-line tt221-line--${kind}" style="top:calc(${pct0}% + ${startGap}px);height:calc(${pct1-pct0}% - ${startGap+endGap}px)"></span>`);
    }
    stops.forEach((stop,i)=>{
      const st=stationInfo(stop,i,stops.length,opt);
      const dotKind=i===0?'start':i===stops.length-1?'end':'transfer';
      const dotTop=`${(i/(stops.length-1))*100}%`;
      const textMark=dotKind==='start'?'出発':dotKind==='end'?'到着':'乗換';
      parts.push(`<div class="tt221-stop tt221-stop--${dotKind}" style="top:${dotTop}">
         <span class="tt221-status">${textMark}</span><span class="tt221-dot" aria-hidden="true"></span>
         <div class="tt221-station"><strong>${safe(st.name)}</strong>${st.sub?`<span class="tt221-station-sub">${safe(st.sub)}</span>`:''}</div></div>`);
    });
    legs.forEach((leg,i)=>{
      const l=legInfo(leg,opt,i);
      const top=stops.length===2?'calc(50% - 10px)':`calc(${i/(stops.length-1)*100}% + 58px)`;
      const headHtml = l.kind==='rail' && /台鉄|台鐵/.test(l.head)
        ? `<span class="tt221-rail-row"><img class="tt221-rail-logo" src="assets/rail-logos/tra.svg" alt="" aria-hidden="true"><span class="tt221-rail-label">台鉄</span></span>`
        : `<span class="tt221-leg-small">${safe(l.head)}</span>`;
      parts.push(`<div class="tt221-leg" style="top:${top};--tt221-leg-base:${i/(stops.length-1)*100}%">${headHtml}
         <strong class="tt221-leg-direction">${safe(l.dir)}</strong>${l.detail?`<span class="tt221-leg-note">${safe(l.detail)}</span>`:''}</div>`);
    });
    track.innerHTML=parts.join('');
  }
  pick.addEventListener('click',()=>{
    if(pick.disabled)return;
    const open=pickMenu.hidden;
    pickMenu.hidden=!open;pick.setAttribute('aria-expanded',String(open));
    if(open)pickMenu.querySelector('[aria-selected="true"]')?.focus();
  });
  document.addEventListener('pointerdown', e=>{if(!inside(e))closeMenu();});
  stage.addEventListener('keydown', e=>{if(e.key==='Escape' && !pickMenu.hidden){closeMenu();pick.focus();}});
  destinations.forEach((b,i)=>{
    b.querySelector('.daytrip-destination-button-name')?.replaceChildren(document.createTextNode(names[i]));
    // Once selected, another tap is not meant to collapse the entire screen.
    b.addEventListener('click',e=>{
      if(isDayTrips() && i===dest && b.getAttribute('aria-expanded')==='true'){
        e.preventDefault();e.stopImmediatePropagation();
      }
    },true);
    b.addEventListener('click',()=>requestAnimationFrame(()=>changeDestination(i)));
  });
  function sync(){
    if(!isDayTrips())return;
    let expanded=destinations.findIndex(b=>b.getAttribute('aria-expanded')==='true');
    if(expanded<0){destinations[0].click();expanded=0;}
    changeDestination(expanded);
    document.getElementById('guide')?.scrollTo({top:0,left:0,behavior:'instant'});
  }
  document.addEventListener('tt:viewchange',()=>requestAnimationFrame(sync));
  if(isDayTrips())sync();else {renderModes();render();}
})();
