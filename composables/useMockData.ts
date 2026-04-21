import type { CrawlTask, TaskStatus } from '~/types/crawlTask'

/**
 * 模擬資料生成器
 * 用於測試和開發爬蟲任務功能
 */

const mockUrls = [
  'https://www.tfasc.gov.tw',
  'https://www.example.com',
  'https://github.com/nuxt/nuxt',
  'https://tailwindcss.com',
  'https://headlessui.com',
  'https://heroicons.com',
  'https://pinia.vuejs.org',
  'https://vuejs.org',
  'https://typescript.org',
  'https://stackoverflow.com',
  'https://developer.mozilla.org'
]

const statuses: TaskStatus[] = ['pending', 'running', 'done', 'failed']

/**
 * 生成隨機的爬蟲任務資料
 */
export const generateMockCrawlTask = (id?: number): CrawlTask => {
  const randomIndex = Math.floor(Math.random() * mockUrls.length)
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 過去30天內隨機時間
  const finishedAt = status === 'done' || status === 'failed' 
    ? new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString()
    : null

  return {
    id: id || Math.floor(Math.random() * 10000) + 1,
    url: mockUrls[randomIndex],
    status,
    created_at: createdAt.toISOString(),
    finished_at: finishedAt,
    item_count: status === 'done' ? Math.floor(Math.random() * 100) + 1 : undefined
  }
}

/**
 * 生成多個模擬爬蟲任務
 */
export const generateMockCrawlTasks = (count: number = 50): CrawlTask[] => {
  return Array.from({ length: count }, (_, index) => 
    generateMockCrawlTask(index + 1)
  )
}

/**
 * 用於開發測試的 composable
 */
export const useMockData = async () => {
  const { useCrawlTasksStore } = await import('~/stores/crawlTasks')
  const store = useCrawlTasksStore()

  /**
   * 載入模擬資料到 store
   */
  const loadMockData = (count: number = 25) => {
    const mockTasks = generateMockCrawlTasks(count)
    
    // 直接設定 store 的 tasks 狀態
    store.$patch({
      tasks: mockTasks,
      loading: false,
      error: null,
      pagination: {
        total: mockTasks.length,
        page: 1,
        pageSize: 10
      }
    })

    console.log(`已載入 ${count} 筆模擬爬蟲任務資料`)
    return mockTasks
  }

  /**
   * 清空所有資料
   */
  const clearData = () => {
    store.$reset()
    console.log('已清空所有爬蟲任務資料')
  }

  /**
   * 新增單一模擬任務
   */
  const addMockTask = (status?: TaskStatus) => {
    const mockTask = generateMockCrawlTask()
    if (status) {
      mockTask.status = status
    }

    store.tasks.unshift(mockTask)
    store.pagination.total += 1

    console.log('已新增模擬任務:', mockTask.url)
    return mockTask
  }

  /**
   * 模擬狀態變化
   */
  const simulateStatusChanges = () => {
    const pendingTasks = store.tasks.filter((task: CrawlTask) => task.status === 'pending')
    const runningTasks = store.tasks.filter((task: CrawlTask) => task.status === 'running')

    // 將一些 pending 任務變成 running
    pendingTasks.slice(0, 2).forEach((task: CrawlTask) => {
      task.status = 'running'
    })

    // 將一些 running 任務隨機完成或失敗
    runningTasks.slice(0, 2).forEach((task: CrawlTask) => {
      task.status = Math.random() > 0.3 ? 'done' : 'failed'
      task.finished_at = new Date().toISOString()
      if (task.status === 'done') {
        task.item_count = Math.floor(Math.random() * 100) + 1
      }
    })

    console.log('已模擬任務狀態變化')
  }

  return {
    loadMockData,
    clearData,
    addMockTask,
    simulateStatusChanges,
    generateMockCrawlTask,
    generateMockCrawlTasks
  }
}

/**
 * 自動載入模擬資料（僅在開發環境）
 */
export const autoLoadMockDataInDev = async () => {
  // 只在開發環境且瀏覽器環境中載入
  if (process.dev && process.client) {
    const mockData = await useMockData()
    
    // 延遲載入以確保 store 已初始化
    setTimeout(() => {
      mockData.loadMockData(30)
    }, 1000)
  }
} 