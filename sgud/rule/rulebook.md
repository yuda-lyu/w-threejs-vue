# 規則帳本

本檔為套件設計與開發階段之規則帳本(藍圖),為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.當前已做到哪些記於`sgud/state/state.md`.過長時依類型拆為`rulebook_<類型>.md`,本檔只留索引.

## 索引

| 規則 | 主題 | 測試 |
|---|---|---|
| R01 | three、@kitware/vtk.js 宣告與已安裝版本一致,且不低於本輪目標 | `test/unit-three-vtk-api.test.mjs` R01 |
| R02 | 程式碼不使用已移除或遷移指南要求處理之 API | 同檔 R02 |
| R03 | 本套件呼叫之 three／camera-controls 生命週期 API 仍存在 | 同檔 R03 |
| R04 | 場景元件之建立與釋放(光源、輔助軸、網格、線、群組、場景) | 同檔 R04 |
| R05 | STL 載入(`addStl`) | 同檔 R05 |
| R06 | VTP 載入(vtk.js 讀取、三角化、轉 `BufferGeometry`) | 同檔 R06 |
| R07 | 真瀏覽器渲染煙霧:起頁、畫布尺寸、色彩、互動、銷毀釋放 WebGL、再掛載 | `test/e2e-render-smoke.test.mjs` |
| R08 | 升版視覺回歸程序(並排比對,不新增標準圖) | 程序(見該條) |

## 破壞性變更紀錄(相依升級對本套件之影響)

| 日期 | 升級 | 對外 API | 結論 |
|---|---|---|---|
| 2026-11-09 | three 0.185.1→0.187.0;@kitware/vtk.js 36.5.2→38.0.4 | 無改變 | 見 R02 之站點全集;視覺回歸 0 差異 |

## R01 宣告與版本

- 規則:`package.json` 之 `three`、`@kitware/vtk.js` 須宣告為 `^` 範圍;已安裝版本須與宣告同主版號(`0.x` 視為同次版號)且不低於宣告;`THREE.REVISION` 等於 three 次版號.本輪目標:three `^0.187.0`、vtk.js `^38.0.4`.
- 盤點:`npm ls three @kitware/vtk.js camera-controls`(camera-controls 須 `deduped` 至同一份 three).
- 判準:`unit-three-vtk-api` R01 三案;升版前以 HEAD 之宣告套用同判斷為紅(`^0.185.0`、`^36.2.1`),升版後為綠.

## R02 已移除或須遷移之 API(站點全集:0 處命中)

規則:下列識別字不得出現於 `src/js`、`src/components`(註解除外);日後若確需使用(如啟用陰影、改 pixelRatio、使用 render target),須先依該版本遷移指南檢視並補測試,再自清單移除該項.盤點指令:`Grep` 各識別字於 `src/`(測試內以去註解後之正則掃描,並附正例自測,避免掃描範圍壞掉時假綠).

| 識別字／行為 | 版本 | 本套件 | 備註 |
|---|---|---|---|
| `sRGBEncoding`、`LinearEncoding`、`outputEncoding`、`physicallyCorrectLights`、`THREE.Geometry`、`THREE.Math`、`Face3` | 更早已移除 | 未使用 | `plot3d.mjs` 僅於註解中出現 `sRGBEncoding`、`ACESFilmicToneMapping`(已停用之舊設定) |
| `THREE.Source`(改名 `TextureSource`) | r187 | 未使用 | 本套件無自建 texture |
| `PCFSoftShadowMap`、`renderer.shadowMap`、`castShadow`、`receiveShadow` | r187(PCFSoft 移除) | 未使用 | `atLightDirection.mjs` 僅於註解有 `castShadow` |
| `setPixelRatio`、`setViewport`、`setScissor` | r187(pixelRatio 僅於 viewport/scissor 套用) | 未使用 | 只呼叫 `renderer.setSize`;畫布位元尺寸等於 `opt.width/height`,於 R07 以 dpr 1、2 驗證 |
| `WebGLRenderTarget`、`setRenderTarget` | r186(viewport 不再乘 pixelRatio) | 未使用 | — |
| `setModelTransformMatrix` | vtk.js 37(改 column-major) | 未使用 | vtk.js 僅用於讀 VTP 與三角化,不用相機 |
| `getColorTexture`、`setAverageIPScalarRange`、`vtk-lite`、`Point` 型別 | vtk.js 38 | 未使用 | — |

使用中且已驗證仍存在之 API(R03、R04):`WebGLRenderer`(`setSize`、`dispose`、`forceContextLoss`)、`Timer`、`Fog`、`PerspectiveCamera`、`OrthographicCamera`、`Raycaster`、`MOUSE`、`Color`、`Group`、`MeshLambertMaterial`、`DoubleSide`、`BufferGeometry`／`BufferAttribute`、`Line`／`LineBasicMaterial`、`AmbientLight`／`DirectionalLight`／`PointLight`(及其 `dispose`)、`AxesHelper`／`GridHelper`(及其 `dispose`)、`three/addons/loaders/STLLoader.js`、`three/addons/renderers/CSS2DRenderer.js`、vtk.js `IO/XML/XMLPolyDataReader.js` 與 `Filters/General/TriangleFilter.js`.

