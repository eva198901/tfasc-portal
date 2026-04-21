# TFASC Portal

TFASC 標售資訊管理系統 - 統一標案資料處理與管理平台

**🎯 專案狀態**: ✅ **100% 完成，前後端整合完成**  
**📅 完成日期**: 2025-01-27  
**🚀 技術棧**: Nuxt 3 + Pinia + TypeScript（前端）；正式 API／爬蟲見 **`CrawlingData/tfasc-scraper`**

---

## 📚 文件導覽（整合）

| 文件 | 用途 |
|------|------|
| 本 README | Portal 功能、本機指令、與後端關係 |
| [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) | 五分鐘啟動與常見問題 |
| [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) | 驗收與上線前檢核 |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 需求摘要 |
| [../CrawlingData/tfasc-scraper/README.md](../CrawlingData/tfasc-scraper/README.md) | **正式** API、Docker、爬蟲 |
| [../CrawlingData/tfasc-scraper/deployment_guide.md](../CrawlingData/tfasc-scraper/deployment_guide.md) | 後端部署 |
| [../CrawlingData/spec.md](../CrawlingData/spec.md) | 長篇規格與網頁分析（**參考用**，以 scraper 實作為準） |
| [../CrawlingData/docs/README.md](../CrawlingData/docs/README.md) | CrawlingData 文件索引（避免重複變更紀錄） |

---

## 🚀 快速開始

### 前置：僅使用 pnpm

```bash
# 若尚未安裝：https://pnpm.io/installation
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

### 一鍵啟動（內嵌 `server/` 示範後端 + 前端）
```bash
./start-fullstack.sh
```

### 分別啟動

**後端 API（內嵌示範，非正式 Docker 堆疊）**:
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

### 訪問地址
- 🎨 **前端應用**: http://localhost:3000
- 🔧 **後端 API**: http://localhost:8000
- 📚 **API 文件**: http://localhost:8000/docs
- 🧪 **示範頁面**: http://localhost:3000/crawl-tasks-demo

---

## 🏗️ 專案架構

```
工作區（範例）
├── tfasc-portal/          ← 本專案：Nuxt 3 前端
│   └── server/            ← 選用：內嵌 FastAPI 示範（本機一鍵腳本用）
└── CrawlingData/tfasc-scraper/  ← 正式：API + PostgreSQL + Redis + Celery（Docker）
```

## 🎯 主要功能

### ✅ **爬蟲任務管理**
- **任務建立**: 支援 URL 驗證和重複檢查
- **狀態追蹤**: pending → running → done/failed
- **批次操作**: 批次刪除多個任務
- **重試機制**: 重試失敗的任務
- **即時統計**: 各狀態任務數量統計

### ✅ **標售資料搜尋**
- **多條件篩選**: 機關、地區、標案類型
- **關鍵字搜尋**: 標案名稱和內容搜尋
- **分頁顯示**: 高效能分頁查詢
- **結果匯出**: 支援資料匯出功能

### ✅ **API 管理**
- **完整 CRUD**: 建立、讀取、更新、刪除操作
- **分頁查詢**: 支援多種分頁格式
- **錯誤處理**: 統一的錯誤處理機制
- **資料驗證**: 嚴格的輸入驗證

---

## 📁 專案結構

```
tfasc-portal/
├── 前端檔案
│   ├── components/          # Vue 元件
│   │   ├── TenderFilter.vue
│   │   ├── AddLinkModal.vue
│   │   ├── Toast.vue
│   │   └── ToastContainer.vue
│   ├── composables/         # 組合式函數
│   │   ├── useApi.ts
│   │   ├── useCrawlTasks.ts
│   │   ├── useTenders.ts
│   │   ├── useToast.ts
│   │   └── useMockData.ts
│   ├── stores/              # Pinia 狀態管理
│   │   ├── crawlTasks.ts
│   │   └── tenders.ts
│   ├── types/               # TypeScript 型別
│   │   ├── crawlTask.ts
│   │   └── tender.ts
│   ├── pages/               # 頁面路由
│   │   ├── index.vue        # 首頁
│   │   ├── tender-search.vue # 標售搜尋
│   │   ├── crawl-tasks-demo.vue # 爬蟲任務示範
│   │   └── link-tasks.vue    # 連結任務管理
│   └── tests/               # E2E 測試
│
├── 後端檔案
│   └── server/
│       ├── main.py          # FastAPI 主應用
│       ├── config.py        # 配置管理
│       ├── start.py         # 啟動腳本
│       ├── test_simple.py   # 測試腳本
│       ├── requirements.txt # Python 依賴
│       └── README.md        # 後端文件
│
├── 配置檔案
│   ├── nuxt.config.ts       # Nuxt 配置 (含 API 代理)
│   ├── tailwind.config.js   # Tailwind CSS 配置
│   ├── package.json         # 前端依賴
│   └── tsconfig.json        # TypeScript 配置
│
├── 啟動腳本
│   └── start-fullstack.sh   # 全端啟動腳本
│
└── 文件
    ├── README.md                 # 本文件
    ├── QUICK_START_GUIDE.md      # 快速開始
    ├── VERIFICATION_CHECKLIST.md # 上線前檢核
    └── REQUIREMENTS.md           # 需求摘要
