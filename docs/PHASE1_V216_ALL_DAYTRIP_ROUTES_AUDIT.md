# TABI TAIPEI 2.0.16 — 遠出 four-route visual hierarchy

## Scope

- Keep **遠出** a fixed-height screen with no chapter-level vertical scroll.
- Preserve Jiufen route display and the 2.0.15 underline transport tabs.
- Rebuild **十分**, **基隆**, **野柳** in Jiufen's data hierarchy: summary (time/fare), source-derived caution, timeline with departure/transfer/arrival, route-leg annotations, optional supplementary details.
- 十分: 台鉄 → 瑞芳乗換 → 十分駅; alternative 九份から十分 taxi.
- 基隆: 台鉄 → 基隆駅; details preserve existing highlights and market/food links.
- 野柳: 1815 from 台北駅, 790 from 基隆駅; choices share the new underline second-tier navigation.
- Detail panels alone may scroll; main chapter never scrolls.
- Remove the bottom ornamental rule, keeping the destination/transport navigation rules.
- Original source DOM, route pricing, source URLs, original databases and assets unchanged.

## Verified

- 320px, 393px and 430px mobile Chromium simulations: destination switching, mode labels, summary data, source route selection, no chapter scroll and no unintended 16px lateral offset.
- 393/430px final tests: Jiufen-to-Shifen/Keelung/Yehliu transition, timeline nodes and routes, full source-derived Keelung details; 1815 ⇄ 790 updates original source buttons and displayed fare.
- 393px screenshots captured after animations completed (1250+ms); route leg opacity = 1.
- No observed JavaScript page exceptions in these simulation runs.
- Syntax validated with node --check.

## Limits

- Not verified on physical iPhone Safari or on deployed GitHub Pages.
- Exact Figma pixel calibration for the new three destination layouts remains a separate review; their screen layout adapts the known Jiufen Figma hierarchy and only pre-existing transport facts.
- Route alternatives not present in the original source are deliberately not invented.
