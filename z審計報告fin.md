# w-threejs-vue 最終審計報告

審計日期：2026-06-27  
查核基準：目前工作區檔案狀態，並已重新閱讀 `z審計報告p2.md`、`z審計報告p3.md` 後逐項回查原始碼。

## 一、重新查核摘要

本次重新查核後，以下項目已確認為誤報或需降級：

| 來源 | 原指摘 | 最終判定 |
|---|---|---|
| p1 | `addMeshs` 未 push 新 mesh | 目前工作區已存在 `newMeshs.push(mesh)`，不列為最終問題。位置：`src/js/plot3d.mjs:2068-2080` |
| p2 | `modify()` 無法偵測新增 opt key | 誤報。新增 key 會在 `each(ks)` 中與 `optTemp` 的 `null` 比對並列為 `type: 'mod'`。位置：`src/components/WThreejsVue.vue:920-947` |
| p2 | `resize()` 未呼叫 `renderer.setSize()` | 誤報。`resize()` 有更新 camera projection，也有呼叫 `renderer.setSize()` 與 `rendererLabels.setSize()`。位置：`src/js/plot3d.mjs:2396-2421` |
| p2 | `disposeScene` 未呼叫 `cleanMaterial` | 誤報。`disposeScene` 內對 mesh material 有呼叫 `cleanMaterial`。位置：`src/js/atScene.mjs:26-42` |
| p3 | `viewPick` 使用未定義變數/函式 | 誤報。`r`、`rs`、`ls`、`pv`、`_name`、`_cmpPick` 均在函式內定義。位置：`src/App.vue:794-833` |
| p2 | timer 必然記憶體洩漏 | 降級。`beforeDestroy` 有 `clearInterval`，不能直接判定必然洩漏；但 50ms 輪詢仍是明確效能問題。位置：`src/components/WThreejsVue.vue:372-421` |

重新查核後，最需要優先處理的是：

1. `npm run build` 目前仍失敗。
2. 光源重建後未回寫新參照，屬於功能與資源釋放問題。
3. `opt` prop 預設值回傳 `undefined`。
4. 模型載入錯誤只被 `console.log`，沒有正式錯誤事件與 loading 收斂。
5. 50ms 輪詢、axis 全量重建、controls 未 dispose 是主要效能與資源風險。

## 二、驗證結果

### `npm test`

結果：通過。

限制：目前只有 placeholder 測試：

```js
assert.strict.deepEqual(1, 1)
```

位置：`test/all.test.mjs:7`

### `npm run build`

結果：失敗。

錯誤主因：

```text
Module not found: Error: Can't resolve 'url' in node_modules/@oozcitak/url/lib
```

依賴鏈查核：

```text
@kitware/vtk.js -> xmlbuilder2 -> @oozcitak/dom -> @oozcitak/url
```

`npm run build` 失敗後會刪除 tracked `dist` bundle 並產生 `dist/legacy-assets-index.html.json`；本次查核已將這些驗證副作用還原/移除。

### 其他命令訊息

PowerShell 執行 npm 時出現：

```text
Test-Path : Access is denied
```

該訊息來自 npm wrapper 嘗試讀取使用者全域 npm 路徑；它沒有阻止 `npm test`，但會干擾命令輸出判讀。

## 三、最終確認的功能性問題

### F1 高：正式建置失敗

位置：

- `src/js/vtkPolyDataToBufferGeometry.mjs:4`
- `package.json`
- `vue.config.js`

原因：

VTP 支援引入 `@kitware/vtk.js`，其依賴鏈需要 Node core module `url`。Vue CLI 5 / webpack 5 不再自動提供 Node core polyfill，且目前 `package.json` 未安裝 `url`，`vue.config.js` 也沒有設定 fallback。

影響：

- 無法重新產出 `dist/w-threejs-vue.umd.js`。
- CI 目前只跑 `npm test`，不會攔下 build failure。

建議：

- 若保留 VTP browser build：安裝 `url` 並在 webpack fallback 補 `url: require.resolve('url/')`。
- 若不希望 polyfill：評估 `resolve.fallback.url = false`，但需確認 `vtk.js` 功能不受影響。
- 更佳方案：將 VTP loader 改為 dynamic import，使 STL-only 使用者不必承擔 `vtk.js` 與 polyfill 成本。
- CI 增加 `npm run build`。

### F2 高：點光源/方向光重建後未回寫參照

