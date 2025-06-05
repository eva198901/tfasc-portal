/**
 * useLinkTasksStore 使用範例
 * 示範如何在 Vue 組件中使用連結任務 Pinia Store
 */

import { storeToRefs } from 'pinia'
import { useLinkTasksStore, type LinkTask } from '~/stores/linkTasks'

/**
 * 在 Vue 組件中的基本使用方式
 * 
 * <script setup>
 * // 1. 引用 store
 * const linkTasksStore = useLinkTasksStore()
 * 
 * // 2. 解構需要的狀態和方法
 * const { 
 *   tasks, 
 *   loading, 
 *   error, 
 *   pagination,
 *   taskStats,
 *   pendingTasks,
 *   completedTasks 
 * } = storeToRefs(linkTasksStore)
 * 
 * const {
 *   fetchTasks,
 *   addTask,
 *   updateTaskStatus,
 *   deleteTask,
 *   clearError
 * } = linkTasksStore
 * 
 * // 3. 頁面載入時取得任務列表
 * onMounted(async () => {
 *   try {
 *     await fetchTasks(1, 20)
 *   } catch (error) {
 *     console.error('載入任務失敗:', error)
 *   }
 * })
 * 
 * // 4. 新增任務
 * const handleAddTask = async (url: string) => {
 *   try {
 *     await addTask(url, {
 *       title: '自動擷取標題',
 *       priority: 'normal'
 *     })
 *     ElMessage.success('任務新增成功！')
 *   } catch (error) {
 *     ElMessage.error(error.message)
 *   }
 * }
 * 
 * // 5. 處理任務狀態更新
 * const handleStatusChange = async (taskId: string, status: LinkTask['status']) => {
 *   try {
 *     await updateTaskStatus(taskId, status)
 *   } catch (error) {
 *     console.error('更新狀態失敗:', error)
 *   }
 * }
 * </script>
 */

/**
 * 在 Composable 中的進階使用
 */
export const useTaskManagement = () => {
  const store = useLinkTasksStore()
  
  // 批次新增多個連結
  const addMultipleTasks = async (urls: string[]) => {
    const results = []
    
    for (const url of urls) {
      try {
        const task = await store.addTask(url)
        results.push({ url, success: true, task })
      } catch (error: any) {
        results.push({ url, success: false, error: error.message })
      }
    }
    
    return results
  }

  // 重試所有失敗的任務
  const retryAllFailedTasks = async () => {
    const failedTasks = store.failedTasks
    const results = []
    
    for (const task of failedTasks) {
      try {
        await store.retryTask(task.id)
        results.push({ taskId: task.id, success: true })
      } catch (error: any) {
        results.push({ taskId: task.id, success: false, error: error.message })
      }
    }
    
    return results
  }

  // 清理已完成的舊任務
  const cleanupOldTasks = async (daysOld = 30) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const oldCompletedTasks = store.completedTasks.filter((task: LinkTask) => 
      new Date(task.updatedAt) < cutoffDate
    )
    
    if (oldCompletedTasks.length > 0) {
      const taskIds = oldCompletedTasks.map((task: LinkTask) => task.id)
      await store.deleteTasks(taskIds)
      return taskIds.length
    }
    
    return 0
  }

  // 取得任務統計報告
  const getTaskReport = () => {
    const stats = store.taskStats
    const recentTasks = store.tasks.filter((task: LinkTask) => {
      const taskDate = new Date(task.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return taskDate > weekAgo
    })

    return {
      totalTasks: stats.total,
      pendingTasks: stats.pending,
      processingTasks: stats.processing,
      completedTasks: stats.completed,
      failedTasks: stats.failed,
      recentTasksCount: recentTasks.length,
      successRate: stats.total > 0 ? 
        ((stats.completed / (stats.completed + stats.failed)) * 100).toFixed(2) + '%' : 
        '0%'
    }
  }

  return {
    addMultipleTasks,
    retryAllFailedTasks,
    cleanupOldTasks,
    getTaskReport
  }
}

/**
 * 實時監控任務狀態變化的 Composable
 */
export const useTaskMonitoring = () => {
  const store = useLinkTasksStore()
  const { tasks } = storeToRefs(store)

  // 監控處理中的任務
  const monitorProcessingTasks = () => {
    const processingTasks = computed(() => 
      tasks.value.filter((task: LinkTask) => task.status === 'processing')
    )

    // 每 30 秒檢查一次處理中任務的狀態
    // 注意：這裡使用 setInterval 替代 useIntervalFn（VueUse）
    let intervalId: NodeJS.Timeout | null = null

    const startMonitoring = () => {
      intervalId = setInterval(async () => {
        for (const task of processingTasks.value) {
          try {
            // 這裡可以呼叫 API 檢查任務狀態
            // const updatedTask = await checkTaskStatus(task.id)
            // await store.updateTaskStatus(task.id, updatedTask.status, updatedTask.metadata)
          } catch (error) {
            console.error(`檢查任務 ${task.id} 狀態失敗:`, error)
          }
        }
      }, 30000) // 30 秒
    }

    const stopMonitoring = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    return {
      processingTasks,
      startMonitoring,
      stopMonitoring
    }
  }

  return {
    monitorProcessingTasks
  }
}

