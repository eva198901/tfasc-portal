# TFASC Portal - 前端介面開發需求文件

> **版本**: v1.0  
> **最後更新**: 2024-06-04  
> **狀態**: 正式需求 (唯一真實需求來源)

## 🎯 專案目標

建立一個完整的標案資料處理平台，提供以下核心功能：

1. **UI 能「新增待爬網址」** → 送往後端排程處理
2. **UI 能「查詢／篩選已入庫資料」** 並顯示結果

---

## 🏗️ 1. 架構選擇

| 技術組件 | 選擇方案 | 說明 |
|---------|---------|------|
| **前端框架** | Nuxt 3 + Tailwind CSS | 沿用現有技術棧 |
| **狀態管理** | Pinia | 集中管理 API 狀態 |
| **元件庫** | Headless UI + Heroicons | 快速成型，無樣式衝突 |
| **後端 API** | FastAPI | 沿用現有，新增 2 條端點 |

---

## 🧩 2. 介面模組設計

### ① Link Dashboard (連結管理面板)
**核心功能:**
- 顯示已提交網址清單
- 顯示「待爬／完成／失敗」狀態統計

**UI 元件:**
- Table + Pagination 分頁表格
- 「➕ 新增」按鈕 (開啟 modal)
- 狀態篩選器

### ② Add Link Modal (新增連結彈窗)
**核心功能:**
- 輸入 TFASC 連結
- 基本驗證（必須包含 BidTender/ 路徑）

**UI 元件:**
- Input + Submit 表單
- Toast 通知回饋
- 驗證錯誤提示

### ③ Tender Search (標案搜尋)
**核心功能:**
- 條件搜尋（標號、日期區間、分區等）
- 結果表格／快速匯出功能

**UI 元件:**
- Filter form (Date picker、Select 下拉選單)
- Data Table (可排序表格)
- 匯出按鈕

### ④ Tender Detail (標案詳情)
**核心功能:**
- 查看單筆標案完整欄位
- 顯示 JSON property_mark 資料

**UI 元件:**
- Drawer 側邊欄或獨立頁面
- JSON 資料檢視器

---

## 🔌 3. 必要 API 變更

### 新增 API 端點

| Method | Path | 說明 | Request Body | Response |
|--------|------|------|--------------|----------|
| `POST` | `/crawl-tasks` | 建立爬蟲任務 | `{ url: string }` | `{ task_id: string }` |
| `GET` | `/crawl-tasks` | 查詢任務清單 | query params | 任務列表 (status, created_at) |
| `GET` | `/tenders` | 既有端點擴充 | 增加 keyword、zoning 篩選 | 標案列表 |
| `GET` | `/tenders/{id}` | 既有端點 | - | 單筆標案詳情 |

### 資料庫變更

**新增表格**: `crawl_tasks`

```sql
CREATE TABLE crawl_tasks (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    error TEXT
);
```

**狀態列舉**: `status ENUM('pending', 'running', 'done', 'failed')`

---

## 📅 4. 開發里程碑

| 週次 | 前端開發重點 | 後端開發重點 | 驗收標準 |
|------|-------------|-------------|----------|
| **W1** | Nuxt 專案骨架、路由設計 | 建立 crawl_tasks 表、API scaffolding | `POST /crawl-tasks` 回傳 201 |
| **W2** | Link Dashboard 表格 + 分頁 | Celery/RabbitMQ 監聽任務 → 呼叫 Scrapy & 更新狀態 | 提交網址後，Dashboard 顯示 pending 狀態 |
| **W3** | Add Link Modal + Toast UX | 任務結果寫回 DB，觸發 Scrapy pipeline | 任務成功後狀態變更為 done |
| **W4** | Tender Search 表單 + 表格 | `/tenders` 增加複合篩選、多欄排序 | 可依標號/日期篩選出資料 |
| **W5** | Tender Detail 詳情頁、JSON 檢視器 | CORS、Auth（JWT）完善 | End-to-end E2E 測試通過 |

---

## 🧪 5. 測試策略 & CI

### 前端測試
- **單元測試**: Vitest
- **E2E 測試**: Playwright（測試新增網址→顯示流程）
- **覆蓋率目標**: ≥ 70%

### 後端測試
- **單元測試**: 新增 `/crawl-tasks` 相關測試
- **整合測試**: 接入現有 pytest pipeline
- **覆蓋率目標**: 維持 ≥ 80%

### CI/CD Pipeline
- 自動化測試觸發
- Coverage Gate 檢查
- 部署前驗證

---

## ⚠️ 6. 風險評估 & 注意事項

### 高風險項目
1. **TFASC 網址格式變更**
   - 影響: 前端驗證與後端解析失效
   - 應對: 建立格式監控機制，版本化驗證規則

2. **爬蟲任務大量排隊**
   - 影響: RabbitMQ 記憶體溢出，系統效能下降
   - 應對: 設定佇列限制 + 監控告警

3. **JSONB 查詢效能**
   - 影響: 大量 LIKE 查詢導致資料庫效能問題
   - 應對: 考慮使用 GIN 索引 + pg_trgm 擴充

### 技術債務
- 需要建立錯誤監控機制
- API 文件自動生成
- 前端元件庫標準化

---

## 📋 驗收清單

### 功能驗收
- [ ] 可成功新增 TFASC 網址並排程
- [ ] Dashboard 正確顯示任務狀態
- [ ] 篩選搜尋功能運作正常
- [ ] 標案詳情頁面資料完整
- [ ] JSON 資料檢視器可正常顯示

### 效能驗收
- [ ] 頁面載入時間 < 2 秒
- [ ] API 回應時間 < 500ms
- [ ] 支援 1000+ 筆資料分頁載入

### 相容性驗收
- [ ] 支援 Chrome/Firefox/Safari 最新版
- [ ] 響應式設計適配手機/平板
- [ ] API 文件完整且可測試

---

## 📞 聯絡資訊

**專案負責人**: [待填入]  
**技術負責人**: [待填入]  
**需求確認人**: [待填入]  

---

*本文件為專案唯一真實需求來源，任何變更需經過需求確認人審核批准。* 