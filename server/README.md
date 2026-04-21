# TFASC Portal 後端 API（`server/` 內嵌示範）

> **與正式環境的關係**  
> 正式上線的 **API、PostgreSQL、Redis、Celery 爬蟲** 請以同工作區 **`CrawlingData/tfasc-scraper`**（Docker Compose）為準，見該目錄 [README.md](../../CrawlingData/tfasc-scraper/README.md)、[deployment_guide.md](../../CrawlingData/tfasc-scraper/deployment_guide.md)。  
（自本檔 `tfasc-portal/server/README.md` 起算，上兩層為工作區根目錄。）  
> 此 `server/` 目錄主要搭配 `start-fullstack.sh` 做本機快速體驗，路由與資料庫設定**未必**與 `tfasc-scraper` 完全一致。

## 📋 概述

本目錄為標售資料爬蟲任務管理的 FastAPI 示範應用，提供爬蟲任務 CRUD、狀態更新、批次操作等介面說明。

## 🚀 功能特色

- ✅ **完整的 CRUD 操作**: 建立、讀取、更新、刪除爬蟲任務
- ✅ **分頁查詢**: 支援多種分頁參數格式
- ✅ **狀態管理**: 任務狀態追蹤 (pending → running → done/failed)
- ✅ **批次操作**: 批次刪除多個任務
- ✅ **重試機制**: 重試失敗的任務
- ✅ **資料驗證**: 完整的輸入驗證和錯誤處理
- ✅ **API 文件**: 自動生成的 OpenAPI 規格文件

## 📊 API 端點

### 任務管理

| 方法 | 端點 | 描述 |
|------|------|------|
| `GET` | `/api/v1/crawl-tasks/` | 取得任務列表（建議帶尾隨斜線） |
| `POST` | `/api/v1/crawl-tasks/` | 建立新任務 |
| `GET` | `/api/v1/crawl-tasks/{id}` | 取得單一任務 |
| `PUT` | `/api/v1/crawl-tasks/{id}` | 更新任務狀態 |
| `DELETE` | `/api/v1/crawl-tasks/{id}` | 刪除任務 |
| `POST` | `/api/v1/crawl-tasks/batch-delete` | 批次刪除任務 |
| `POST` | `/api/v1/crawl-tasks/{id}/retry` | 重試失敗任務 |

### 系統端點

| 方法 | 端點 | 描述 |
|------|------|------|
| `GET` | `/` | API 根路徑資訊 |
| `GET` | `/health` | 健康檢查 |
| `GET` | `/docs` | API 文件 (Swagger UI) |

## 🛠️ 安裝與設定

### 環境需求

- Python 3.8+
- pip 或 poetry

### 安裝步驟

1. **安裝依賴**:
```bash
cd server
pip install -r requirements.txt
```

2. **設定環境變數** (可選):
```bash
export DATABASE_URL="sqlite:///./crawl_tasks.db"
export DEBUG="true"
export HOST="0.0.0.0"
export PORT="8000"
```

3. **啟動伺服器**:
```bash
# 方法 1: 直接執行主程式
python main.py

# 方法 2: 使用啟動腳本
python start.py

# 方法 3: 使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

4. **訪問 API 文件**:
開啟瀏覽器訪問 `http://localhost:8000/docs`

## 📝 使用範例

### 建立爬蟲任務

```bash
curl -X POST "http://localhost:8000/api/v1/crawl-tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.tfasc.gov.tw"
  }'
```

### 取得任務列表

```bash
# 基本查詢
curl "http://localhost:8000/api/v1/crawl-tasks"

# 分頁查詢
curl "http://localhost:8000/api/v1/crawl-tasks?page=1&pageSize=10"
```

### 更新任務狀態

```bash
curl -X PUT "http://localhost:8000/api/v1/crawl-tasks/1" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "running"
  }'
```

### 批次刪除任務

```bash
curl -X POST "http://localhost:8000/api/v1/crawl-tasks/batch-delete" \
  -H "Content-Type: application/json" \
  -d '{
    "taskIds": [1, 2, 3]
  }'
```

## 🗄️ 資料庫結構

```sql
CREATE TABLE crawl_tasks (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    item_count INTEGER NULL,
    
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'running', 'done', 'failed')
    )
);
```

## 🧪 測試

執行測試套件：

```bash
# 執行所有測試
pytest test_main.py -v

# 執行特定測試
pytest test_main.py::TestCrawlTasksAPI::test_create_crawl_task -v
```

## ⚙️ 配置選項

| 環境變數 | 預設值 | 描述 |
|----------|--------|------|
| `DATABASE_URL` | `sqlite:///./crawl_tasks.db` | 資料庫連接字串 |
| `HOST` | `0.0.0.0` | 伺服器綁定地址 |
| `PORT` | `8000` | 伺服器端口 |
| `DEBUG` | `false` | 除錯模式 |
| `SECRET_KEY` | `dev-secret-key...` | 安全密鑰 |
| `MAX_CONCURRENT_TASKS` | `5` | 最大並行任務數 |
| `TASK_TIMEOUT_SECONDS` | `300` | 任務超時時間 |

## 🏗️ 架構說明

### 專案結構

```
server/
├── main.py              # FastAPI 主應用程式
├── config.py            # 配置設定
├── start.py             # 啟動腳本
├── test_main.py         # API 測試
├── requirements.txt     # Python 依賴
├── README.md           # 本文件
└── tsconfig.json       # TypeScript 配置
```

### 資料模型

- **CrawlTaskDB**: SQLAlchemy 資料庫模型
- **CrawlTask**: Pydantic 回應模型
- **CrawlTaskCreate**: 建立任務請求模型
- **CrawlTaskUpdate**: 更新任務請求模型
- **BatchDeleteParams**: 批次刪除參數模型

### 狀態轉換

```
pending → running → done
        ↓
        failed → (retry) → pending
```

## 🔐 安全考量

- 輸入驗證: 使用 Pydantic 進行嚴格的輸入驗證
- SQL 注入防護: 使用 SQLAlchemy ORM
- CORS 設定: 限制允許的來源網域
- 狀態驗證: 防止無效的狀態轉換

## 📊 監控與日誌

- 健康檢查端點: `/health`
- 訪問日誌: 自動記錄所有請求
- 錯誤處理: 統一的 HTTP 異常處理
- 狀態統計: 即時的任務狀態統計

## 🚀 部署建議

### 開發環境
```bash
python start.py
```

### 生產環境
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker 部署
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📞 與前端整合

此後端 API 完全符合前端 Nuxt 3 應用程式的需求：

- 統一使用 `/api/v1/crawl-tasks` 端點前綴
- 支援前端期望的所有 HTTP 方法
- 回應格式與前端 TypeScript 型別完全匹配
- 提供完整的錯誤處理和狀態碼

## 🎯 下一步

1. **生產部署**: 配置生產環境資料庫 (PostgreSQL)
2. **任務執行器**: 實作實際的爬蟲任務執行邏輯
3. **監控系統**: 集成 Prometheus/Grafana 監控
4. **快取層**: 添加 Redis 快取提升效能
5. **API 版本控制**: 規劃 v2 API 版本策略 