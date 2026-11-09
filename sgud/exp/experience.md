# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.過長時抽出舊者為`experience_<年月日>.md`,並於本檔註明何時抽出.

## 2026-11-09 three 0.185.1→0.187.0、@kitware/vtk.js 36.5.2→38.0.4 遷移要點

- 本套件用到之 three 面向很窄:`WebGLRenderer`(只 `setSize`、`dispose`、`forceContextLoss`)、`Timer`、基本光源/輔助軸/網格/線、`MeshLambertMaterial`、`STLLoader`、`CSS2DRenderer`;無陰影、無 render target、無 texture、不設 pixelRatio.遷移指南所列移除項(`TextureSource` 改名、PCFSoftShadowMap、render target viewport、pixelRatio 僅於 viewport/scissor 套用)皆不觸及,升版後程式碼 0 改動.
- 「renderer `dispose()` 改 async」屬 WebGPU 之 `Renderer`;`WebGLRenderer.dispose` 在 0.187.0 仍同步.調研文字若寫「renderer dispose 改 async」,先讀 `node_modules/three/src/renderers/WebGLRenderer.js` 與 `renderers/common/Renderer.js` 辨別是哪個 renderer,不要據以改 await.
- vtk.js 只用 `XMLPolyDataReader` 與 `TriangleFilter` 兩個深層路徑(`@kitware/vtk.js/IO/XML/XMLPolyDataReader.js`、`.../Filters/General/TriangleFilter.js`),38.0.4 路徑與行為不變(ASCII 與 binary VTP 解析、四邊形三角化皆與舊版一致).38 新增依賴 `@webgpu/types`、`fflate` 升 0.7.5、`wslink` 範圍放寬,不影響本套件.
- `npm i three@… @kitware/vtk.js@…` 會把 `package.json` 補上結尾換行(原檔無)並把鎖檔根 `version` 同步為 `package.json` 之版號;換行已還原,版號未被修改.
- 升版驗證之可行作法:升版前先用舊安裝編 UMD 至 `./tmp/`(`rollupFiles` 同 `toolg/gDistRollupComps.mjs` 選項、`fdTar` 改暫存夾),headless Chromium 以 SwiftShader(`--use-angle=swiftshader --use-gl=angle --enable-unsafe-swiftshader --ignore-gpu-blocklist`)載入 `test-html/ex-*.html`(以 `page.route` 把 CDN 之 vue/lodash/wsemi/w-jsonview-tree 換成 `node_modules` 本機檔、STL 換成已下載之副本),軟體 WebGL 輸出為決定性(連拍兩輪 52 張逐像素相同),故升版前後可直接逐像素比對.minify 後 bundle 以 `"185"`/`"187"` 字串可確認 three 版本(`REVISION`).
- three 之 `FileLoader`(STLLoader 用)回報進度時使用瀏覽器全域 `ProgressEvent`,Node 無此全域;在 Node 內單元測試 `addStl` 須補墊片,否則為未捕捉之 `ReferenceError`,mocha 以逾時呈現(非明確失敗).
- `WebGLRenderer` 之方法(`dispose`、`forceContextLoss`、`setSize`、`render`)於建構時掛為實例屬性,`WebGLRenderer.prototype.dispose` 為 `undefined`;無 WebGL 之 Node 環境無法實例化,須於真瀏覽器驗證.
- 元件銷毀不向父層發 `dispose` 事件(`beforeDestroy` 先置 `disposed=true` 使處理器早退),e2e 以 DOM 狀態(畫布移除、舊 context `isContextLost()`)為同步點.
- 驗證測試是否抓得到問題:移除 `forceContextLoss` 之變異使 e2e 銷毀案轉紅,是檢查「context 已釋放」斷言有效之最小變異.
- `npm test` 含 e2e 時(約 40–60 秒)用 `quiet-run --lock` 執行,同套件依序;e2e 以 `launchBrowser`(`w-package-tools-e2e`)起 Chromium,版本不在本機時會先下載.
