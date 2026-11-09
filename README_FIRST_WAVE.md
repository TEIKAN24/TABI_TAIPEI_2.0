# TABI TAIPEI — First-wave redesign (test build)

Source baseline: user-provided `Tabi_Taipei-main(6).zip` (2026-11-09). This build is intended for a **new GitHub Pages test repository**, not for overwriting the production site.

## Changes in this build

- A new seven-chapter mobile home screen, header and off-canvas navigation inspired by the TABI-TAIPEI Figma screens.
- Right-hand, 300 px sliding navigation. Hamburger lines transform in place. The backdrop dims 50% and blurs at 80 px. Seven chapter names start 0.3 s apart, with roughly 1 s fade/movement per item; their number and line animations are staggered separately.
- A new common section-heading presentation, and three-tab Travel / `旅支度` interface built on the existing details markup. Existing accordion content and semantics remain in place.
- CSS `prefers-reduced-motion` support, overlay keyboard Escape, and basic focus management.
- Service worker cache version is isolated for this test build. Its precache includes the new CSS and JS files.

## New: view-based navigation (v1.1)

The former continuous long-scroll navigation is replaced with a **single-document screen router**. Home and all seven chapters display as separate screens via `#view/home`, `#view/travel`, `#view/food`, `#view/city-walk`, `#view/sights`, `#view/experiences`, `#view/day-trips`, and `#view/souvenirs`. Browser back/forward and direct hash links are supported. The original HTML, dataset, event handlers and map/calendar/route engine objects stay in memory; the router toggles visibility on their existing blocks rather than cloning or fetching entire page documents. This is intentionally more conservative than physically splitting the app into eight HTML files.

`js/view-router.js` is a new additional file. It intercepts the redesigned home and side-menu navigation in capture phase before legacy one-page scroll handlers; the original JavaScript modules are **unchanged**. `css/first-wave.css` adds screen-level visibility and a restrained chapter entrance transition. Service Worker precache and cache ID have been updated for the new router. Legacy direct anchors (#travel, #city-walk etc.) are accepted when opening a link, while new links are `#view/*`.

**Testing status:** Browser-based simulated interactions verified homepage → travel → sights, back to travel, night-market map DOM, experiences, souvenirs, day trips and food. Offline Chromium confirmed no new JavaScript errors after fixing numeric-leading IDs in the router. This is not a Safari real-device test. Modules which measure hidden containers may need an iPhone reflow/timing check when opening their screen, despite the router dispatching resize events.

## Function preservation policy

All pre-existing data files, maps, calendars, route visuals and original JavaScript/CSS modules are byte-identical to those in the supplied baseline. The new interface lives in `css/first-wave.css`, `js/first-wave.js` and `js/view-router.js`; the original code is still included and executed. The `index.html` adds wrappers, nav controls and stylesheet/script references without removing old functional sections.

No visual redesign was attempted for the restaurant recommender, food search tool or airport-access content. They continue to use their original modules/UI.

## Test results and limitations

Offline Chromium DOM-based smoke tests (393 px viewport) confirmed: pages parsed without JS errors; 62 sight list entries loaded in the selected directory test; the event calendar displayed 11 event cards when opened; night-market maps created SVG paths; route structures remained available; six chapter navigation actions were exercised. See below for limitations.

- The test harness injects local CSS/JS and data into an offline Chromium page because local file/URL loading is blocked in the testing environment. These are **simulation checks**, not a published GitHub Pages or real iPhone Safari acceptance test.
- Location permissions, third-party Google Maps links, live external data, offline Service Worker installation, and all map/route interaction timing were **not** tested in a real deployment.
- **Known review item:** later sections (especially `体験` and `おみやげ`) can settle at an imperfect scroll offset when an older expansion animation concurrently changes document height. Function links are wired, but final scroll positioning needs Safari testing / further refinement.
- The original Adobe/A-SK fonts used in Figma are **not embedded** in this build. Site typography uses a legally safer platform/Japanese serif fallback. Exact fidelity requires the user's appropriate licensed web-font assets.
- The 80 px large-area blur is intentionally retained from the Figma specification but may need reducing on older phones after performance testing.

## Deploy to a fresh GitHub repository

1. Create a new GitHub repository. Upload the **contents inside this ZIP directly to the repository root**, including `index.html`, `css/`, `js/`, `data/`, `food/`, `assets/`, and `sw.js`. Do not nest all files under a second `Tabi_Taipei-main` directory.
2. In repository Settings → Pages, set Source to `Deploy from a branch`, choose `main` and `/ (root)` (or your preferred deployment workflow).
3. Open the new Pages URL on iPhone Safari, test night-market/city-walk maps, calendar month changes, route drawing, and seven chapter links in both dark/light modes.
4. Do not point existing production Pages to this test repository before approval.

## Next step

Use the new repository URL to compare actual Safari behavior against the Figma prototype and fix any differences, before replacing additional chapters. The functional modules may be refactored later, but their existing data interfaces should first be regression-tested.
