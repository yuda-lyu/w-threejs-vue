# 如何執行視覺化 Demo

本目錄包含深地質處置設施的 3D 視覺化數據與網頁展示。

## 檔案說明

*   `generate_data.mjs`: 用於生成 `.vtp` (VTK XML PolyData) 3D 模型檔案的腳本。
*   `index.html`: 視覺化主要網頁，使用 vtk.js 渲染。
*   `*.vtp`: 生成的各個組件模型檔。

## 執行步驟

### 1. 生成數據 (可選)
若您想重新生成或修改幾何參數，請執行：
```bash
node generate_data.mjs
```
此指令會更新目錄下的所有的 `.vtp` 檔案。

### 2. 啟動網頁展示
由於瀏覽器安全策略 (CORS)，您無法直接雙擊 `index.html` 開啟，必須透過本地伺服器 (Local Server) 執行。

**方法 A: 使用 npx (推薦)**
如果您已安裝 Node.js：
```bash
npx serve .
```
然後在瀏覽器開啟顯示的網址 (通常是 `http://localhost:3000`)。

**方法 B: 使用 VS Code Live Server**
1. 在 VS Code 中安裝 "Live Server" 擴充功能。
2.在這個 `index.html` 檔案上按右鍵。
3. 選擇 "Open with Live Server"。

### 3. 操作說明
*   **旋轉**: 左鍵拖曳。
*   **平移**: Shift + 左鍵拖曳 (或滾輪按住拖曳)。
*   **縮放**: 滾輪滾動 / 右鍵拖曳。
*   **控制面板**: 左上角提供選單，可勾選/取消勾選以顯示或隱藏特定組件 (如隱藏母岩以看清內部結構)。