位置：

- `src/js/plot3d.mjs:761-794`
- `src/js/plot3d.mjs:811-822`

現象：

`setLightPointPoss`、`setLightPointColor`、`setLightPointIntensity`、`setLightPointDistance`、`setLightPointDecay` 會：

```js
disposeLightPoints(scene, lightPoints)
createLightPoints(scene, ...)
```

但沒有：

```js
lightPoints = createLightPoints(scene, ...)
```

`setLightDirectionIntensity`、`setLightDirectionPos` 也同樣重建後未回寫 `lightDirection`。

影響：

- 後續 `setUseLightPoint` 會操作舊的 `lightPoints` 陣列。
- 後續 dispose 可能只釋放舊參照，漏掉新建立的 light。
- 多次修改光源屬性可能造成場景內殘留 light 或狀態不同步。

建議：

- 修正為回寫參照。
- 可直接原地更新屬性者避免重建，例如 `color`、`intensity`、`position`。
- 補測：連續改光源強度/位置後，scene 中 light 數量不增加，且 `useLightPoint` 可正確切換最新 light。

### F3 中：`opt` prop default 未回傳物件

位置：

- `src/components/WThreejsVue.vue:310-314`

目前：

```js
default: () => {},
```

這會回傳 `undefined`，不是空物件。

影響：

- 不傳 `opt` 時，元件寬高會落到 0，使用體驗不明確。
- 雖多數存取使用 lodash `get` 可避免 crash，但此 default 不符合 Vue object prop 慣例。

建議：

```js
default: () => ({})
```

並考慮給 `width`、`height` 合理 fallback。

### F4 中：尺寸讀取函式高度分支判斷錯誤

位置：

- `src/js/plot3d.mjs:81-103`

問題：

讀取高度時第二個分支判斷 `ele.clientWidth`，卻取 `ele.clientHeight`：

```js
else if (isNumber(ele.clientWidth)) {
    h = ele.clientHeight
}
```

建議改為：

```js
else if (isNumber(ele.clientHeight)) {
    h = ele.clientHeight
}
```

並防護寬高為 0、`undefined` 或 `NaN` 的場景。

### F5 中：載入錯誤沒有正式回報機制

位置：

- `src/components/WThreejsVue.vue:841-903`
- `src/js/plot3d.mjs:2000-2037`
- `src/js/addStl.mjs:31`
- `src/js/addVtp.mjs:30`

現象：

模型類型錯誤、URL 載入失敗、VTP/STL parse 失敗時，錯誤多半只進入 `console.log`。Vue 層沒有穩定 emit `error` event，也沒有保證 loading 狀態在失敗時落地。

影響：

- 使用者可能只看到 loading。
- 上層應用無法用標準事件或 Promise 處理錯誤。

建議：

- 增加 `error` event：`vo.$emit('error', err)` 與 core `ev.emit('error', err)`。
- `init()` 使用 `finally` 收斂 loading。
- 對 `items[].url`、`items[].type` 做前置驗證。

### F6 低：`legned` 拼字已進入公開 API

位置：

- `src/App.vue:670-672`
- `src/components/WThreejsVue.vue:1079-1081`
- `src/AppLgLegned*.vue`

判定：

這不是立即 runtime bug，因為專案內部一致使用 `legned`。但它是公開 API 與文件命名問題，長期會造成使用者困惑。

建議：

- 新增正確拼字 alias：`legendBackgroundColor`、`legendHeight`、`legendHeightMax`。
- 保留 `legned*` 舊 key 一段相容期，文件標記 deprecated。

### F7 低：`App.vue` 使用非標準 attribute 觸發 computed side effect

位置：

- `src/App.vue:4`
- `src/App.vue:714-718`

現象：

根 `div` 使用：

```vue
:changeMenus="changeMenus"
```

`changeMenus` 是 computed，但內部呼叫 `modifyMenus(...)` 造成副作用。

判定：

這不是 p3 所說的致命 HTML 錯誤，Vue 可將它當作 attribute 綁定處理；但用 computed side effect 驅動畫面狀態不易維護。

建議：

- 改為 watcher 監聽 `indP1`、`indP2`、`indP3`。
- 或在選單事件處理流程直接呼叫 `modifyMenus`。

## 四、需要重構之處

### R1 高：核心檔案職責過度集中

位置：

- `src/js/plot3d.mjs`
- `src/components/WThreejsVue.vue`
- `src/App.vue`

