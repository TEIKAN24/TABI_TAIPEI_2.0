/* TABI-TAIPEI v2.0.7 — exact Figma 4-2 presentation for 撮影スポット.
   This script only enhances the rendered, ORIGINAL data/sights.json rows.
   All fourteen popular places, their links and source tags remain in the DOM.
   No demonstration data or screenshots are used. */
(() => {
  'use strict';
  const section = document.querySelector('[data-tt2-panel-key="photo"]');
  if (!section || !window.tabiDirectoryReady) return;
  const figmaCopy = new Map([
    ['象山',{name:'象山自然歩道',caption:'台北101を大きく捉え、市街地の夜景を一望できる。'}],
    ['竹村居酒屋',{name:'竹村居酒屋',caption:'赤い提灯と台北101が重なる夜景スポット。'}],
    ['波士頓理髮廳',{name:'波士頓理髮廳',caption:'レトロな看板と緑のタイルが印象的。'}],
    ['四四南村',{name:'四四南村',caption:'昔ながらの家並みと台北101の対比が魅力。'}]
  ]);
  const displayOrder=['象山','竹村居酒屋','波士頓理髮廳','四四南村'];
  const popularId='photo-spots-popular';
  function enhance() {
    const tab=section.querySelector('.tab');
    const popular=section.querySelector('#'+popularId);
    const list=popular?.querySelector('ol.venue-directory-list');
    if (!tab || !list || list.dataset.tt2Photo==='1') return;
    const rows=[...list.querySelectorAll(':scope > li.venue-list-item')];
    if (!rows.length) return;
    rows.forEach(row=>{
      const a=row.querySelector('a.venue-main-link');
      if (!a) return;
      const sourceName=a.textContent.trim();
      row.classList.add('tt2-photo-row');
      row.dataset.tt2OriginalName=sourceName;
      const info=figmaCopy.get(sourceName);
      if (!info) return;
      const ja=document.createElement('span');ja.className='tt2-photo-ja';ja.lang='ja';ja.textContent=info.name;
      const desc=document.createElement('span');desc.className='tt2-photo-desc';desc.lang='ja';desc.textContent=info.caption;
      a.replaceChildren(ja,desc);
      a.setAttribute('title',sourceName);
    });
    const ordered=rows.map((row,i)=>({row,i,rank:displayOrder.indexOf(row.dataset.tt2OriginalName)}))
      .sort((a,b)=>(a.rank<0?100+a.i:a.rank)-(b.rank<0?100+b.i:b.rank));
    list.replaceChildren(...ordered.map(x=>x.row));
    const pills=tab.querySelector('.tab-pills');
    const popularButton=pills?.querySelector('[aria-controls="'+popularId+'"]');
    if (popularButton) {
      // The designer's 4-2 first visible category is 映えスポット.
      // Keep original DOM order: guide.js binds tab indices at startup.
      // CSS alone swaps the VISUAL order, without mismatching ARIA/panels.
      // Reuse the site's existing tab controller, keyboard behavior and ARIA.
      if (popularButton.getAttribute('aria-selected')!=='true') popularButton.click();
    }
    if (!tab.querySelector('.tt2-photo-count')) {
      const count=document.createElement('div');count.className='tt2-photo-count';
      count.textContent='掲載 '+rows.length+'件';
      const container=tab.querySelector('.tab-panels');
      container?.prepend(count);
    }
    list.dataset.tt2Photo='1';
  }
  Promise.resolve(window.tabiDirectoryReady).then(enhance);
})();
