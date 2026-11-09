# 回饋(feedback)

任務中發現之自有套件、全域技能、全域設定之調整與抽提提案(只增不改,處置結果另記一列).一條一列:日期、類別、對象、內容、依據.

| 日期 | 類別 | 對象 | 內容 | 依據 |
|---|---|---|---|---|
| 2026-11-09 | 自有套件 | w-package-tools-e2e | 提案於 README 補「WebGL 頁面(three.js 等)之 e2e 啟動旗標」:`launchBrowser` 之六旗標含 `--disable-gpu`,WebGL 頁需另經 `opt.args` 附加 `--use-angle=swiftshader --use-gl=angle --enable-unsafe-swiftshader --ignore-gpu-blocklist` 才能在無 GPU 環境建立 WebGL context 並得到決定性輸出;或提供官方之 WebGL 旗標組常數,避免各套件各自試出 | `test/e2e-render-smoke.test.mjs` 之 `launchBrowser` 呼叫;同旗標下升版前後 52 張截圖連拍兩輪逐像素相同 |