問題：

`plot3d.mjs` 同時負責 scene、renderer、camera、controls、light、axis、mesh、label、loader、render loop、dispose 與公開 API。`WThreejsVue.vue` 同時處理 UI、狀態同步、option diff、事件轉發與 legend。

建議拆分：

- `rendererManager`
- `cameraManager`
- `lightManager`
- `axisManager`
- `meshManager`
- `labelManager`
- `optionNormalizer`
- `resourceDisposer`

### R2 高：`kpSet` 字串映射不利維護

位置：

- `src/components/WThreejsVue.vue:959-1104`

問題：

`kpSet` 以字串描述要呼叫的函式，例如：

```js
axisYTitle: 'ev.setAxisYTitle'
```

之後再用 lodash `get(vo, cf)` 取得函式。

影響：

- 拼錯不會有靜態檢查。
- option key 和 setter 名稱大量重複，新增/改名容易漏改。

建議：

- 改為實際函式引用或集中 API：`ev.updateConfig({ key, value })`。
- 至少用產生式 mapping，減少 80+ 行手寫字串。

### R3 中：Axis setter 大量重複且全都全量重建

位置：

- `src/js/plot3d.mjs:1812-1994`

問題：

每個 `setAxisX/Y/Z*` 都呼叫 `refreshAxis()`，而 `refreshAxis()` 會 `disposeAxis()` 再 `createAxis()`。

建議：

- 使用 `axisConfig` 資料結構描述 X/Y/Z。
- 原地更新可更新的屬性，例如 label style、line material color、visibility。
- 需要重算 geometry 的變更再重建。

### R4 中：Demo 元件與 `App.vue` 註冊方式過度手寫

位置：

- `src/App.vue:85-279`
- `src/App.vue:297` 起

問題：

大量 demo component 以手動 import、components 註冊、選單資料三處同步維護。

建議：

- 建立 demo registry。
- 使用 dynamic component。
- 類似 color/number/boolean/select demo 可用共用模板。

## 五、效能與資源問題

### P1 高：兩組 50ms 輪詢

位置：

- `src/components/WThreejsVue.vue:375-416`
- `src/js/plot3d.mjs:1067-1088`

問題：

Vue wrapper 每 50ms 同步 helper/camera/mesh/menu 狀態；plot3d core 也每 50ms 比對 camera view angle 並可能觸發 axis 顯示與 render。

影響：

- 多 viewer 場景 CPU 成本線性增加。
- `getMeshs()` 每次產生陣列，並與 `vo.meshs` 深比較。

建議：

- 使用 controls change/update event 驅動 camera angle 更新。
- mesh 狀態用 version counter 或 event：`mesh-change`、`camera-change`、`axis-change`。
- 若短期保留輪詢，至少在 inactive/hidden/destroying 狀態停止。

### P2 中：Axis 與 label 更新成本高

位置：

- `src/js/plot3d.mjs:1812-1830`
- `src/js/plot3d.mjs:2208-2248`

問題：

Axis option 任一變更都全量重建；mesh label 建立時會整批建立 DOM label。

建議：

- diff 更新。
- 對 label text/style/visibility 做原地更新。
- 大量 label 場景可評估 sprite/canvas label。

### P3 中：controls 未呼叫 dispose

位置：

- `src/js/plot3d.mjs:1019-1021`
- `src/js/plot3d.mjs:2541-2542`

問題：

`disposeControls()` 只做：

```js
controls = null
```

若 `camera-controls` 內部有 DOM event listener，只清空變數不足以釋放。

建議：

```js
if (controls && typeof controls.dispose === 'function') {
    controls.dispose()
}
controls = null
```

### P4 中：模型載入序列化

位置：

- `src/js/plot3d.mjs:2050-2056`
- `src/js/plot3d.mjs:2068-2080`

現象：

初始模型載入與批次新增都使用 `pmSeries` 序列處理。

影響：

多檔模型載入時間會疊加。

建議：

- 支援可配置 concurrency，例如 2 到 4。
- 保留序列模式作為低記憶體選項。

### P5 中：Blob URL 未釋放

位置：

- `src/AppBasicUpload.vue:139`

問題：

Demo 上傳使用 `URL.createObjectURL(bb)`，未在載入後或清除時呼叫 `URL.revokeObjectURL(url)`。

影響：