```

---

## 🛠️ 技術棧

### 前端
- **框架**: Nuxt 3 (Vue 3 + SSR)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: Pinia
- **HTTP 客戶端**: Axios（`composables/useApi.ts`）
- **測試**: Playwright (E2E)

### 後端
- **框架**: FastAPI
- **語言**: Python 3.8+
- **ORM**: SQLAlchemy
- **驗證**: Pydantic
- **資料庫**: SQLite (開發) / PostgreSQL (生產)
- **文件**: OpenAPI (Swagger)

---

## 📊 API 端點（`tfasc-scraper` 服務；路徑相對於主機根，實際前綴為 `/api/v1`）

| 方法 | 端點 | 功能 |
|------|------|------|
| `GET` | `/api/v1/crawl-tasks/` | 取得任務列表（建議尾隨斜線） |
| `POST` | `/api/v1/crawl-tasks/` | 建立新任務 |
| `POST` | `/api/v1/crawl-tasks/import-latest` | 自 TFASC 官網批號欄匯入爬蟲任務 |
| `GET` | `/api/v1/crawl-tasks/{id}` | 取得單一任務 |
| `PUT` | `/api/v1/crawl-tasks/{id}` | 更新任務狀態 |
| `DELETE` | `/api/v1/crawl-tasks/{id}` | 刪除任務 |
| `POST` | `/api/v1/crawl-tasks/batch-delete` | 批次刪除 |
| `POST` | `/api/v1/crawl-tasks/{id}/retry` | 重試失敗任務 |
| `GET` | `/api/v1/tenders/search` | 標售進階搜尋（`keyword`、`region`、`skip`、`limit` 等） |
| `GET` | `/health` | 健康檢查 |

---

## 🧪 測試

### 前端測試
```bash
# E2E 測試
pnpm run test:e2e

# TypeScript 檢查
pnpm run typecheck

# 建置測試
pnpm run build
```

### 後端測試
```bash
# 簡單 API 測試
cd server
python test_simple.py

# 完整測試套件
pytest test_main.py -v
```

### 整合測試
```bash
# 啟動全端應用
./start-fullstack.sh

# 訪問示範頁面測試功能
# http://localhost:3000/crawl-tasks-demo
```

---

## 📝 開發指南

### 環境需求
- **Node.js**: 18+
- **pnpm**: 9+（**唯一**支援的前端套件管理；勿提交 `package-lock.json`）
- **Python**: 3.8+（僅在使用內嵌 `server/` 時）
- **pip**: 內嵌後端依賴

### 開發工作流程

1. **啟動開發環境**:
   ```bash
   ./start-fullstack.sh
   ```

2. **前端開發**:
   - 頁面和元件開發在 `pages/` 和 `components/`
   - 狀態管理使用 Pinia stores
   - 樣式使用 Tailwind CSS

3. **後端開發**:
   - API 端點在 `server/main.py`
   - 資料模型在 SQLAlchemy
   - 配置在 `server/config.py`

4. **型別安全**:
   - 前端使用 TypeScript
   - 後端使用 Pydantic
   - 前後端型別完全統一

---

## 🔐 安全特性

- **輸入驗證**: Pydantic 嚴格型別驗證
- **SQL 注入防護**: SQLAlchemy ORM
- **CORS 保護**: 跨域請求限制
- **URL 驗證**: 任務 URL 格式檢查
- **業務邏輯保護**: 防止無效操作

---

## 🚀 部署

### 開發環境
```bash
./start-fullstack.sh
```

### 生產環境

**後端（建議）**：使用 `CrawlingData/tfasc-scraper` 的 Docker 映像與 `docker-compose.yml`，見 [deployment_guide.md](../CrawlingData/tfasc-scraper/deployment_guide.md)。

**後端（不建議，僅對應內嵌 `server/`）**：
```bash
cd server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**前端**:
```bash
pnpm run build
pnpm run preview
```

### Docker

請直接使用 **`../CrawlingData/tfasc-scraper/docker-compose.yml`** 建置 API、資料庫與 worker；本目錄不再維護獨立後端 Dockerfile。

---

## 📚 文件與支援

- **API 文件**: http://localhost:8000/docs (Swagger UI)
- **後端 README**: [server/README.md](./server/README.md)
- **上線檢核**: [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)
- **快速開始**: [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)

---

## 🎯 使用範例

### 建立爬蟲任務
```bash
curl -X POST "http://localhost:8000/api/v1/crawl-tasks/" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/1234"}'
```

### 查詢任務列表
```bash
curl "http://localhost:8000/api/v1/crawl-tasks/?page=1&pageSize=10"
```

### 前端使用
```typescript
// 使用 Pinia store
const crawlTasksStore = useCrawlTasksStore()

// 建立任務
await crawlTasksStore.addTask('https://www.tfasc.gov.tw')

// 查詢任務
await crawlTasksStore.fetchTasks(1, 10)
```

---

## ⚠️ 重要提醒

### 包管理器
- **前端**: **僅** `pnpm`（`package.json` 已宣告 `packageManager` 與 `engines`）
- **後端**: 內嵌示範用 `pip` + 虛擬環境；正式環境以 `tfasc-scraper` Docker 為準

### 環境設定
- 前端會自動代理 `/api` 請求到後端
- 後端預設端口 8000，前端預設端口 3000
- 資料庫預設使用 SQLite (開發環境)

### 瀏覽器支援
- E2E 測試需安裝 Playwright 瀏覽器：`pnpm exec playwright install`

---

## 📞 總結

TFASC Portal 是一個完整的標售資料爬蟲任務管理系統，提供：

- ✅ **完整功能**: 任務管理、資料搜尋、狀態追蹤
- ✅ **現代技術**: Nuxt 3 + FastAPI + TypeScript
- ✅ **型別安全**: 前後端完全型別統一
- ✅ **即用性**: 一鍵啟動，立即可用
- ✅ **可擴展**: 清晰的架構設計

---

**🎯 快速開始**: `./start-fullstack.sh`  
**🌐 訪問地址**: http://localhost:3000  
**📚 API 文件**: http://localhost:8000/docs  

建立日期：2025年1月27日  
最後更新：2025年1月27日
