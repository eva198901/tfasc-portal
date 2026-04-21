# 🚀 TFASC Portal 快速使用指南

歡迎使用 TFASC Portal！這是一個完整的標售資料爬蟲任務管理系統。

---

## 📋 系統需求

- **Node.js**: 18+
- **pnpm**: 9+（本倉庫**僅使用 pnpm**，請勿使用 npm 產生 `package-lock.json`）
- **Python**: 3.8+（僅在使用內嵌 `server/` 示範後端時需要）
- **作業系統**: Windows, macOS, Linux

### 相關文件（與後端／部署整合）

| 位置 | 說明 |
|------|------|
| [README.md](./README.md) | Portal 總覽與指令 |
| [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) | 驗收與上線前檢核 |
| [../CrawlingData/tfasc-scraper/README.md](../CrawlingData/tfasc-scraper/README.md) | **正式** API、爬蟲、Docker |
| [../CrawlingData/tfasc-scraper/deployment_guide.md](../CrawlingData/tfasc-scraper/deployment_guide.md) | 後端部署細節 |

---

## ⚡ 5分鐘快速啟動

### 1. 一鍵啟動 (最簡單)

```bash
# 直接執行啟動腳本
./start-fullstack.sh
```

**就這麼簡單！** 腳本會自動：
- 檢查並安裝所有依賴
- 同時啟動前端和後端
- 顯示所有訪問地址

### 2. 訪問應用程式

啟動成功後，開啟瀏覽器訪問：

- 🎨 **主應用程式**: http://localhost:3000
- 🧪 **爬蟲任務示範**: http://localhost:3000/crawl-tasks-demo  
- 📚 **API 文件**: http://localhost:8000/docs

---

## 🎯 主要功能測試

### 爬蟲任務管理
1. 訪問 http://localhost:3000/crawl-tasks-demo
2. 在 "新增爬蟲任務" 區塊輸入網址
3. 點擊 "新增任務" 按鈕
4. 觀察任務狀態和統計數據更新

### 標售資料搜尋  
1. 訪問 http://localhost:3000/tender-search
2. 使用各種篩選條件搜尋
3. 查看搜尋結果和分頁功能

### API 測試
1. 訪問 http://localhost:8000/docs
2. 點擊任意 API 端點
3. 點擊 "Try it out" 測試功能

---

## 🔧 進階使用

### 分別啟動前後端

**後端 API**:
```bash
cd server
pip install -r requirements.txt
python start.py
```

**前端應用**:
```bash
pnpm install
pnpm run dev
```

### 使用 pnpm 腳本

```bash
# 啟動全端應用（內嵌 server + 前端）
pnpm run start:fullstack

# 只啟動內嵌後端
pnpm run start:backend

# 測試內嵌後端 API
pnpm run test:backend

# 前端 TypeScript 檢查
pnpm run typecheck

# E2E 測試
pnpm run test:e2e
```

---

## 📊 功能概覽

### ✅ 爬蟲任務管理
- 建立新的爬蟲任務
- 查看任務狀態 (pending/running/done/failed)
- 批次刪除任務
- 重試失敗任務
- 即時統計數據

### ✅ 標售資料搜尋
- 多條件篩選搜尋
- 關鍵字搜尋
- 分頁瀏覽結果
- 資料匯出功能

### ✅ API 管理
- 完整的 RESTful API
- 自動生成的 API 文件
- 即時 API 測試介面
- 錯誤處理和驗證

---

## 🛠️ 常見問題

### Q: 啟動腳本沒有執行權限？
```bash
chmod +x start-fullstack.sh
```

### Q: Python 依賴安裝失敗？
```bash
# 建議使用虛擬環境
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Q: 前端依賴安裝失敗？
```bash
# 清除後以 pnpm 重新安裝
rm -rf node_modules
pnpm install
```

### Q: 端口被佔用？
- 前端預設 3000 端口
- 後端預設 8000 端口
- 可在 `server/config.py` 和 `nuxt.config.ts` 中修改

### Q: IPC connection closed（Nuxt／vite-node）？

此為 **Nuxt 開發模式** 下 Vite 與子程序通訊中斷（子程序崩潰、HMR WebSocket 斷線、或 DevTools 干擾等），**不一定是** `/crawl-tasks-demo` 頁面程式錯誤。

建議依序嘗試：

1. **完全重啟 dev**：終端機 `Ctrl+C` 結束後再執行 `pnpm run dev`；確認沒有第二個佔用 `3000` 的殘留 Node 程序。  
2. **清快取**：在專案根目錄執行 `rm -rf .nuxt node_modules/.vite` 後再 `pnpm install`（若需要）與 `pnpm run dev`。  
3. **暫時關閉 Nuxt DevTools**（常可緩解不穩）：  
   `NUXT_DEVTOOLS=false pnpm run dev`  
4. **與設定一致開網址**：`nuxt.config.ts` 預設開發主機為 `127.0.0.1` 時，請優先開 **http://127.0.0.1:3000/crawl-tasks-demo**（與 `localhost` 多數情況相同，但若遇 HMR 問題可改試此 URL）。  
5. **需要區網存取時**：改設 `NUXT_DEV_HOST=0.0.0.0` 並可搭配 `NUXT_VITE_HMR_HOST=<你的區網 IP>`，否則維持預設即可。  
6. **仍頻繁發生**：升級專案 `nuxt` 至目前主線 3.x 最新版，或提高 Node 記憶體上限（例如 `export NODE_OPTIONS=--max-old-space-size=6144` 後再 `pnpm dev`）。

---

## 📚 更多資源

### 文件
- **README.md**: 完整專案說明
- **server/README.md**: 後端詳細文件  
- **VERIFICATION_CHECKLIST.md**: 上線前驗證檢核

### API 文件
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 測試
- **前端測試**: `pnpm run test:e2e`
- **後端測試**: `python server/test_simple.py`

---

## 🎯 下一步

1. **探索功能**: 試用所有主要功能
2. **查看代碼**: 了解技術實作細節  
3. **客製化**: 根據需求調整配置
4. **擴展功能**: 添加新的 API 端點或頁面

---

## 📞 技術支援

如果遇到問題：

1. **檢查日誌**: 查看終端輸出的錯誤訊息
2. **查看文件**: 參考 README.md 和相關文件
3. **測試 API**: 使用 Swagger UI 測試後端功能
4. **檢查配置**: 確認 `nuxt.config.ts` 和 `server/config.py`

---

**🎉 享受使用 TFASC Portal！**

這是一個功能完整、生產就緒的應用程式，您可以立即開始使用或進行客製化開發。 