重複上傳大型模型會累積瀏覽器記憶體。

建議：

- Demo 層自行記錄 URL 並在 clean/dispose 後 revoke。
- 若 core 接受 blob URL，可加入 ownership option，由 mesh manager 統一釋放。

## 六、測試與 CI 缺口

### T1 高：CI 未跑 build

位置：

- `.github/workflows/ci-test.yml`

目前 CI：

```yaml
- run: npm install
- run: npm test
```

問題：

`npm run build` 已確認失敗，但 CI 不會攔截。

建議：

- 改用 `npm ci`。
- 加入 `npm run build`。
- 若保留 lint，自動修正模式不應在 CI 寫檔。

### T2 高：測試沒有覆蓋核心行為

位置：

- `test/all.test.mjs`

建議新增最小測試：

- `opt` default 與 width/height fallback。
- `addMesh` / `addMeshs` 後 `getMeshsInfor()` 數量正確。
- 光源屬性連續更新後 scene light 數量不增加。
- `resize()` 更新 renderer/camera。
- STL/VTP 載入失敗會 emit error 並解除 loading。
- mount/unmount 多次後 timer、controls、DOM renderer 不殘留。

## 七、修復優先順序

### P0：立即修復

1. 修正 build failure：`url` fallback 或 VTP loader dynamic import。
2. 修正 light 重建未回寫參照。
3. CI 加上 `npm run build`，避免同類問題再漏掉。

### P1：本迭代修復

1. 修正 `opt` default。
2. 修正 `gs()` 高度分支判斷。
3. 增加 error event 與 loading finally。
4. `disposeControls()` 呼叫 `controls.dispose()`。

### P2：效能與可維護性

1. 移除或降低 50ms 輪詢。
2. Axis / label 改為增量更新。
3. `kpSet` 改為函式引用或 `updateConfig`。
4. `legend*` 正確拼字 alias 與 deprecated 文件。

### P3：長期重構

1. 拆分 `plot3d.mjs` manager。
2. Demo registry 與 dynamic component。
3. 規劃 Vue 3 / TypeScript 遷移。

## 八、最終結論

本專案核心功能完整，但目前最大問題不是單一演算法，而是交付鏈與生命週期管理：建置失敗、CI 未覆蓋 build、光源參照重建錯誤、錯誤事件不足，以及固定輪詢造成的效能成本。

`p2`、`p3` 中有多個方向正確的重構建議，但也存在誤報；本 final 版已排除 `modify()` 新增 key、`resize()`、`viewPick` 未定義變數、`disposeScene cleanMaterial` 等不成立項目。後續建議先修 P0/P1，讓建置與基本生命週期穩住，再進行 axis、state sync、demo 架構的漸進重構。

## 九、本輪修正紀錄

已於 2026-06-27 修正：

- `npm run build` 的 `url` polyfill 問題：新增 `url` dependency，並於 `vue.config.js` 設定 `resolve.fallback.url`。
- 光源重建後未回寫參照：`lightPoints`、`lightDirection` 重新建立後會回存最新參照。
- 光源 setter 優化：點光源顏色/強度/距離/衰減與同數量位置更新改為原地更新；方向光強度/位置也改為原地更新。
- `opt` prop default：改為 `default: () => ({})`。
- renderer 尺寸讀取：修正 `clientHeight` 判斷分支。
- 模型載入錯誤事件：`WThreejsVue` 會轉發 `error` event，初始化失敗時也會關閉 loading。
- public `addMesh` / `addMeshs` 載入失敗時會 emit `error` 並重新丟出錯誤。
- `disposeControls()`：若 controls 支援 `dispose()`，銷毀時會呼叫。
- `plot3d.mjs` 補齊 `isfun` import，避免 controls dispose 路徑執行時拋出 `ReferenceError`。
- `WThreejsVue` 輪詢 guard：`ev` 尚未建立時不進行 50ms 狀態同步，避免初始化期間同步出 `null` 狀態。
- legend option alias：新增 `legendBackgroundColor`、`legendHeight`、`legendHeightMax`，保留 `legned*` 舊拼字相容。
- Demo 上傳 Blob URL：等待 `addMeshs` 載入完成後呼叫 `URL.revokeObjectURL`。
- `App.vue` 選單更新：移除 `:changeMenus="changeMenus"` computed side effect，改用 watcher 排程呼叫 `modifyMenus()`。

驗證：

