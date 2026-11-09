# 2.0.2｜原始 SVG 字體外框導入與驗證

來源：使用者提供 `文字SVG(1).zip`；導入方式：保留原始 SVG byte，不重繪、不轉成 bitmap。

## 原始素材與用途

- `assets/figma/outlines/home/`：7 個首頁直式字形，原始 SVG 尺寸各異（49–59 px 寬，55–104 px 高）。
- `assets/figma/outlines/side/`：7 個側邊選單橫式字形（87–177 px 寬，40–43 px 高），加上 `料理検索`、`空港アクセス` 兩個小標題。
- `assets/figma/outlines/brand/`：白色 `TABI TAIPEI` 112×16 與薄荷綠 `TAIPEI CITY GUIDE` 55×16。
- `manifest.json`：完整原始路徑、viewBox、尺寸、path 數量及 SHA-256。

**注意：兩個 LOGO 的原 ZIP 檔名與它們實際繪製內容相反**，此處依 SVG 可見內容正確命名，不改變圖形 path。

## HTML 實作

- 7 個首頁連結與 7 個側邊選單連結仍然是 `<a>`，原本的日文文字也保留在 HTML 中。特殊字形另由語義隱藏的 `<img alt="" aria-hidden="true">` 顯示。
- 與螢幕閱讀器相容：14 個章節 `<a>` 均有明確 `aria-label`，原本焦點、click handlers、hash router 及側選單動畫不變。
- 兩個 Logo 仍在 HTML 連結內，不使用整頁圖片。
- 所有 SVG 的 width、height 使用原設計原始輸出尺寸；CSS 只控制父層的排版位置，沒有改描圖 path。
- `css/figma-outlines.css` 僅覆蓋先前因缺字體而使用的字形壓縮、拉伸處理。

## 靜態驗證

{
  "svg_count": 18,
  "native_home_links": 7,
  "native_side_links": 7,
  "referenced_svg_count": 18,
  "svg_paths_total": 71,
  "data_food_files_verified": 15,
  "data_food_differences": [],
  "original_legacy_modules": [
    {
      "path": "js/guide.js",
      "matches_original_stable": true
    },
    {
      "path": "js/recommend.js",
      "matches_original_stable": true
    },
    {
      "path": "js/area-map.js",
      "matches_original_stable": true
    },
    {
      "path": "js/night-markets.js",
      "matches_original_stable": true
    },
    {
      "path": "js/events.js",
      "matches_original_stable": true
    },
    {
      "path": "js/daytrip-scenes.js",
      "matches_original_stable": true
    },
    {
      "path": "js/directory.js",
      "matches_original_stable": true
    }
  ],
  "web_browser_screenshot": "not run in this container: navigation blocked by admin",
  "iPhone_Safari": "not tested"
}

## 尚未完成

- 此輪容器的 Chromium 導航在 `http://localhost`、`file:`、`data:` 都出現 `ERR_BLOCKED_BY_ADMINISTRATOR`，因此**沒有新生成的 393×852 網站截圖、也尚未完成 Figma 逐像素疊圖比較**；`docs/verification/` 既有 PNG 是導入 SVG 以前的第一階段截圖，不能拿來當本版驗收。
- `01 旅支度` 一類的內頁小型章節標題、編號、正文及卡片的 Figma 特定商業字體沒有包含在這次 ZIP，仍有 fallback 字體差異。
- 真正 iPhone Safari、PWA Safe Area、深色模式與低效能裝置的模糊動畫須部署後確認。
