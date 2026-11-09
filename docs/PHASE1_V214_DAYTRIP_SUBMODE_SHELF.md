# TABI TAIPEI 2.0.14 / Daytrip submode shelf

## Scope
- Convert the second-layer transport mode selectors for **Jiufen** and **Shifen** into a shared horizontal button shelf.
- The shelf appears only after the destination is opened.
- The second-layer buttons visually match the destination-level buttons.
- Add downward reveal / collapse motion.
- Keep Keelung and Yehliu unchanged.

## Files changed
- `js/figma-daytrip-v213.js`
- `css/figma-daytrip-v213.css`

## Implementation notes
- Added a new enhancement IIFE that creates a shared `.tt2-submode-shelf` directly below `.daytrip-destination-buttons`.
- Jiufen submode buttons proxy the existing `.tt2-trip-mode` buttons created in v2.0.13.
- Shifen submode buttons proxy the native `.daytrip-transport-tab` buttons in `#daytrip-destination-panel-2`.
- Hidden the original visible Shifen transport tab row and the Jiufen internal top tab row, so only the new second-layer shelf is shown.
- The shelf opens only for destination index 0 (Jiufen) and 1 (Shifen), and collapses for Keelung / Yehliu or when leaving `day-trips`.

## Verification completed
- `node --check js/figma-daytrip-v213.js` passed.
- DOM/selector-level validation completed by static inspection.

## Not yet re-verified
- Chromium visual screenshot recapture in this environment.
- iPhone Safari real-device behavior.
- GitHub Pages deployed behavior.