- `npm run lint`：通過。
- `npm test`：通過，仍只有 placeholder 測試。
- `npm run build`：通過，但仍有 bundle size warning。

未於本輪處理：

- CI build gate：依維護策略，後續將統一於各套件流程處理。

## 十、續修紀錄：重構與效能優化

2026-06-27 續修：

- `plot3d.mjs` 移除 core 內原本固定 50ms 偵測 camera view angle 的 `setInterval`，改用 `camera-controls` 的 `update` event 觸發 `syncViewAngle()`。
- `syncViewAngle()` 統一負責 `_viewAngle` 更新、axis 顯隱同步與 `change-view-angle` emit；程式化呼叫 `setCameraViewAngle()` 時仍會立即 render。
- 相機型別與正交比例重建 controls 後會重新綁定 controls event，避免切換 camera 後視角事件失效。
- `rdr()` 完成後主動同步一次 view angle，補回原 timer 會提供的初始視角狀態。
- `addMesh()` / `addMeshs()` 改為等待 `rdr()` 完成後才 resolve，並新增 `mesh-change` event。
- `setMeshVisible()`、`setMeshColor()`、mesh label setter、`cleanMeshs()` 於狀態變更後 emit `mesh-change`。
- `WThreejsVue.vue` 抽出 `refreshMeshsState()`，timer 與 `mesh-change` event 共用同一套 mesh/menu 狀態同步邏輯；常見 mesh 變更可即時同步，不必只依賴 50ms 輪詢。
- `WThreejsVue.vue` 於註冊 plot3d event 前先保存 `vo.ev`，並在 `init` 時補跑 `refreshMeshsState()`，避免初始 `mesh-change` 事件早於 wrapper 狀態保存而落空。
- 初始 `rdr()` promise 增加 `.catch()`，失敗時 emit `error`，避免非同步初始化錯誤只落到 unhandled promise。
- 本輪仍未修改 `.github/workflows/ci-test.yml`，遵守使用者要求。

2026-06-27 續修第二批：

- `plot3d.mjs` 新增 `config-change` event；`useAutoRotate`、`useAxis`、`useHelperAxes`、`useHelperGrid`、`cameraType` setter 會主動通知 wrapper。
- `WThreejsVue.vue` 新增 `refreshControlState()`，控制列狀態改由 `config-change` 即時同步。
- wrapper 原本 50ms timer 已降為 1000ms fallback；一般 mesh 與 config 變更改走事件推送，降低閒置輪詢成本。
- `autoRotate` 於動畫迴圈中改為直接納入本幀 render 判斷，並同步 view angle，避免自動旋轉改角度後未即時 render。

2026-06-27 續修第三批：

- `plot3d.mjs` 移除 `addVtp` 靜態 import，改為第一次讀取 VTP 時才 dynamic import，並指定 `w-threejs-vue-vtp` chunk。
- VTP 相關 `@kitware/vtk.js` 依賴已從主 entry 拆出；build 顯示 app entry 約由前次 1.94 MiB 降至 1.45 MiB，VTP 另成約 498 KiB lazy chunk。
- `addMeshsCore()` 與 public `addMeshs()` 改用 `pmMap(..., 2)`，多模型載入可保守並行，結果仍保持原輸入順序加入 scene。
- mesh/background/light color setter 改用既有 `THREE.Color#set()` 就地更新，減少互動調色時的暫時物件配置。

2026-06-27 續修第四批：

- `plot3d.mjs` 移除 `addStl` 靜態 import，改為第一次讀取 STL 時才 dynamic import，並指定 `w-threejs-vue-stl` chunk。
- build 顯示 STL chunk 約 3.77 KiB gzip 前、約 1.87 KiB gzip 後；此項主要降低無模型或非 STL 場景的初始依賴，而非大幅縮減 entry。
- `WThreejsVue.vue` 的 deep watch modify 流程新增 `modifySeq`，300ms debounce 後只允許最新一次 prop 變更套用，避免連續變更時重複觸發 axis/helper/camera setter 與重建。

續修後驗證：

- `npm run lint`：通過。
- `npm test`：通過，1 passing。
- `npm run build`：通過，仍有 bundle size warning；warning 數由先前 3 個降為 2 個，VTP/STL 已切分為 lazy chunk。
- `npm run build` 產生的暫時 `dist/index.html`、`dist/js`、`dist/css` 已清除，tracked UMD 檔已恢復。
