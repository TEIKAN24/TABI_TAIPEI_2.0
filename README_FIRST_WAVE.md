# TABI TAIPEI — First-wave redesign, navigation compatibility v1.2

**Update package:** Apply this patch on top of `TABI_TAIPEI_first_wave_screen_navigation_v1_1.zip` (or a GitHub Pages test repository already deployed from that release). Overwrite the same paths; add `js/view-lifecycle.js`. Keep every other file as it is.

**Source baseline:** User-provided stable `Tabi_Taipei-main(6).zip` → first-wave UI v1.0 → screen-navigation v1.1 → this v1.2 compatibility update.

## Changes in v1.2

1. `js/view-router.js`: Replaced brittle child-index screen routing with semantic chapter anchors and divider boundaries. Original DOM nodes, event handlers, and all original functional modules remain in place. Browser back/forward and `#view/*` continue to work.
2. `js/view-lifecycle.js` **(new)**: After a screen is made visible, notifies original map and calendar layouts to remeasure. On leaving `day-trips`, clears the route timeline's played-once flag so the existing animation can run again on a later visit. Original route code is untouched.
3. `index.html`: Loads `view-lifecycle.js` before `view-router.js`, and bumps the router cache-busting query parameter.
4. `sw.js`: Adds new lifecycle file to offline precache and changes the test cache version to prevent stale scripts after deploying.
5. Existing `data/`, `food/`, `assets/`, `js/night-markets.js`, `js/area-map.js`, `js/events.js`, `js/guide.js`, and other stable feature code are **unchanged**.

## Verified in offline Chromium simulation

- 393 px: Home → `観光`; event calendar creates 11 month cards and 85 list rows, and its month scroller moves on interaction.
- 393 px: Home → `散策`; night-market map creates 32 pins and has a measured viewport of 359 × 618 px. Native city-walk tabs switch the **same map instance** from `夜市` to `街歩きエリア` and back, retaining its measured geometry.
- Leaving and re-entering the city-walk screen while the area map is active retains the map at 359 × 618 px, without reinitializing its data.
- `遠出`: 10 route timeline elements remain present; selecting a destination triggers the pre-existing route timeline animation (`data-daytrip-played=true`). Leaving the screen resets this marker, so a later visit can play the animation again.
- Screen view switching and no horizontal overflow checked at 320 px dark, 393 px dark, and 430 px light. Browser back/forward also verified.
- No JavaScript page errors in the scenarios above.

**Limitations:** Tests execute the original code/data in an offline Chromium environment, with local map and CSV/JSON assets supplied. Not a GitHub Pages deployment or a real iPhone Safari test. GPS location, live network URLs, Google Maps navigation, service-worker installation in the browser, and touch/pinch/route performance still need real-device verification. Do not assume Safari rendering is approved.

## Deploy only the modified files

Upload these four production files to the root of the existing **v1.1 test repository**, preserving their relative folders:

- `index.html` (overwrite)
- `sw.js` (overwrite)
- `js/view-router.js` (overwrite)
- `js/view-lifecycle.js` (new)

This update package intentionally does not include old assets, data, or fonts. For a fresh repository, first install the full v1.1 release, then apply this v1.2 patch. On the test site, reload once after GitHub Pages deployment so the new service worker/cache can take effect.

## Next design work

After iPhone Safari verifies the menu, maps, calendar, and route animation across navigation changes, proceed with the visual replacement of `観光` and `散策` subsections against the Figma screens. Keep the unredesigned restaurant search and airport access components unchanged.
