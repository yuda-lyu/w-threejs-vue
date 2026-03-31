# 04模型數據 工作摘要

## 1. 任務目標
基於《深地質處置設施視覺化組件與配置指南》，生成關鍵組件的 3D 幾何數據，並建立一個互動式的網頁視覺化展示 (Demo)。

## 2. 完成事項

### A. 數據生成 (Data Generation)
*   **腳本位置**: `04模型數據/demo/generate_data.mjs`
*   **技術**: 使用 Node.js 撰寫原生腳本，不依賴龐大第三方庫，直接生成 VTK XML PolyData (`.vtp`) 格式文件。
*   **產出成果**: 成功生成 12 種核心組件的 3D 模型檔：
    1.  `canister.vtp` (處置罐 - 銅殼雙層結構)
    2.  `fuel_assembly.vtp` (燃料組件)
    3.  `buffer.vtp` (緩衝層 - 膨潤土)
    4.  `deposition_hole.vtp` (處置孔)
    5.  `bottom_plate.vtp` (底部保護板)
    6.  `deposition_tunnel.vtp` (處置隧道)
    7.  `end_plug.vtp` (隧道封塞)
    8.  `main_tunnel.vtp` (主隧道)
    9.  `central_area.vtp` (中央區)
    10. `access_ramp.vtp` (螺旋斜坡道)
    11. `shafts.vtp` (豎井)
    12. `host_rock.vtp` (母岩 - 透明顯示)

### B. 視覺化展示 (Visualization Demo)
*   **展示位置**: `04模型數據/demo/index.html`
*   **技術棧**:
    *   **Vue/React**: 本次採用原生 **Vanilla JS (ES Modules)** 架構，確保輕量與通用性。
    *   **vtk.js**: 使用 `@kitware/vtk.js` 進行專業科學視覺化渲染。
    *   **lodash-es**: 用於數據處理輔助。
    *   **CDN 加載**: 採用 `esm.sh` 進行模組加載，無需 `npm install` 即可運行。
*   **功能特色**:
    *   **互動控制**: 提供側邊控制面板，可獨立開關 12 個組件的顯示與隱藏。
    *   **材質模擬**: 針對不同材質設定對應顏色與透明度（如：銅色處置罐、半透明母岩、灰色混凝土）。
    *   **3D 操作**: 支援完整的旋轉、縮放、平移視角控制。

## 3. 如何執行
1. 請確保已安裝 Node.js 環境。
2. 開啟終端機，移動到 `04模型數據/demo` 資料夾。
3. 若需重新生成數據：`node generate_data.mjs`。
4. **啟動展示**: 由於瀏覽器安全限制 (CORS)，無法直接點擊 html 開啟。請使用 Live Server 或類似工具。
    *   例如使用 `npx serve .` 
    *   然後在瀏覽器開啟 `http://localhost:3000` (或對應 port)。
