# TAIPEI CITY GUIDE 2.0 — v2.0.10.2 Mobile UI Fixes

Base: v2.0.10.1 full website ZIP. Scope: exactly four iPhone issues reported by the designer. Figma is not modified. No datasets, maps, calendar logic, menu logic, or destination links are changed.

## Changes
1. 撮影スポット: the legacy grid and CSS `order` inadvertently placed one of the subcategory buttons on a different row, clipped by a 40px-high container. Replaced **only this** selector with a fixed two-column flex row; left 映えスポット and right ロケ地・聖地巡礼 are visible and remain real accessible tabs.
2. イベント: removed native iOS button appearance from condition pills and filter trigger; forced Figma-authored **white fill and dark text**, 18px-high capsules, aligned X≈255–377px when date + city are selected, while preserving the original filter events and logic.
3. Dictionary swipe drawer: removed blur added after the panel finishes sliding, keeping the existing brightness/dimming behavior and functional drawer. Original script untouched.
4. Hamburger overlay: replaced 50% black dim with **20%**. The previous blur was **80px**, now **40px** (50% of previous blur strength; CSS blur has a pixel radius, not a percentage). Removed the opaque side menu background which previously concealed the blurred content. Kept the slide-in direction and staggered animations.

## Tested (local Chromium mobile simulation)
- 320 / 393 / 430 CSS px: both shooting subcategory tabs are on **exactly the same row**, visible within frame; switching between 14 映え spots and 13 filming locations works.
- イベント: city filter selection and clearing, date + city together with no chip overlap, and native calendar behavior remain intact.
- Hamburger: real click opens and closes overlay; CSS computed background rgba(0,0,0,0.2), blur(40px); menu is 300px wide on 393px screen.
- Dictionary swipe overlay (after settling): computed brightness(.68) without blur.
- No JavaScript page exceptions observed in these simulated interactions.
- All data/ and food/ files are byte-for-byte identical to the v2.0.10.1 base.

## Still requires real-device verification
- iPhone Safari/Web App: native viewport and button rendering, blur visual appearance and performance. Chromium's mobile simulation is not a substitute for Safari on actual iPhone.
- The underlying page is black on many chapters; a 20% darkening and blur will therefore still appear dark in those areas. The overlay is now transparent and no longer adds an opaque black panel.

## Deployment
- If you already deployed v2.0.10.1, unzip the *Patch* and replace only its files in-place; keep all other data and assets.
- The *Full* ZIP contains the complete GitHub Pages website. Changes `sw.js` cache namespace to v2.0.10.2 and versioned CSS URL to bypass older caches.