/**
 * 任務篩選和搜尋的 Composable
 */
export const useTaskFilters = () => {
  const store = useLinkTasksStore()
  const { tasks } = storeToRefs(store)

  const searchQuery = ref('')
  const statusFilter = ref<LinkTask['status'] | 'all'>('all')
  const dateFilter = ref<'today' | 'week' | 'month' | 'all'>('all')

  const filteredTasks = computed(() => {
    let filtered = tasks.value

    // 狀態篩選
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter((task: LinkTask) => task.status === statusFilter.value)
    }

    // 搜尋篩選
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter((task: LinkTask) => 
        task.url.toLowerCase().includes(query) ||
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      )
    }

    // 日期篩選
    if (dateFilter.value !== 'all') {
      const now = new Date()
      let cutoffDate = new Date()

      switch (dateFilter.value) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((task: LinkTask) => 
        new Date(task.createdAt) >= cutoffDate
      )
    }

    return filtered
  })

  const clearFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
    dateFilter.value = 'all'
  }

  return {
    searchQuery,
    statusFilter,
    dateFilter,
    filteredTasks,
    clearFilters
  }
}

/**
 * 範例頁面組件
 * 
 * <template>
 *   <div class="link-tasks-page">
 *     <!-- 統計卡片 -->
 *     <div class="stats-grid">
 *       <div class="stat-card">
 *         <h3>總任務數</h3>
 *         <p>{{ taskStats.total }}</p>
 *       </div>
 *       <div class="stat-card">
 *         <h3>處理中</h3>
 *         <p>{{ taskStats.processing }}</p>
 *       </div>
 *       <div class="stat-card">
 *         <h3>已完成</h3>
 *         <p>{{ taskStats.completed }}</p>
 *       </div>
 *       <div class="stat-card">
 *         <h3>失敗</h3>
 *         <p>{{ taskStats.failed }}</p>
 *       </div>
 *     </div>
 * 
 *     <!-- 新增任務表單 -->
 *     <form @submit.prevent="handleAddTask">
 *       <input 
 *         v-model="newTaskUrl" 
 *         type="url" 
 *         placeholder="輸入連結網址..."
 *         required
 *       >
 *       <button type="submit" :disabled="loading">
 *         {{ loading ? '新增中...' : '新增任務' }}
 *       </button>
 *     </form>
 * 
 *     <!-- 篩選器 -->
 *     <div class="filters">
 *       <input v-model="searchQuery" placeholder="搜尋任務...">
 *       <select v-model="statusFilter">
 *         <option value="all">所有狀態</option>
 *         <option value="pending">待處理</option>
 *         <option value="processing">處理中</option>
 *         <option value="completed">已完成</option>
 *         <option value="failed">失敗</option>
 *       </select>
 *     </div>
 * 
 *     <!-- 任務列表 -->
 *     <div class="task-list">
 *       <div 
 *         v-for="task in filteredTasks" 
 *         :key="task.id"
 *         class="task-item"
 *         :class="`status-${task.status}`"
 *       >
 *         <div class="task-info">
 *           <h4>{{ task.title || task.url }}</h4>
 *           <p>{{ task.description }}</p>
 *           <small>{{ formatDate(task.createdAt) }}</small>
 *         </div>
 *         <div class="task-actions">
 *           <button 
 *             v-if="task.status === 'failed'"
 *             @click="retryTask(task.id)"
 *           >
 *             重試
 *           </button>
 *           <button @click="deleteTask(task.id)">
 *             刪除
 *           </button>
 *         </div>
 *       </div>
 *     </div>
 * 
 *     <!-- 錯誤訊息 -->
 *     <div v-if="error" class="error-message">
 *       {{ error }}
 *       <button @click="clearError">關閉</button>
 *     </div>
 *   </div>
 * </template>
 * 
 * <script setup>
 * const linkTasksStore = useLinkTasksStore()
 * const { searchQuery, statusFilter, filteredTasks } = useTaskFilters()
 * 
 * const { 
 *   tasks, 
 *   loading, 
 *   error, 
 *   taskStats 
 * } = storeToRefs(linkTasksStore)
 * 
 * const newTaskUrl = ref('')
 * 
 * const handleAddTask = async () => {
 *   if (!newTaskUrl.value) return
 *   
 *   try {
 *     await linkTasksStore.addTask(newTaskUrl.value)
 *     newTaskUrl.value = ''
 *   } catch (error) {
 *     // 錯誤已在 store 中處理
 *   }
 * }
 * 
 * onMounted(() => {
 *   linkTasksStore.fetchTasks()
 * })
 * </script>
 */ 