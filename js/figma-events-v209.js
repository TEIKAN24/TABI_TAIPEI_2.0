/* TABI TAIPEI v2.0.9: Accessible filter capsule, no calendar/filter-data rewrite.
   The native js/events.js count button still owns filter state. */
(()=>{'use strict';
  const root=document.getElementById('event-calendar');
  if(!root)return;
  const ensure=()=>{
    const summary=root.querySelector('.ec-summary');
    if(!summary||summary.querySelector('.ec-condition-open'))return;
    const button=document.createElement('button');
    button.type='button';
    button.className='ec-condition-open';
    button.textContent='条件を指定';
    button.setAttribute('aria-label','イベントの条件を指定');
    button.setAttribute('aria-controls','ec-filter-panel');
    button.addEventListener('click',()=>summary.querySelector('.ec-sum-total')?.click());
    summary.appendChild(button);
  };
  const summary=root.querySelector('.ec-summary');
  if(!summary)return;
  new MutationObserver(ensure).observe(summary,{childList:true});
  ensure();
  /* After choosing one filter, return to the compact pills shown in 4-3-3.
     Delegate the actual filter change to untouched js/events.js. */
  root.querySelector('.ec-filter-panel')?.addEventListener('click',ev=>{
    if(!ev.target.closest('.ec-option'))return;
    queueMicrotask(()=>{
      const panel=root.querySelector('.ec-filter-panel');
      if(panel&&!panel.hidden)root.querySelector('.ec-sum-total')?.click();
    });
  });
})();