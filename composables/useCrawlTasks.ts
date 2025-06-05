import type { CrawlTask, CrawlTaskCreate, CrawlTasksParams } from '~/types/crawlTask'

/**
 * 爬蟲任務管理 API Composable
 */
export const useCrawlTasks = () => {
  const { get, post } = useApi()

  /**
   * 創建新的爬蟲任務
   * @param payload 任務創建資料
   */
  const createCrawlTask = async (payload: CrawlTaskCreate): Promise<CrawlTask> => {
    try {
      return await post<CrawlTask>('/crawl-tasks', payload)
    } catch (error: any) {
      console.error('創建爬蟲任務失敗:', error)
      throw error
    }
  }

  /**
   * 取得任務列表
   * @param params 查詢參數
   */
  const getCrawlTasks = async (params: { skip?: number; limit?: number } = {}): Promise<CrawlTask[]> => {
    const queryParams = new URLSearchParams()
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

    const url = `/crawl-tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    try {
      return await get<CrawlTask[]>(url)
    } catch (error: any) {
      console.error('取得任務列表失敗:', error)
      throw error
    }
  }

  /**
   * 取得單個任務詳情
   * @param taskId 任務ID
   */
  const getCrawlTask = async (taskId: number): Promise<CrawlTask> => {
    try {
      return await get<CrawlTask>(`/crawl-tasks/${taskId}`)
    } catch (error: any) {
      console.error('取得任務詳情失敗:', error)
      throw error
    }
  }

  /**
   * 檢查任務狀態
   * @param taskId 任務ID
   */
  const checkTaskStatus = async (taskId: number): Promise<CrawlTask> => {
    return getCrawlTask(taskId)
  }

  return {
    createCrawlTask,
    getCrawlTasks,
    getCrawlTask,
    checkTaskStatus
  }
} 