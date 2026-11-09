/* v2.0.7 — Figma 4-3-1 opens with the existing calendar's HEATMAP face.
 * Use the original calendar's keyboard action; do not rebuild dates, data,
 * month carousel, filters, link destinations, or time-based statuses.
 * Users can still tap the central month card to switch back to bars. */
(() => {
 'use strict';
 const section=document.querySelector('[data-tt2-panel-key="event"]');
 if (!section) return;
 const root=section.querySelector('#event-calendar');
 if (!root) return;
 let timer=0;
 function align(){
   if (document.documentElement.dataset.ttView!=='sights' || !section.open || !section.classList.contains('tt2-panel-current')) return;
   const scroll=root.querySelector('.ec-scroller');
   const cards=root.querySelectorAll('.ec-card');
   if (!scroll || !cards.length || root.classList.contains('is-heat')) return;
   scroll.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
 }
 function schedule(){clearTimeout(timer);timer=setTimeout(align,140);}
 section.addEventListener('toggle', schedule);
 document.addEventListener('tt:panelchange',schedule);
 document.addEventListener('tt:viewchange',schedule);
 schedule();
})();
