import { defineStore } from 'pinia'
import type { CrawlTask, CrawlTaskCreate, CrawlTasksResponse, CrawlTasksParams, TaskStatus } from '~/types/crawlTask'
import type { ApiError } from '~/composables/useApi'

export const useCrawlTasksStore = defineStore('crawlTasks', {
  // 狀態定義
  state: () => ({
    tasks: [] as CrawlTask[],
    loading: false,
    error: null as string | null,
    pagination: {
      total: 0,
      page: 1,
      pageSize: 10
    }
  }),

  // Getters (計算屬性)
  getters: {
    // 依狀態篩選任務
    pendingTasks: (state) => state.tasks.filter(task => task.status === 'pending'),
    runningTasks: (state) => state.tasks.filter(task => task.status === 'running'),
    doneTasks: (state) => state.tasks.filter(task => task.status === 'done'),
    failedTasks: (state) => state.tasks.filter(task => task.status === 'failed'),
    
    // 統計數據
    taskStats: (state) => ({
      total: state.tasks.length,
      pending: state.tasks.filter(task => task.status === 'pending').length,
      running: state.tasks.filter(task => task.status === 'running').length,
      done: state.tasks.filter(task => task.status === 'done').length,
      failed: state.tasks.filter(task => task.status === 'failed').length,
    }),

    // 取得單一任務
    getTaskById: (state) => (id: number): CrawlTask | undefined => {
      return state.tasks.find(task => task.id === id)
    },

    // 依 URL 搜尋任務
    getTaskByUrl: (state) => (url: string): CrawlTask | undefined => {
      return state.tasks.find(task => task.url === url)
    }
  },

  // Actions (方法)
  actions: {
    /**
     * 取得所有爬蟲任務
     * @param params 查詢參數
     */
    async fetchTasks(params: CrawlTasksParams = {}) {
      this.loading = true
      this.error = null

      try {
        const { useApi } = await import('~/composables/useApi')
        const { get } = useApi()
        
        // 建立查詢參數
        const queryParams = new URLSearchParams()
        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
        
        const url = `/crawl-tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        
        const response = await get<CrawlTask[]>(url)
        
        // 如果是陣列格式，直接使用；如果是分頁格式，解構
        if (Array.isArray(response)) {
          this.tasks = response
          this.pagination.total = response.length
        } else {
          // 假設是 CrawlTasksResponse 格式
          const paginatedResponse = response as unknown as CrawlTasksResponse
          this.tasks = paginatedResponse.tasks
          this.pagination = {
            total: paginatedResponse.total,
            page: paginatedResponse.page,
            pageSize: paginatedResponse.pageSize
          }
        }

        return this.tasks
      } catch (error: any) {
        this.error = error.message || '取得爬蟲任務失敗'
        console.error('取得爬蟲任務失敗:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 新增爬蟲任務
     * @param url 爬蟲網址
     */
    async createTask(url: string) {
      this.loading = true
      this.error = null

      try {
        // 檢查 URL 是否已存在
        const existingTask = this.getTaskByUrl(url)
        if (existingTask) {
          throw new Error('此連結已存在於任務列表中')
        }

        // 驗證 URL 格式
        if (!this.isValidUrl(url)) {
          throw new Error('請輸入有效的網址格式')
        }

        const { useApi } = await import('~/composables/useApi')
        const { post } = useApi()
        
        const taskData: CrawlTaskCreate = { url }
        const newTask = await post<CrawlTask>('/crawl-tasks', taskData)

        // 將新任務加入到列表開頭
        this.tasks.unshift(newTask)
        this.pagination.total += 1

        return newTask
      } catch (error: any) {
        this.error = error.message || '新增爬蟲任務失敗'
        console.error('新增爬蟲任務失敗:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 取得單一任務
     * @param taskId 任務 ID
     */
    async getTask(taskId: number) {
      try {
        const { useApi } = await import('~/composables/useApi')
        const { get } = useApi()
        
        const task = await get<CrawlTask>(`/crawl-tasks/${taskId}`)

        // 更新本地狀態
        const index = this.tasks.findIndex(t => t.id === taskId)
        if (index !== -1) {
          this.tasks[index] = task
        } else {
          this.tasks.push(task)
        }

        return task
      } catch (error: any) {
        this.error = error.message || '取得任務詳情失敗'
        console.error('取得任務詳情失敗:', error)
        throw error
      }
    },

    /**
     * 刪除爬蟲任務
     * @param taskId 任務 ID
     */
    async deleteTask(taskId: number) {
      try {
        const { useApi } = await import('~/composables/useApi')
        const { delete: deleteMethod } = useApi()
        
        await deleteMethod(`/crawl-tasks/${taskId}`)

        // 從本地狀態移除
        const index = this.tasks.findIndex(task => task.id === taskId)
        if (index !== -1) {
          this.tasks.splice(index, 1)
          this.pagination.total -= 1
        }

        return true
      } catch (error: any) {
        this.error = error.message || '刪除任務失敗'
        console.error('刪除任務失敗:', error)
        throw error
      }
    },

    /**
     * 輪詢任務狀態
     * @param taskId 任務 ID
     * @param interval 輪詢間隔（毫秒）
     */
    async pollTaskStatus(taskId: number, interval: number = 5000) {
      const poll = async () => {
        try {
          const task = await this.getTask(taskId)
          
          // 如果任務完成或失敗，停止輪詢
          if (task.status === 'done' || task.status === 'failed') {
            return task
          }
          
          // 繼續輪詢
          setTimeout(() => poll(), interval)
        } catch (error) {
          console.error('輪詢任務狀態失敗:', error)
        }
      }
      
      return poll()
    },

    /**
     * 清空錯誤狀態
     */
    clearError() {
      this.error = null
    },

    /**
     * 重設 store 狀態
     */
    $reset() {
      this.tasks = []
      this.loading = false
      this.error = null
      this.pagination = {
        total: 0,
        page: 1,
        pageSize: 10
      }
    },

    /**
     * 驗證 URL 格式
     */
    isValidUrl(url: string): boolean {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }
  }
}) 