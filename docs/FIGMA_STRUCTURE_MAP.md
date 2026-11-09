# TAIPEI CITY GUIDE 2.0 — Figma／網站結構與功能對應

基準：2026-11-09，Figma `812CfgRgeCk9DN7bvmKEmg`，Page `1:65`，393 × 852 px。原始功能／資料由使用者的 `Tabi_Taipei-main(6).zip` 與其後第一波 v1.2 相容層保留。**只讀取 Figma，沒有修改設計檔。**

## Figma → 網站路由／內容

| Figma node | 畫面 | 網站路由／控制 | 第一階段 |
|---|---|---|---|
| `68:1680` | Opening Screen | 原有 Opening/intro 動作 | 未重新製作；原稿內容不當作畫面圖片 |
| `1:408` | Title／七大章節 | `#view/home` → 七個原生 `<a>` | **已製作 HTML/CSS；字體精準度未通過** |
| `67:1170`, `76:396`–`78:396`, `89:*`, `94:*` | side + 展開／收合中介狀態 | 共用 HTML 側選單、CSS stagger 動畫；原有 `js/first-wave.js` | **已沿用並校正，視覺仍待外框字** |
| `56:278` | 1-1 注意事項收合 | `#view/travel` 的 Notes tab | **已完成 7 組原生 `<details>`** |
| `33:182`, `63:291`, `63:384`, `63:477`, `63:570`, `63:663`, `63:756` | 1-1 七組個別展開狀態 | 同一套動態 Accordion，箭頭旋轉45° | **已完成** |
| `1:146` | 1-2 入国カード | `#view/travel` 的 TWAC tab | **已完成，官方連結沿用原站** |
| `1:197` | 1-3 交通パス | `#view/travel` 的 Pass tab | **已完成首屏的兩項；原站第三項在首屏下方** |
| `1:260`, `1:476`, `68:1384` | 2-1、2-2 味わい／推薦器／列表 | `#view/food`, `js/recommend.js`, `food/nearby.json` | 原站功能保留；新版 Figma 尚未逐畫面還原 |
| `1:630`, `1:760` | 3-1 夜市、3-2 街歩き | `#view/city-walk`, `js/night-markets.js`, `js/area-map.js` | 原站地圖引擎與資料保留；視覺待第二階段 |
| `1:664`, `1:794`, `1:913`, `1:998`, `1:1172`, `1:1352` | 4-1～4-3 觀光、攝影、イベント | `#view/sights`, `js/directory.js`, `js/events.js` | 內容與月曆原版保留；新版視覺待施工 |
| `1:1544` | 5-1 体験 | `#view/experiences`, `data/experiences.json` | 保留舊功能 |
| `44:315`, `47:942`, `44:516` | 6-1／6-1-1／6-1-2 遠出 | `#view/day-trips`, `js/daytrip-scenes.js`, `js/guide.js` | 原路線與動畫保留；視覺待施工 |
| `1:1639`, `47:678` | 7-1 おみやげ | `#view/souvenirs`, `data/souvenirs.json` | 保留舊功能 |

## Prototype 連線調查

- `Title` 具有七個章節跳轉與一個側選單按鈕；品牌字在章節頁返回 `Title`。
- `1-1` 的七組展開狀態透過 Smart Animate 切換，已改用一套可維護的原生 Accordion，而不是建立七份 HTML 頁面。
- `1-2`／`1-3` 的 tab 互跳在網站內改用三個可存取的 HTML `button`，不重載資料。
- 全站導覽 `side` 按鈕為共用元件，網站使用一個 Overlay DOM 與原本的側選單動畫。
- **原稿內部差異待確認：** `Title` 首頁第 03／04 章是「散策／観光」，但 `side` 畫面第 03／04 項是「観光／散策」。兩種位置和編號分別依 Figma 原稿呈現，未擅自統一。

## 原站功能與資料模組

- GPS／推薦／附近距離：`js/recommend.js`、`food/nearby.json`、`food/mrt_stations.json`；**未改寫**。
- 餐點字典：`food/foods.csv`、`food/synonyms.json`、`food/market_items.csv`；**未改寫**。
- 觀光／體驗／伴手禮：`js/directory.js`、`data/sights.json`、`data/experiences.json`、`data/souvenirs.json`；**未改寫**。
- 夜市與街歩き地圖：`js/night-markets.js`、`js/area-map.js`、`data/night-market-map.js`、`data/night-market-metro.js`、`data/areas.js`；**未改寫**。
- イベント月曆：`js/events.js`、`data/events.js`；**未改寫**。
- 遠出交通與路線動畫：`js/guide.js`、`js/daytrip-scenes.js` 及 `assets/daytrips/`；**未改寫**。
- 頁面導航相容：保留 v1.2 `js/view-router.js`、`js/view-lifecycle.js`；第一階段新增 `js/figma-stage1.js`、`css/figma-stage1.css`。

## 網站結構

網址使用 `#view/home`、`#view/travel`、`#view/food` 等畫面狀態，瀏覽器返回鍵正常。共用的 HTML 功能模組仍保持原 DOM 節點，不拆成七個會重載的 HTML 文件。不同 Figma 畫面可由同一個 HTML 容器的狀態切換實現。
