/* TABI TAIPEI v2.0.19: presentation-only refinements for 06 遠出.
 * Use the existing route source/selection handlers; no route data is rewritten.
 * Reuse existing official train logos only when the displayed source line
 * explicitly refers to the operator. Do not introduce icons for bus routes.
 */
(() => {
  'use strict';
  const stages = [...document.querySelectorAll('#guide .tt2-trip-stage')];
  if (!stages.length) return;
  let scheduled = false;
  function adjust() {
    scheduled = false;
    if (document.documentElement.dataset.ttView !== 'day-trips') return;
    for (const stage of stages) {
      if (stage.hidden) continue;
      // Figma's spaced duration is typographic, not a modified fare/time value.
      const summary = stage.querySelector('.tt2-trip-summary');
      if (summary && summary.textContent) {
        const normalized = summary.textContent
          .replace(/約\s*(\d+)\s*[〜～~–-]\s*(\d+)\s*分/g, '約 $1 ～ $2 分');
        if (normalized !== summary.textContent) summary.textContent = normalized;
      }
      // Match the route direction's modest word separator in Figma 6-1-1.
      for (const label of stage.querySelectorAll('.tt2-route-direction')) {
        const normalized = label.textContent.replace(/([^\s　])方面$/, '$1　方面');
        if (normalized !== label.textContent) label.textContent = normalized;
      }
      for (const label of stage.querySelectorAll('.tt2-route-line-name')) {
        if (label.querySelector('.tt2-route-operator-logo')) continue;
        const raw = label.textContent.trim();
        let asset = '';
        let className = '';
        if (/台鉄|台鐵|臺鐵|台湾鉄路|台灣鐵路|台湾鐵路|台灣鉄路|TRA/i.test(raw)) {
          asset = 'assets/rail-logos/tra.svg';
          className = 'tt2-route-operator-logo';
        } else if (/台北捷運|臺北捷運|Taipei\s+Metro|(^|\s)MRT(\s|$)/i.test(raw)) {
          asset = 'assets/rail-logos/trtc.svg';
          className = 'tt2-route-operator-logo tt2-route-operator-logo--trtc';
        }
        if (!asset) continue;
        const logo = document.createElement('img');
        logo.src = asset;logo.alt = '';logo.setAttribute('aria-hidden','true');
        logo.width = asset.includes('trtc') ? 20 : 13;
        logo.height = asset.includes('trtc') ? 11 : 13;
        logo.className = className;
        label.prepend(logo);
      }
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(adjust);
  }
  const observer = new MutationObserver(schedule);
  for (const stage of stages) observer.observe(stage, {subtree:true,childList:true,characterData:true});
  document.addEventListener('tt:viewchange',schedule);
  schedule();
})();
