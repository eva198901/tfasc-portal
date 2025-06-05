import type { LinkTask } from '~/stores/linkTasks'

/**
 * 模擬資料生成器
 * 用於測試和開發 LinkTable 組件
 */

const mockUrls = [
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

const mockTitles = [
  'Example Domain',
  'Nuxt: The Intuitive Web Framework',
  'Tailwind CSS - A utility-first CSS framework',
  'Headless UI - Unstyled, fully accessible UI components',
  'Heroicons - Beautiful hand-crafted SVG icons',
  'Pinia - The Vue Store that you will enjoy using',
  'Vue.js - The Progressive JavaScript Framework',
  'TypeScript - JavaScript with syntax for types',
  'Stack Overflow - Where Developers Learn',
  'MDN Web Docs - Resources for developers'
]

const mockDescriptions = [
  '網頁內容分析和資料擷取',
  '技術文件和 API 參考資料',
  'CSS 框架使用指南',
  '使用者介面組件庫',
  '圖標資源和設計素材',
  '狀態管理解決方案',
  '前端框架技術文件',
  '程式語言學習資源',
  '技術問答和解決方案',
  '網頁開發參考文件'
]

const statuses: LinkTask['status'][] = ['pending', 'processing', 'completed', 'failed']

/**
 * 生成隨機的連結任務資料
 */
export const generateMockLinkTask = (id?: string): LinkTask => {
  const randomIndex = Math.floor(Math.random() * mockUrls.length)
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 過去30天內隨機時間
  const updatedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) // 建立時間後的隨機時間

  return {
    id: id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url: mockUrls[randomIndex],
    title: mockTitles[randomIndex],
    description: mockDescriptions[randomIndex],
    status,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    metadata: {
      domain: new URL(mockUrls[randomIndex]).hostname,
      contentType: 'text/html',
      size: Math.floor(Math.random() * 1000000) + 10000, // 10KB to 1MB
      lastChecked: updatedAt.toISOString()
    }
  }
}

/**
 * 生成多個模擬連結任務
 */
export const generateMockLinkTasks = (count: number = 50): LinkTask[] => {
  return Array.from({ length: count }, (_, index) => 
    generateMockLinkTask(`task-${String(index + 1).padStart(3, '0')}`)
  )
}

/**
 * 用於開發測試的 composable
 */
export const useMockData = async () => {
  const { useLinkTasksStore } = await import('~/stores/linkTasks')
  const store = useLinkTasksStore()

  /**
   * 載入模擬資料到 store
   */
  const loadMockData = (count: number = 25) => {
    const mockTasks = generateMockLinkTasks(count)
    
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

    console.log(`已載入 ${count} 筆模擬連結任務資料`)
    return mockTasks
  }

  /**
   * 清空所有資料
   */
  const clearData = () => {
    store.$reset()
    console.log('已清空所有連結任務資料')
  }

  /**
   * 新增單一模擬任務
   */
  const addMockTask = (status?: LinkTask['status']) => {
    const mockTask = generateMockLinkTask()
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
    const pendingTasks = store.tasks.filter(task => task.status === 'pending')
    const processingTasks = store.tasks.filter(task => task.status === 'processing')

    // 將一些 pending 任務變成 processing
    pendingTasks.slice(0, 2).forEach(task => {
      task.status = 'processing'
      task.updatedAt = new Date().toISOString()
    })

    // 將一些 processing 任務隨機完成或失敗
    processingTasks.slice(0, 2).forEach(task => {
      task.status = Math.random() > 0.3 ? 'completed' : 'failed'
      task.updatedAt = new Date().toISOString()
    })

    console.log('已模擬任務狀態變化')
  }

  return {
    loadMockData,
    clearData,
    addMockTask,
    simulateStatusChanges,
    generateMockLinkTask,
    generateMockLinkTasks
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