import type { TenderOut, TenderSearchParams } from '~/types/tender'

/**
 * 標售資訊 API Composable
 * 基於 TFASC API v0.4.3
 */
export const useTenders = () => {
  const { get, post } = useApi()
  const config = useRuntimeConfig()
  
  // 使用配置中的 API 基礎 URL
  const apiBaseUrl = config.public.apiBaseUrl as string

  /**
   * 取得標售列表 - v0.4.3 規範
   * @param params 查詢參數
   */
  const getTenders = async (params: TenderSearchParams = {}): Promise<TenderOut[]> => {
    const queryParams = new URLSearchParams()

    // Docker / FastAPI 使用 skip，不是 offset
    const skipVal = params.skip ?? params.offset ?? 0
    queryParams.append('skip', String(skipVal))
    if (params.limit !== undefined) {
      queryParams.append('limit', String(params.limit))
    }
    if (params.sort_by) {
      queryParams.append('sort_by', params.sort_by)
    }
    if (params.sort_order) {
      queryParams.append('sort_order', params.sort_order)
    }

    // 確保端點以斜線結尾以避免 307 重定向問題
    const url = queryParams.toString() 
      ? `/tenders/?${queryParams.toString()}`
      : `/tenders/`
    
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
   * 搜尋標售資訊 - v0.4.3 規範
   * @param params 搜尋參數
   */
  const searchTenders = async (params: Record<string, any>): Promise<TenderOut[]> => {
    try {
      // 使用專門的搜尋端點 /tenders/search/
      const queryParams = new URLSearchParams()
      
      const skipVal = params.offset ?? params.skip ?? 0
      queryParams.append('skip', String(skipVal))
      if (params.limit !== undefined) {
        queryParams.append('limit', String(params.limit))
      }

      // 後端 /tenders/search 目前不處理 sort；仍送出無害，或可於後端擴充
      if (params.sort_by) {
        queryParams.append('sort_by', params.sort_by)
      }
      if (params.sort_order) {
        queryParams.append('sort_order', params.sort_order)
      }
      
      // 日期範圍參數
      if (params.date_from) queryParams.append('date_from', params.date_from)
      if (params.date_to) queryParams.append('date_to', params.date_to)
      
      // 價格範圍參數
      if (params.price_min !== undefined && params.price_min !== null && params.price_min !== '') {
        queryParams.append('price_min', params.price_min.toString())
      }
      if (params.price_max !== undefined && params.price_max !== null && params.price_max !== '') {
        queryParams.append('price_max', params.price_max.toString())
      }
      
      if (
        params.keyword !== undefined &&
        params.keyword !== null &&
        String(params.keyword).trim() !== ''
      ) {
        queryParams.append('keyword', String(params.keyword).trim())
      } else if (
        params.tender_no !== undefined &&
        params.tender_no !== null &&
        String(params.tender_no).trim() !== ''
      ) {
        // 向後相容：舊欄位 tender_no 視為 keyword
        queryParams.append('keyword', String(params.tender_no).trim())
      }
      
      // 後端參數名為 zoning（模糊比對），對應前端的 location / zoning
      if (params.location && params.location.toString().trim() !== '') {
        queryParams.append('zoning', params.location.toString())
      } else if (params.zoning && params.zoning.toString().trim() !== '') {
        queryParams.append('zoning', params.zoning.toString())
      }

      if (
        params.region !== undefined &&
        params.region !== null &&
        String(params.region).trim() !== ''
      ) {
        queryParams.append('region', String(params.region).trim())
      }

      // 不可使用 /tenders/search/（會 307）；與 FastAPI 路由一致不加尾隨斜線
      const url = queryParams.toString()
        ? `/tenders/search?${queryParams.toString()}`
        : '/tenders/search'
      
      console.log('🔍 搜尋 API URL (v0.4.3):', url)
      console.log('🔍 搜尋參數:', Object.fromEntries(queryParams))
      
      return await get<TenderOut[]>(url)
    } catch (error: any) {
      console.error('搜尋標售資訊失敗:', error)
      
      // 如果搜尋端點失敗，回退到使用 getTenders（向後兼容）
      console.log('📌 回退到使用 getTenders...')
      const fallbackParams: TenderSearchParams = {
        offset: params.offset ?? params.skip ?? 0,
        limit: params.limit,
        sort_by: params.sort_by || 'updated_at',
        sort_order: params.sort_order || 'desc',
      }
      
      return await getTenders(fallbackParams)
    }
  }

  /**
   * 檢查 API 健康狀態
   */
  const checkHealth = async (): Promise<{ status: string }> => {
    // 健康檢查端點在根路徑
    const url = import.meta.dev
      ? '/health'  // 開發環境使用代理
      : `${apiBaseUrl.replace('/api/v1', '')}/health`  // 生產環境直接訪問
    
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
    searchTenders,
    syncTenders,
    checkHealth
  }
} 