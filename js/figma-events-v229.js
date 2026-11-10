/* TABI TAIPEI v2.0.29 — イベント: 「条件を指定」button (replaces figma-events-v207.js, which
   was empty, and figma-events-v209.js). js/events.js still owns the filter state: this only
   adds a visible trigger that clicks the count button, and closes the panel after a choice.
   With conditions set, CSS turns the button into a round「＋」at the end of the chips. */
(()=>{'use strict';
  const root=document.getElementById('event-calendar');
  if(!root)return;
  const label=()=>root.querySelector('.ec-chips .ec-chip')?'条件を追加・変更':'イベントの条件を指定';
  const ensure=()=>{
    const summary=root.querySelector('.ec-summary');
    if(!summary)return;
    let button=summary.querySelector('.ec-condition-open');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='ec-condition-open';
      button.textContent='条件を指定';
      button.setAttribute('aria-controls','ec-filter-panel');
      button.addEventListener('click',()=>summary.querySelector('.ec-sum-total')?.click());
      summary.appendChild(button);
    }
    button.setAttribute('aria-label',label());
  };
  const summary=root.querySelector('.ec-summary');
  if(!summary)return;
  new MutationObserver(ensure).observe(summary,{childList:true});
  const chips=root.querySelector('.ec-chips');
  if(chips)new MutationObserver(ensure).observe(chips,{childList:true});
  ensure();
  // After choosing one option, go back to the compact chips (Figma 4-3-3).
  root.querySelector('.ec-filter-panel')?.addEventListener('click',ev=>{
    if(!ev.target.closest('.ec-option'))return;
    queueMicrotask(()=>{
      const panel=root.querySelector('.ec-filter-panel');
      if(panel&&!panel.hidden)root.querySelector('.ec-sum-total')?.click();
    });
  });
})();
