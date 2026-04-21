import { defineStore } from 'pinia'
import type { TenderOut } from '~/types/tender'

export interface TenderSearchParams {
  tender_no?: string
  date_from?: string
  date_to?: string
  zoning?: string
  price_min?: number
  price_max?: number
  skip?: number
  limit?: number
}

export interface TenderState {
  tenders: TenderOut[]
  loading: boolean
  error: string | null
  searchParams: TenderSearchParams
  totalCount: number
  currentPage: number
}

export const useTendersStore = defineStore('tenders', {
  state: (): TenderState => ({
    tenders: [],
    loading: false,
    error: null,
    searchParams: {
      skip: 0,
      limit: 20
    },
    totalCount: 0,
    currentPage: 1
  }),

  getters: {
    hasSearchResults: (state) => state.tenders.length > 0,
    totalPages: (state) => Math.ceil(state.totalCount / (state.searchParams.limit || 20)),
    isSearching: (state) => state.loading
  },

  actions: {
    /**
     * 設定搜尋參數
     */
    setSearchParams(params: Partial<TenderSearchParams>) {
      this.searchParams = { ...this.searchParams, ...params }
    },

    /**
     * 清除搜尋參數
     */
    clearSearchParams() {
      this.searchParams = {
        skip: 0,
        limit: 20
      }
    },

    /**
     * 執行搜尋
     */
    async searchTenders(params?: Partial<TenderSearchParams>) {
      this.loading = true
      this.error = null

      try {
        // 更新搜尋參數
        if (params) {
          this.setSearchParams(params)
        }

        // 準備搜尋參數
        const searchParams = { ...this.searchParams }
        
        // 移除空值
        Object.keys(searchParams).forEach(key => {
          const value = searchParams[key as keyof TenderSearchParams]
          if (value === undefined || value === null || value === '') {
            delete searchParams[key as keyof TenderSearchParams]
          }
        })

        // 呼叫 API
        const { searchTenders } = useTenders()
        const results = await searchTenders(searchParams)

        this.tenders = results
        this.totalCount = results.length
        this.currentPage = Math.floor((this.searchParams.skip || 0) / (this.searchParams.limit || 20)) + 1

      } catch (error: any) {
        this.error = error.message || '搜尋標售資訊失敗'
        console.error('搜尋標售資訊失敗:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 重置搜尋結果
     */
    resetSearch() {
      this.tenders = []
      this.totalCount = 0
      this.currentPage = 1
      this.error = null
      this.clearSearchParams()
    },

    /**
     * 設定當前頁面
     */
    setCurrentPage(page: number) {
      this.currentPage = page
      this.searchParams.skip = (page - 1) * (this.searchParams.limit || 20)
    }
  }
}) 