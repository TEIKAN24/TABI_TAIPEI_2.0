# TABI TAIPEI 2.0 — v2.0.13｜固定分隔線與 06 遠出・九份

## Scope

- `css/infinite-category-wheel.css`: restore a stationary full-width 1px divider directly under the centered white gauge needle on the three user-approved infinite category wheels. The inertial JS and wheel behavior are **unchanged**.
- `css/figma-daytrip-v213.css`, `js/figma-daytrip-v213.js`: start the Figma-aligned 06 遠出 Jiufen screen based on frames `6-1`, `6-1-1`, `6-1-2` (393 × 852). The design is native, editable, accessible HTML and CSS, **not a screenshot**.
- `index.html`, `sw.js`: register new styling, controller and refresh the versioned offline cache.
- The project’s original place/food/event JSON, graphics and route modules remain untouched.

## Figma measurements and verified browser geometry (393 CSS px)

| Element | Figma reference | Browser v2.0.13 |
|:--|--:|--:|
| Site header bottom | Y=104 | Y=104 |
| 06 chapter row bottom | Y=138 | Y=138 |
| 4 destination options | Y≈138–183 | Y=138–184 |
| 3 Jiufen transport options | Y≈183–229 | Y=184–230 |
| Time/fare summary top | Y≈252 | Y=251 |
| Warning top | Y≈276 | Y=277 |
| Departure stop top | Y≈326 | Y=326 |
| Route line X | X≈75 | X=73–76 |
| Arrival stop top | Y≈594 | Y=593 |
| 965/1062 choice cards | Y≈642 | Y=643 |
| Footer divider | Y≈776 | Y≈777 |

## Behavior

Jiufen initial view defaults to original **965** route. Native source data supplies visible travel time, fare, leg names, and selected source stops, via `.daytrip-destination-panel` and `.daytrip-transport` DOM. The new controls call existing original buttons to keep the original state in sync. Verified:

- 直通バス: 965 → 1062; both rendered and original `aria-pressed` states update together; fare and departure label change.
- 台鉄＋乗換: origin, 瑞芳 transfer, bus 788/827 or taxi, arrival; the two subroutes keep their original time and fare estimates.
- 十分から九份: existing taxi itinerary and its existing source estimate; no fake alternative buttons.
- Selecting an already-open 九份 tab does not collapse its screen to a blank state.
- Switching Jiufen → 十分 → Jiufen reopens Jiufen with the original first mode; no stale selection.
- Destination buttons to 十分 / 基隆 / 野柳 retain their original independent panels. The latter three screens are **not Figma-port-complete** in this version.
- New line-growth animation uses CSS and respects `prefers-reduced-motion`.
- No new transportation API or changes to source schedules/fares; information is the existing site's recorded estimates, not live arrival data.

## QA

- 320, 393, 430 CSS px in Chromium with mobile viewport and touch emulation: Jiufen opens at the top of the chapter, 4 destination options occupy the full width, route stage aligns with Figma, no page script exception, normal body height=viewport height.
- 393 CSS px: 965 / 1062, rail+bus, rail+taxi, Shifen-to-Jiufen, return from a different destination, idempotent current destination tap, all pass in deterministic browser tests.
- 393 CSS px: all three infinite-category wheels retain their fixed short white needle, with the new divider as `::after` 1 px horizontal line; measured wheel Y=138–184, line Y=183, notch Y=174–184. The wheel JS physics file is unchanged.
- Regression: no modifications to any `data/`, `food/`, original assets, guide.js, events, map JS or saved venue lists. Original side-menu order remains 03 散策 then 04 観光.

## Outstanding

- This is an initial Jiufen Figma migration; exact typography depends on device-installed fonts. Not a full-device Pixel-perfect guarantee.
- The three other destinations keep the original interface; migrate them in later stages without replacing their data.
- The new browser route has not been tested on physical iPhone Safari or an actual GitHub Pages deployment. Browser touch and screenshots are **simulations**.
- Information estimates are copied from the existing site; no claim of real-time travel or updated operating fares.
