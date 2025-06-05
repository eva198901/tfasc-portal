import { defineStore } from 'pinia'
import type { ApiError } from '~/composables/useApi'

// 連結任務介面定義
export interface LinkTask {
  id: string
  url: string
  title?: string
  description?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  metadata?: {
    domain?: string
    contentType?: string
    size?: number
    lastChecked?: string
  }
}

// API 回應介面
interface LinkTasksResponse {
  tasks: LinkTask[]
  total: number
  page: number
  pageSize: number
}

export const useLinkTasksStore = defineStore('linkTasks', {
  // 狀態定義
  state: () => ({
    tasks: [] as LinkTask[],
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
    processingTasks: (state) => state.tasks.filter(task => task.status === 'processing'),
    completedTasks: (state) => state.tasks.filter(task => task.status === 'completed'),
    failedTasks: (state) => state.tasks.filter(task => task.status === 'failed'),
    
    // 統計數據
    taskStats: (state) => ({
      total: state.tasks.length,
      pending: state.tasks.filter(task => task.status === 'pending').length,
      processing: state.tasks.filter(task => task.status === 'processing').length,
      completed: state.tasks.filter(task => task.status === 'completed').length,
      failed: state.tasks.filter(task => task.status === 'failed').length,
    }),

    // 取得單一任務
    getTaskById: (state) => (id: string): LinkTask | undefined => {
      return state.tasks.find(task => task.id === id)
    },

    // 依 URL 搜尋任務
    getTaskByUrl: (state) => (url: string): LinkTask | undefined => {
      return state.tasks.find(task => task.url === url)
    }
  },

  // Actions (方法)
  actions: {
    /**
     * 取得所有連結任務
     * @param page 頁碼
     * @param pageSize 每頁數量
     */
    async fetchTasks(page: number = 1, pageSize: number = 10) {
      this.loading = true
      this.error = null

      try {
        // 在客戶端使用時需要動態導入 useApi
        const { useApi } = await import('~/composables/useApi')
        const { get } = useApi()
        
        const response = await get<LinkTasksResponse>(
          `/link-tasks?page=${page}&pageSize=${pageSize}`
        )

        this.tasks = response.tasks
        this.pagination = {
          total: response.total,
          page: response.page,
          pageSize: response.pageSize
        }

        return response
      } catch (error: any) {
        this.error = error.message || '取得連結任務失敗'
        console.error('取得連結任務失敗:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 新增連結任務
     * @param url 連結網址
     * @param options 額外選項
     */
    async addTask(url: string, options?: {
      title?: string
      description?: string
      priority?: 'low' | 'normal' | 'high'
    }) {
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

        // 在客戶端使用時需要動態導入 useApi
        const { useApi } = await import('~/composables/useApi')
        const { post } = useApi()
        
        const newTask = await post<LinkTask>('/link-tasks', {
          url,
          title: options?.title,
          description: options?.description,
          priority: options?.priority || 'normal',
          status: 'pending'
        })

        // 將新任務加入到列表開頭
        this.tasks.unshift(newTask)
        this.pagination.total += 1

        return newTask
      } catch (error: any) {
        this.error = error.message || '新增連結任務失敗'
        console.error('新增連結任務失敗:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新任務狀態
     * @param taskId 任務 ID
     * @param status 新狀態
     * @param metadata 額外元數據
     */
    async updateTaskStatus(
      taskId: string, 
      status: LinkTask['status'],
      metadata?: Partial<LinkTask['metadata']>
    ) {
      try {
        const { useApi } = await import('~/composables/useApi')
        const { put } = useApi()
        
        const updatedTask = await put<LinkTask>(`/link-tasks/${taskId}`, {
          status,
          metadata,
          updatedAt: new Date().toISOString()
        })

        // 更新本地狀態
        const index = this.tasks.findIndex(task => task.id === taskId)
        if (index !== -1) {
          this.tasks[index] = updatedTask
        }

        return updatedTask
      } catch (error: any) {
        this.error = error.message || '更新任務狀態失敗'
        console.error('更新任務狀態失敗:', error)
        throw error
      }
    },

    /**
     * 刪除連結任務
     * @param taskId 任務 ID
     */
    async deleteTask(taskId: string) {
      try {
        const { useApi } = await import('~/composables/useApi')
        const { delete: deleteMethod } = useApi()
        
        await deleteMethod(`/link-tasks/${taskId}`)

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
     * 批次操作：刪除多個任務
     * @param taskIds 任務 ID 陣列
     */
    async deleteTasks(taskIds: string[]) {
      try {
        const { useApi } = await import('~/composables/useApi')
        const { post } = useApi()
        
        await post('/link-tasks/batch-delete', { taskIds })

        // 從本地狀態移除
        this.tasks = this.tasks.filter(task => !taskIds.includes(task.id))
        this.pagination.total -= taskIds.length

        return true
      } catch (error: any) {
        this.error = error.message || '批次刪除任務失敗'
        console.error('批次刪除任務失敗:', error)
        throw error
      }
    },

    /**
     * 重新處理失敗的任務
     * @param taskId 任務 ID
     */
    async retryTask(taskId: string) {
      try {
        const { useApi } = await import('~/composables/useApi')
        const { post } = useApi()
        
        const updatedTask = await post<LinkTask>(`/link-tasks/${taskId}/retry`)

        // 更新本地狀態
        const index = this.tasks.findIndex(task => task.id === taskId)
        if (index !== -1) {
          this.tasks[index] = updatedTask
        }

        return updatedTask
      } catch (error: any) {
        this.error = error.message || '重試任務失敗'
        console.error('重試任務失敗:', error)
        throw error
      }
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
     * 工具方法：驗證 URL 格式
     * @param url 網址
     * @private
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