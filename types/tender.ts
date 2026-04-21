// 標售資訊類型定義（基於 API 文件 v0.4.3）

// 🆕 v0.4.3 不動產標示項目
export interface PropertyMark {
  地號?: string                        // 土地地號
  建號?: string                        // 建物建號
  面積?: string                        // 面積描述 (如: "0.33㎡, 0.1坪")
  使用分區?: string                     // 使用分區 (僅地號)
}

export interface TenderOut {
  id: number                           // 資料庫 ID
  tender_no: string                    // 標售標號
  receive_start: string                // 收件開始日期 (YYYY-MM-DD)
  receive_end: string                  // 收件結束日期 (YYYY-MM-DD)
  announcement: string                 // 公告批次
  area_ping?: number | null            // 面積 (坪)
  area_m2?: number | null              // 面積 (平方公尺)
  zoning?: string | null               // 使用分區
  reserve_price: number                // 底價 (整數，單位：元)
  deposit: number                      // 保證金 (整數，單位：元)
  note?: string | null                 // 備註 (完整法律條文)
  property_mark?: PropertyMark[] | null // 🆕 不動產標示 (修正為PropertyMark[]格式)
  source_url: string                   // 資料來源 URL
  updated_at: string                   // 最後更新時間 (ISO 格式)
}

// 標售查詢參數 - v0.4.3 規範
export interface TenderSearchParams {
  // 分頁參數
  limit?: number
  offset?: number                    // v0.4.3: 取代 skip
  
  // 排序參數 (v0.4.3 新增)
  sort_by?: 'id' | 'updated_at' | 'receive_start' | 'reserve_price' | 'tender_no'
  sort_order?: 'asc' | 'desc'
  
  // 搜尋條件
  keyword?: string                   // 關鍵字搜尋（標號/公告/分區/備註）
  region?: string                     // 縣市／區域（地號／公告／備註）
  tender_no?: string
  location?: string                  // v0.4.3: 取代 zoning，支援更廣泛的地點搜尋
  date_from?: string
  date_to?: string
  price_min?: number
  price_max?: number
  
  // 向後兼容 (已棄用)
  skip?: number                      // @deprecated 使用 offset
  from?: string                      // @deprecated 使用 date_from  
  to?: string                        // @deprecated 使用 date_to
  zoning?: string                    // @deprecated 使用 location
}

// 爬蟲任務類型定義
export interface CrawlTaskOut {
  id: number                           // 任務 ID
  url: string                          // 爬取 URL
  status: "pending" | "running" | "done" | "failed"  // 任務狀態
  item_count?: number                  // 抓取到的資料筆數
  created_at: string                   // 建立時間
  finished_at?: string                 // 完成時間
}

// API 回應格式
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// 錯誤格式
export interface ApiError {
  detail: string | Array<{
    loc: string[]
    msg: string
    type: string
    ctx?: any
  }>
} 