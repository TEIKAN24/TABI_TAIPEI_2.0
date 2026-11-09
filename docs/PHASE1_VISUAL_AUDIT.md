# 第一階段｜393 × 852 視覺差異檢查

來源：Figma `1:408`、`56:278`、`1:146`、`1:197`、`67:1170`、`78:396`；網站使用無 DevTools 調整的 Chromium 393 × 852 CSS px 截圖，存於 `docs/verification/`。

**注意：已完成 Figma API 座標對照與網站截圖的視覺檢查；未完成原始 Figma PNG 與網站 PNG 的逐像素透明疊圖／影像誤差數值。原因是 Figma 圖片在本次容器環境只返回短效權限網址，未能轉存為本地比對檔。不可因此聲稱 Pixel-perfect 已驗收。**

| 元素 | Figma 原稿 | 網站 393px 量測 | 差異與狀態 |
|---|---:|---:|---|
| 旅支度頂部分隔線起點 X | 16.18 px | 16.18 px | 約 0 px |
| 標題列下線 Y | 137.64 px | 138 px | +0.36 px |
| 第一分類直線 X | 127.77 px | 127.75 px | −0.02 px |
| 第二分類直線 X | 265.13 px | 265.13 px | 約 0 px |
| 分類下線 Y | 183.05 px | 183 px | −0.05 px |
| 第一事項文字左 X | 45.50 px | 45.70 px | +0.20 px |
| 第一事項文字頂 Y | 220.50 px | 220.50 px | 約 0 px（字形墨跡仍不同） |
| 底部分隔線起點 X | 25.72 px | 25.70 px | −0.02 px |
| 底部分隔線終點 X | 369.90 px | 369.89 px | −0.01 px |
| 底部分隔線 Y | 776.04 px | 776 px | −0.04 px |
| 右側選單最終左 X | 93 px（393 − 300） | 93 px | 0 px |
| 背景遮罩 | 黑色 50%＋Blur 80 px | CSS 50%＋`backdrop-filter:blur(80px)` | 參數一致，渲染引擎仍可能有差 |

### 已經接近一致

- 旅支度三個分頁的水平尺寸、上下分隔線與七個注意事項的定位。
- TWAC 頁的兩行介紹、官方網站按鈕與必要資料的區塊位置。
- 交通票券頁的前兩項可用原生 HTML 及外部連結操作；原網站第三項 `TR-PASS` 不刪除，放在 852px 首屏下方。
- 首頁使用七個真正的 HTML `<a>`，以 Figma 的網格起點、欄線與章節次序定位；側邊選單使用真正的 HTML 連結和動畫。

### 未通過／需要修正（不可掩飾）

1. **原始字體／外框素材（v2.0.2 更新）**：首頁七章、側邊選單七章、主／副 Logo 和兩個輔助入口已使用使用者提供的 18 個原始 SVG 外框；其他正文、編號、章節小標尚受部分字體缺失影響。先前首階段記載如下，**已由原始 SVG 部分解決**：Figma 讀取到 `A P-OTF Kasumi Seiran Min2`、`A P-SK IshiiMincho Old StdN`、`A P-OTF UD Shin Go Pr6N` 與 `lithue-1.1` 均為缺字體狀態。原稿存在 SVG 字形外框，但在此環境無法將該權限素材下載到網站工作目錄。第一階段使用可編輯 HTML 文字和 `Noto Serif CJK JP` 備援，字重、筆畫、字寬尚非 100% 一致。
2. **首頁顏色漸層**：以 CSS 漸層對照 Figma 畫面，目前肉眼接近；尚未取得原 Illustrator SVG 特殊裝飾的可部署原檔，因此未量化像素差異。
3. **iPhone Safari**：尚未進行 Safari 的實機字形、動態工具列／Home Screen Web App 與 GPU 模糊效能測試。
4. **Figma `Opening Screen`**、其他章節：尚未依各個 Frame 做精準還原，這是下一階段，不在本次已通過清單。

### 截圖

- `verification/stage1_home.png` — 首頁 393 × 852
- `verification/stage1_travel.png` — 旅支度收合 393 × 852
- `verification/stage1_twac.png` — TWAC 393 × 852
- `verification/stage1_pass.png` — 交通パス 393 × 852
- `verification/stage1_side.png` — 右側選單完全展開 393 × 852

以上檔案**僅是測試資料**，不會以任何形式被網頁 `<img>`、CSS 背景或 Canvas 當作界面顯示。

## v2.0.2 補充

本版已加入 18 個真正的原始文字外框 SVG，取代首頁和側邊選單的暫時字體替代。原始 `docs/verification/stage1_*.png` 不是本版更新後的畫面，不得據此聲稱 v2.0.2 已完成 Pixel-perfect 視覺驗收。完整資產映射與靜態 QA 請參考 `PHASE1_OUTLINE_ASSET_QA.md`。
