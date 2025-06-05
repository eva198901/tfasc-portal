// 爬蟲任務類型定義（基於新的 API 格式）
export interface CrawlTask {
  id: number
  url: string
  status: TaskStatus
  created_at: string
  finished_at?: string | null
}

export interface CrawlTaskCreate {
  url: string
}

export type TaskStatus = 'pending' | 'running' | 'done' | 'failed'

// API 回應格式
export interface CrawlTasksResponse {
  tasks: CrawlTask[]
  total: number
  page: number
  pageSize: number
}

// 查詢參數
export interface CrawlTasksParams {
  skip?: number
  limit?: number
  page?: number
  pageSize?: number
}

// API 錯誤格式
export interface ApiError {
  detail: string | Array<{
    loc: string[]
    msg: string
    type: string
    ctx?: any
  }>
} 