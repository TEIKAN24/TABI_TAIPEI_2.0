/* TABI TAIPEI • screen navigation for the first-wave test build.
 * Keep original nodes, script instances and JSON in the document. Switching the
 * view only hides sibling chapter blocks; it does not replace innerHTML or
 * reinitialize map/calendar/routing modules. GitHub Pages-safe hash routes.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const hero = document.getElementById('top');
  const main = document.getElementById('guide');
  const body = main?.querySelector(':scope > .page-body');
  if (!hero || !main || !body) return;
  const screens = new Set(['home','travel','food','sights','city-walk','experiences','souvenirs','day-trips','emergency']);
  const legacy = {
    top:'home', travel:'travel', food:'food', sights:'sights',
    'city-walk':'city-walk', 'night-markets':'city-walk', areas:'city-walk',
    experiences:'experiences', 'experience-souvenirs':'experiences',
    souvenirs:'souvenirs', 'day-trips':'day-trips',
    'airport-route-selector':'travel'
  };
  // Capture the original document children once. Do not reparent anything:
  // older CSS selects .page-body > details, and module listeners rely on them.
  const mainChildren = Array.from(main.children);
  const travelChildren = Array.from(body.children);
  const visibleSets = {
    sights: mainChildren.slice(2,11),
    'city-walk': mainChildren.slice(11,21),
    experiences: mainChildren.slice(21,29),
    souvenirs: mainChildren.slice(29,32),
    'day-trips': mainChildren.slice(32,39),
    emergency: mainChildren.slice(39,44),
    travel: travelChildren.slice(0,11),
    food: travelChildren.slice(11)
  };
  const allRoutedMain = mainChildren.slice(2,44);
  const allRoutedBody = travelChildren;
  const navigation = document.querySelectorAll('[data-tt-target], .tt-brand');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let view = 'home';
  let lastChange = 0;
  const parse = () => {
    let h;
    try { h = decodeURIComponent(location.hash.replace(/^#/,'')); } catch { h = location.hash.replace(/^#/,''); }
    if (h.startsWith('view/')) h = h.slice(5).split('/')[0];
    return screens.has(h) ? h : (legacy[h] || 'home');
  };
  function activateChapterDetails(next) {
    // Leave legacy details, map, calendar and route controls untouched. Only
    // show the destination's existing directory/accordion root if collapsed.
    if (next === 'experiences' || next === 'souvenirs') {
      const marker = document.getElementById(next);
      const list = document.getElementById(next === 'experiences'
        ? '3f76bda0-4caa-80d2-8841-c76e1f8f749a'
        : '3f66bda0-4caa-8038-8328-e8b12e95336f');
      if (list instanceof HTMLDetailsElement) list.open = true;
    }
    if (next === 'travel') {
      const tabs = document.querySelector('[data-tt-travel-tab="notes"]');
      if (tabs?.getAttribute('aria-selected') !== 'true') tabs?.click();
    }
  }
  function show(next, opts = {}) {
    if (!screens.has(next)) next = 'home';
    const isHome = next === 'home';
    root.classList.toggle('tt-route-home', isHome);
    root.classList.toggle('tt-route-chapter', !isHome);
    root.dataset.ttView = next;
    hero.classList.toggle('tt-view-hidden', !isHome);
    main.classList.toggle('tt-view-hidden', isHome);
    const pageBodyVisible = next === 'travel' || next === 'food';
    body.classList.toggle('tt-view-hidden', !pageBodyVisible);
    for (const node of allRoutedMain) node.classList.toggle('tt-view-hidden', !visibleSets[next]?.includes(node));
    for (const node of allRoutedBody) node.classList.toggle('tt-view-hidden', !visibleSets[next]?.includes(node));
    root.classList.toggle('tt-at-home', isHome);
    document.querySelectorAll('.tt-home-item, .tt-side-link').forEach(link => {
      const active = link.dataset.ttTarget === next;
      if (active) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    if (view !== next || opts.force) {
      view = next;
      activateChapterDetails(next);
      window.scrollTo({top:0,behavior:'auto'});
      // Modules such as SVG maps remeasure when their view becomes visible.
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
        document.dispatchEvent(new CustomEvent('tt:viewchange',{detail:{view:next}}));
        setTimeout(() => window.dispatchEvent(new Event('resize')), 180);
      });
    }
  }
  function go(next, replace=false) {
    if (!screens.has(next)) return;
    const hash = next === 'home' ? '#view/home' : '#view/'+next;
    if (location.hash !== hash) {
      if (replace) location.replace(hash); else location.hash = hash;
    }
    show(next);
  }
  document.addEventListener('click', e => {
    const link = e.target.closest?.('[data-tt-target], .tt-brand');
    if (!link) return;
    const raw = link.classList.contains('tt-brand') ? 'home' : link.dataset.ttTarget;
    const next = legacy[raw] || raw;
    if (!screens.has(next)) return;
    // Capture to prevent original one-page scrolling/navigation listeners.
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const menuToggle = document.getElementById('tt-menu-toggle');
    if (root.classList.contains('tt-nav-open')) menuToggle?.click();
    go(next);
  }, true);
  addEventListener('popstate', () => show(parse(),{force:true}));
  addEventListener('hashchange', () => show(parse(),{force:true}));
  // Existing guide scripts may initialize using a legacy deep link. Preserve
  // its destination but canonicalize subsequent navigations to #view/*.
  show(parse(),{force:true});
})();
