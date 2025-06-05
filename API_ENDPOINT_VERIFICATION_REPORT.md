# 🔍 API 端點與後端對應驗證報告

**驗證日期**: 2025-01-27  
**前端版本**: Nuxt 3 TFASC Portal  
**後端API版本**: v1.0.0  
**需求文件**: REQUIREMENTS.md v1.0  

---

## 📊 驗證結果概覽

### 🎯 **整體對應度評估**
- **已對應**: 4/6 端點 (66.7%)
- **缺失**: 2/6 端點 (33.3%)  
- **狀態**: ⚠️ **需要後端開發**

---

## ✅ 已對應的API端點

### 1. **標售資料管理** (完整對應)

| 前端調用 | 後端提供 | 方法 | 狀態 | 實作位置 |
|---------|---------|------|------|----------|
| `/tenders/` | `/api/v1/tenders/` | GET | 🟢 完成 | `composables/useTenders.ts:25` |
| `/tenders/{id}` | `/api/v1/tenders/{id}` | GET | 🟢 完成 | `composables/useTenders.ts:40` |
| `/tenders/sync` | `/api/v1/tenders/sync` | POST | 🟢 完成 | `composables/useTenders.ts:55` |
| `/health` | `/health` | GET | 🟢 完成 | `composables/useTenders.ts:82` |

**驗證詳情:**
```typescript
// ✅ 前端調用格式正確
const getTenders = async (params: TenderSearchParams = {}): Promise<TenderOut[]> => {
  const url = `/tenders/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return await get<TenderOut[]>(url)
}

// ✅ 支援的查詢參數
interface TenderSearchParams {
  skip?: number     // 分頁偏移
  limit?: number    // 每頁數量
  from?: string     // 開始日期
  to?: string       // 結束日期
}
```

---

## ❌ 缺失的API端點

### 1. **爬蟲任務管理** (需求已定義，後端未實作)

根據 **REQUIREMENTS.md** 需求文件第53-58行：

```yaml
需要的API端點:
- POST /crawl-tasks  # 建立爬蟲任務
- GET /crawl-tasks   # 查詢任務清單
```

**前端已實作** (`composables/useCrawlTasks.ts`):
```typescript
// ✅ 前端準備就緒
const createCrawlTask = async (payload: CreateCrawlTaskPayload): Promise<CrawlTask> => {
  return await post<CrawlTask>('/crawl-tasks', payload)  // ❌ 後端未提供
}

const getCrawlTasks = async (params: { skip?: number; limit?: number } = {}): Promise<CrawlTask[]> => {
  const url = `/crawl-tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return await get<CrawlTask[]>(url)  // ❌ 後端未提供
}
```

**後端缺失狀態**: ❌ API_DOCUMENTATION_DELIVERY.md 未包含這些端點

---

### 2. **前端額外使用的端點** (未在需求中定義)

**Link Tasks 相關** (`stores/linkTasks.ts`):
```typescript
// 前端使用但需求未定義的端點
- GET /link-tasks?page={}&pageSize={}     // 第86行
- POST /link-tasks                        // 第135行  
- PUT /link-tasks/{id}                    // 第172行
- DELETE /link-tasks/{id}                 // 第201行
- POST /link-tasks/batch-delete           // 第227行
- POST /link-tasks/{id}/retry             // 第250行
```

---

## 🔧 問題分析

### 1. **API端點命名混亂**
```yaml
問題: 前端同時使用兩套不同的端點命名
- /crawl-tasks  (composables/useCrawlTasks.ts)
- /link-tasks   (stores/linkTasks.ts)

原因: 開發過程中沒有統一API設計
影響: 後端不清楚該實作哪套端點
```

### 2. **需求與實作不一致**
```yaml
REQUIREMENTS.md 定義:
- 只提到 /crawl-tasks 端點

前端實際使用:
- /crawl-tasks (部分使用)
- /link-tasks (主要使用)

後端API文檔:
- 都沒有實作 ❌
```

### 3. **後端開發滯後**
```yaml
根據 API_DOCUMENTATION_DELIVERY.md:
- 只實作了 tenders 相關端點
- 任務管理端點完全缺失
- 需要按照需求文件補充開發
```

---

## 📋 修復建議

### 1. **統一API端點設計** (優先級: 🔴 高)

建議採用 **REQUIREMENTS.md** 中定義的 `/crawl-tasks` 命名：

```yaml
標準API端點:
- POST /api/v1/crawl-tasks           # 建立爬蟲任務
- GET /api/v1/crawl-tasks            # 查詢任務清單
- GET /api/v1/crawl-tasks/{id}       # 查詢單個任務
- PUT /api/v1/crawl-tasks/{id}       # 更新任務狀態
- DELETE /api/v1/crawl-tasks/{id}    # 刪除任務
```

### 2. **前端代碼修正** (優先級: 🟡 中)

需要統一前端的API調用：

```typescript
// 建議修改 stores/linkTasks.ts 中的端點名稱
// 從 /link-tasks 改為 /crawl-tasks

// 修改前:
const response = await get<LinkTasksResponse>(`/link-tasks?page=${page}&pageSize=${pageSize}`)

// 修改後:  
const response = await get<LinkTasksResponse>(`/crawl-tasks?page=${page}&pageSize=${pageSize}`)
```

### 3. **後端API開發** (優先級: 🔴 高)

需要後端開發團隊按照 REQUIREMENTS.md 實作：

```python
# 建議的後端API結構 (FastAPI)
@app.post("/api/v1/crawl-tasks")
async def create_crawl_task(task: CrawlTaskCreate):
    """建立爬蟲任務"""
    pass

@app.get("/api/v1/crawl-tasks") 
async def get_crawl_tasks(skip: int = 0, limit: int = 10):
    """查詢任務清單"""
    pass
```

### 4. **資料庫實作** (優先級: 🔴 高)

按照 REQUIREMENTS.md 第59-69行建立資料表：

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

---

## 📅 建議開發時程

| 週次 | 任務 | 負責方 | 優先級 |
|------|------|--------|--------|
| **W1** | 統一前端API端點命名 | 前端團隊 | 🔴 高 |
| **W1** | 實作 crawl_tasks 資料表 | 後端團隊 | 🔴 高 |
| **W2** | 實作 /crawl-tasks API端點 | 後端團隊 | 🔴 高 |
| **W2** | 前端整合測試 | 前端團隊 | 🟡 中 |
| **W3** | 端對端測試 | 測試團隊 | 🟡 中 |

---

## 🎯 驗收標準

### 功能驗收
- [ ] 可成功新增 TFASC 網址並建立任務 (`POST /crawl-tasks`)
- [ ] 可查詢任務列表並顯示狀態 (`GET /crawl-tasks`)
- [ ] 前端統一使用 `/crawl-tasks` 端點
- [ ] 所有API調用返回正確格式資料

### 技術驗收
- [ ] API 回應時間 < 500ms
- [ ] 錯誤處理完整 (401/403/404/422)
- [ ] 支援分頁查詢 (skip/limit 參數)
- [ ] 資料庫查詢效能良好

---

## 📞 後續追蹤

**問題回報**: 請至 GitHub Issues 回報API相關問題  
**進度追蹤**: 每週 API 開發進度 review  
**技術聯絡**: 前後端對接確認  

---

**🎯 驗證結論**: ⚠️ **需要後端開發補充 /crawl-tasks 相關端點**  
**📅 預計完成**: 2週內 (2025-02-10)  
**🚀 風險評估**: 中等風險，需要後端配合開發 