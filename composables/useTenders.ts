import type { TenderOut, TenderSearchParams } from '~/types/tender'

/**
 * 標售資訊 API Composable
 * 基於 TFASC API v1.0.0
 */
export const useTenders = () => {
  const { get, post } = useApi()
  const config = useRuntimeConfig()
  
  // 使用配置中的 API 基礎 URL
  const apiBaseUrl = config.public.apiBaseUrl as string

  /**
   * 取得標售列表
   * @param params 查詢參數
   */
  const getTenders = async (params: TenderSearchParams = {}): Promise<TenderOut[]> => {
    const queryParams = new URLSearchParams()
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.from) queryParams.append('from', params.from)
    if (params.to) queryParams.append('to', params.to)

    const url = `/tenders/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    try {
      return await get<TenderOut[]>(url)
    } catch (error: any) {
      console.error('取得標售列表失敗:', error)
      throw error
    }
  }

  /**
   * 取得單筆標售資訊
   * @param tenderId 標售ID
   */
  const getTender = async (tenderId: number): Promise<TenderOut> => {
    const url = `/tenders/${tenderId}`
    
    try {
      return await get<TenderOut>(url)
    } catch (error: any) {
      console.error('取得標售資訊失敗:', error)
      throw error
    }
  }

  /**
   * 手動觸發同步 (需要管理員權限)
   * @param token JWT Token
   */
  const syncTenders = async (token?: string): Promise<{ message: string; status: string; triggered_by?: string }> => {
    const url = `/tenders/sync`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      return await post<{ message: string; status: string; triggered_by?: string }>(
        url,
        {},
        { headers }
      )
    } catch (error: any) {
      console.error('觸發同步失敗:', error)
      throw error
    }
  }

  /**
   * 檢查 API 健康狀態
   */
  const checkHealth = async (): Promise<{ status: string }> => {
    // 健康檢查端點在根路徑
    const healthApiUrl = apiBaseUrl.replace('/api/v1', '')
    const url = `${healthApiUrl}/health`
    
    try {
      return await get<{ status: string }>(url)
    } catch (error: any) {
      console.error('健康檢查失敗:', error)
      throw error
    }
  }

  return {
    getTenders,
    getTender,
    syncTenders,
    checkHealth
  }
} 