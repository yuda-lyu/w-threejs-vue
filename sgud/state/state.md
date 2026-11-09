# 現況(state)

本檔記當前已開發功能之最新狀態,只記現況不寫過程(過程見 `sgud/exp/experience.md`);藍圖(規則)見 `sgud/rule/rulebook.md`,兩者比對即知尚未做到者.

## 版本與相依(2026-11-09 驗證)

| 項 | 現況 |
|---|---|
| 套件版號 | 1.0.61(`package.json`;版號、發布與 `dist/`、`docs/` 之產製不屬本檔,由發布流程處理) |
| three | `^0.187.0`(已安裝 0.187.0) |
| @kitware/vtk.js | `^38.0.4`(已安裝 38.0.4;38.0.5 以上未用) |
| camera-controls | `^3.1.2`(peer `three >=0.126.1`,與 three 0.187.0 共用同一份) |
| Vue / 工具鏈 | Vue 2.7 與 `@vue/cli-service` 5,維持現狀 |

## 功能(對外為單一 Vue2 元件 `WThreejsVue`,以 `opt` 設定)

- 載入並顯示三維模型:`opt.items[]`(STL 以 three `STLLoader`;VTP 以 vtk.js `XMLPolyDataReader` 讀入、`TriangleFilter` 三角化後轉為 three `BufferGeometry`);每項可設 `name`、`color`(含透明度);顯示圖例(可開關、可設高度)與各 mesh 之標籤(`CSS2DRenderer`).
- 場景:背景色、尺寸(`opt.width/height`,畫布位元尺寸等於設定值,**不乘 `devicePixelRatio`**)、相機(透視/正交,fov/near/far/比例,方位角/極角)、自動旋轉、環境光/點光源(可多個)/平行光、輔助軸(`AxesHelper`)與輔助網格(`GridHelper`)、座標軸(X/Y/Z 之標題、軸線、刻度、刻度標籤、網格線,皆可設色/寬/字型/距離).
- 互動:`camera-controls` 作用於標籤層(拖曳旋轉、滾輪縮放、平移),左側選單(設定、輔助軸、網格、透視、座標軸、自動旋轉、XY/XZ/YZ 視角、圖例);點擊 mesh 觸發 `click-mesh`.
- 事件:`init`、`loading`、`prog`、`error`、`resize`、`change-view-angle`、`click-mesh`、`dispose`(見下〈已知缺口〉)等;方法:`getInst`、`resetView`、`getMeshs`、`getMeshColor`、`setMeshColor`、`getParam`、`setParam` 等.
- 本輪(three 0.185.1→0.187.0、vtk.js 36.5.2→38.0.4)**對外 props、事件與方法無任何改變**,README 無須變動.

## 測試(`npm test` = `mocha --parallel "test/*.test.mjs" --timeout 180000`)

| 檔 | 層 | 案數 | 對應規則 |
|---|---|---|---|
| `test/all.test.mjs` | 佔位 | 1 | — |
| `test/unit-three-vtk-api.test.mjs` | unit | 47 | R01–R06 |
| `test/e2e-render-smoke.test.mjs` | e2e(語意斷言,無標準圖) | 6(dpr 1、2 各 3) | R07 |

最近一次驗證:2026-11-09,three 0.187.0 / vtk.js 38.0.4,全套 54 passing,連跑 4 次(含還原變異後之最終樹)結果相同;e2e 以軟體 WebGL(SwiftShader)headless 執行,約 40–60 秒.

視覺回歸(R08)2026-11-09:16 個範例頁(共 52 張,dpr=1)與 4 頁(13 張,dpr=2)於升版前後逐像素相同(差異像素 0);升版前同版連拍兩輪亦逐像素相同(基準為決定性).

## 已知缺口與待辦

- 元件銷毀時(`beforeDestroy`)不會向父層發出 `dispose` 事件:`beforeDestroy` 先置 `disposed = true`,隨後 `ev.on('dispose')` 之處理器見 `disposed` 即早退(`src/components/WThreejsVue.vue:394-399`、`:1131-1137`).此為既有行為,與 three/vtk 版本無關;若 JSDoc 與使用端預期銷毀時會收到 `dispose`,須另行裁示是否修正.
- 元件未呼叫 `renderer.setPixelRatio`,高 DPI 螢幕上畫布為 1:1 位元尺寸再由瀏覽器放大(較模糊).此為既有行為;three r187 起 pixelRatio 僅於 `setViewport()`／`setScissor()` 套用,本套件不呼叫此二者,故無影響.
- 無像素標準圖(`test/pics` 不存在);視覺回歸為升版時之一次性並排比對,程序見規則帳本 R08.
