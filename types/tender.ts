// 標售資訊類型定義（基於 API 文件）
export interface TenderOut {
  id: number
  tender_no: string
  receive_start: string
  receive_end: string
  announcement: string
  area_ping?: number | null
  area_m2?: number | null
  zoning?: string | null
  reserve_price: number
  deposit: number
  note?: string | null
  source_url: string
  updated_at: string
  property_mark?: string | null
}

// 標售查詢參數
export interface TenderSearchParams {
  skip?: number
  limit?: number
  from?: string
  to?: string
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