注意:three 0.187 中 `async dispose()` 屬 WebGPU 之 `renderers/common/Renderer.js`;本套件用之 `WebGLRenderer.dispose` 仍為同步(`WebGLRenderer.js` 之 `this.dispose = function`),銷毀流程中其後立即呼叫之 `forceContextLoss()` 順序無須改動(R07 銷毀案驗證 context 確實釋放;移除 `forceContextLoss` 之變異使該案轉紅).

## R03–R06 單元規則(`test/unit-three-vtk-api.test.mjs`)

- R03:`WebGLRenderer` 為類別(其方法掛於實例且需 WebGL,於 R07 驗證)、`Timer` 可 `update/getDelta/dispose`、其餘類別存在、`CameraControls.install({ THREE })` 可執行、`CSS2DObject` 與 `STLLoader` 可由 `three/addons` 載入.
- R04:光源/輔助軸/網格/線之建立參數(位置、強度、距離、衰減、顏色、可見性、軸長、網格範圍與位移)與 `dispose*` 後自場景移除;`disposeGroup`、`disposeScene` 釋放 geometry 與 material(以 `dispose` 事件計數).
- R05:二進位 STL 解析(頂點數、包圍盒);`addStl` 由 HTTP URL 載入,回傳雙面 `MeshLambertMaterial`、顏色依 rgba 字串、`opacity<1` 時 `transparent`、補齊包圍盒與包圍球.Node 無 `ProgressEvent` 全域,測試檔頂端補最小墊片(three `FileLoader` 回報進度時使用).
- R06:ASCII 與 binary(base64)之 VTP 解析結果相同;四邊形(連同三角形)三角化為 9 個索引;`vtkCellArrayToIndices` 之三角形/扇形展開/略過少於 3 點;無點、無多邊形、非 ArrayBuffer/TypedArray 輸入之錯誤訊息.

## R07 真瀏覽器渲染煙霧(`test/e2e-render-smoke.test.mjs`)

- 規則:以 `rollupFiles`(同 `toolg/gDistRollupComps.mjs` 之選項)把 `src/components/WThreejsVue.vue` 編為 UMD 至 `test/_tmp/e2e-render-smoke/`(測完刪除),以 `w-package-tools-e2e` 之 `launchBrowser`(確定性渲染旗標)加 SwiftShader 旗標(`--use-angle=swiftshader --use-gl=angle --enable-unsafe-swiftshader --ignore-gpu-blocklist`)headless 起頁.
- 案例(各於 `deviceScaleFactor` 1 與 2 執行,每案 fresh context):①起頁觸發 `init`、無頁面錯誤、畫布位元與 CSS 尺寸皆等於 `opt`、立方體以指定色呈現於深色背景(像素計數);②真滑鼠拖曳旋轉與滾輪縮放後畫面改變;③元件銷毀後畫布自 DOM 移除、舊畫布之 WebGL context 已丟失、無頁面錯誤,再掛載後可重新顯示.
- 同步方式:以 `init` 事件與 DOM 狀態為同步點,畫面穩定以「連續兩張截圖逐像素相同」判定;無固定延時作為唯一同步(銷毀後 1 秒觀察窗僅用於否定斷言)。
- 限制:無 pixel 標準圖(視覺長相由 R08 於升版時比對);銷毀不發 `dispose` 事件為既有行為,故不以該事件為同步點.
- 變異證據(2026-11-09):移除 `plot3d.mjs` 之 `renderer.forceContextLoss()` → 銷毀案兩個 dpr 均轉紅(「銷毀後WebGL context應已釋放」),還原後全綠.

## R08 升版視覺回歸程序

規則:升級 three 或 vtk.js 時,於升版前先以現行安裝編出 UMD 至暫存夾並以 headless Chromium(SwiftShader)載入 `test-html/ex-*.html` 範例(CDN 之 vue/lodash/wsemi/w-jsonview-tree 與 STL 資源改由本機或快取供應,`../dist/` 改指暫存 UMD),對代表性頁面(基本、mesh、標籤、光源三種、相機、輔助軸/網格、座標軸、圖例)各頁截初始與前三個按鈕之畫面;升版後重編並以相同程序再拍,逐像素比對並產並排圖目視.升版前同版須先連拍兩輪確認為決定性(本輪 52 張逐像素相同).不新增標準圖(`test/pics` 不存在).結論須記入該輪報告:場景、光影、尺寸有無異常;差異像素數與其成因.

## 改動範圍 → 測試對照

| 改動範圍 | 須跑 |
|---|---|
| `package.json` 之 three/vtk.js/camera-controls、`package-lock.json` | 全套 `npm test`,並依 R08 做視覺回歸 |
| `src/js/plot3d.mjs`(renderer、相機、控制、銷毀) | `unit-three-vtk-api`(R02)+ `e2e-render-smoke` |
| `src/js/at*.mjs`、`addStl.mjs` | `unit-three-vtk-api`(R04、R05)+ `e2e-render-smoke` |
| `src/js/vtkPolyDataToBufferGeometry.mjs`、`addVtp.mjs` | `unit-three-vtk-api`(R06) |
| `src/components/WThreejsVue.vue`、選單/圖例/樣式 | `e2e-render-smoke`,並以 R08 目視代表頁 |
