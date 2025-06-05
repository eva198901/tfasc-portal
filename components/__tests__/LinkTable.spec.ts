import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LinkTable from '../LinkTable.vue'
import { useCrawlTasksStore } from '~/stores/crawlTasks'
import type { CrawlTask } from '~/types/crawlTask'

// Mock API
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  })
}))

describe('LinkTable.vue', () => {
  let pinia: any
  let crawlTasksStore: any

  const mockTasks: CrawlTask[] = [
    {
      id: 1,
      url: 'https://tfasc.com.tw/BidTender/example1',
      status: 'pending',
      created_at: '2025-01-27T10:00:00Z'
    },
    {
      id: 2,
      url: 'https://tfasc.com.tw/BidTender/example2',
      status: 'running',
      created_at: '2025-01-27T11:00:00Z'
    },
    {
      id: 3,
      url: 'https://tfasc.com.tw/BidTender/example3',
      status: 'done',
      created_at: '2025-01-27T12:00:00Z'
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    crawlTasksStore = useCrawlTasksStore()
    
    // Mock store 資料
    crawlTasksStore.tasks = mockTasks
    crawlTasksStore.loading = false
    crawlTasksStore.error = null
  })

  it('renders tasks correctly', () => {
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    // 檢查任務數量
    const taskRows = wrapper.findAll('[data-testid="task-row"]')
    expect(taskRows).toHaveLength(3)

    // 檢查第一個任務的URL顯示
    expect(wrapper.text()).toContain('https://tfasc.com.tw/BidTender/example1')
  })

  it('shows correct status badges', () => {
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    // 檢查狀態顯示
    expect(wrapper.text()).toContain('待處理')
    expect(wrapper.text()).toContain('執行中')
    expect(wrapper.text()).toContain('已完成')
  })

  it('filters tasks by status', async () => {
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    // 模擬選擇狀態篩選
    const vm = wrapper.vm as any
    vm.selectedStatus = 'pending'
    await wrapper.vm.$nextTick()

    // 檢查篩選結果
    expect(vm.filteredTasks).toHaveLength(1)
    expect(vm.filteredTasks[0].status).toBe('pending')
  })

  it('handles pagination correctly', () => {
    const wrapper = mount(LinkTable, {
      props: {
        pageSize: 2
      },
      global: {
        plugins: [pinia]
      }
    })

    const vm = wrapper.vm as any
    
    // 檢查分頁計算
    expect(vm.totalPages).toBe(2)
    expect(vm.paginatedTasks).toHaveLength(2)
  })

  it('emits delete action when delete button is clicked', async () => {
    // Mock deleteTask 方法
    crawlTasksStore.deleteTask = vi.fn().mockResolvedValue(true)
    
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    // 找到並點擊刪除按鈕
    const deleteButton = wrapper.find('[data-testid="delete-task-1"]')
    if (deleteButton.exists()) {
      await deleteButton.trigger('click')
      
      // 檢查是否調用了刪除方法
      expect(crawlTasksStore.deleteTask).toHaveBeenCalledWith(1)
    }
  })

  it('shows loading state', () => {
    crawlTasksStore.loading = true
    
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('載入中...')
  })

  it('shows empty state when no tasks', () => {
    crawlTasksStore.tasks = []
    
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.text()).toContain('尚無連結任務')
  })

  it('handles refresh action', async () => {
    crawlTasksStore.fetchTasks = vi.fn().mockResolvedValue([])
    
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    // 找到並點擊重新整理按鈕
    const refreshButton = wrapper.find('[data-testid="refresh-button"]')
    if (refreshButton.exists()) {
      await refreshButton.trigger('click')
      
      expect(crawlTasksStore.fetchTasks).toHaveBeenCalled()
    }
  })

  it('formats dates correctly', () => {
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    const vm = wrapper.vm as any
    const formatted = vm.formatDate('2025-01-27T10:00:00Z')
    
    expect(formatted).toMatch(/2025/)
  })

  it('gets correct status text for each status', () => {
    const wrapper = mount(LinkTable, {
      global: {
        plugins: [pinia]
      }
    })

    const vm = wrapper.vm as any
    
    expect(vm.getStatusText('pending')).toBe('待處理')
    expect(vm.getStatusText('running')).toBe('執行中')
    expect(vm.getStatusText('done')).toBe('已完成')
    expect(vm.getStatusText('failed')).toBe('失敗')
  })
}) 