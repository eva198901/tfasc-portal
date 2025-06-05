import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCrawlTasksStore } from '../crawlTasks'
import type { CrawlTask } from '~/types/crawlTask'

// Mock API
const mockApiGet = vi.fn()
const mockApiPost = vi.fn()
const mockApiDelete = vi.fn()

vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    get: mockApiGet,
    post: mockApiPost,
    delete: mockApiDelete
  })
}))

describe('crawlTasks store', () => {
  let store: ReturnType<typeof useCrawlTasksStore>

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
    setActivePinia(createPinia())
    store = useCrawlTasksStore()
    
    // 重置 mocks
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct initial state', () => {
      expect(store.tasks).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.pagination).toEqual({
        total: 0,
        page: 1,
        pageSize: 10
      })
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.tasks = mockTasks
    })

    it('filters pending tasks correctly', () => {
      expect(store.pendingTasks).toHaveLength(1)
      expect(store.pendingTasks[0].status).toBe('pending')
    })

    it('filters running tasks correctly', () => {
      expect(store.runningTasks).toHaveLength(1)
      expect(store.runningTasks[0].status).toBe('running')
    })

    it('filters done tasks correctly', () => {
      expect(store.doneTasks).toHaveLength(1)
      expect(store.doneTasks[0].status).toBe('done')
    })

    it('calculates task stats correctly', () => {
      const stats = store.taskStats
      expect(stats.total).toBe(3)
      expect(stats.pending).toBe(1)
      expect(stats.running).toBe(1)
      expect(stats.done).toBe(1)
      expect(stats.failed).toBe(0)
    })

    it('gets task by ID correctly', () => {
      const task = store.getTaskById(2)
      expect(task?.id).toBe(2)
      expect(task?.url).toBe('https://tfasc.com.tw/BidTender/example2')
    })

    it('gets task by URL correctly', () => {
      const task = store.getTaskByUrl('https://tfasc.com.tw/BidTender/example1')
      expect(task?.id).toBe(1)
    })
  })

  describe('actions', () => {
    describe('fetchTasks', () => {
      it('fetches tasks successfully', async () => {
        mockApiGet.mockResolvedValue(mockTasks)

        await store.fetchTasks()

        expect(mockApiGet).toHaveBeenCalledWith('/crawl-tasks')
        expect(store.tasks).toEqual(mockTasks)
        expect(store.loading).toBe(false)
        expect(store.error).toBe(null)
      })

      it('handles fetch tasks with parameters', async () => {
        mockApiGet.mockResolvedValue(mockTasks)

        await store.fetchTasks({ skip: 10, limit: 20 })

        expect(mockApiGet).toHaveBeenCalledWith('/crawl-tasks?skip=10&limit=20')
      })

      it('handles fetch tasks error', async () => {
        const errorMessage = 'Network error'
        mockApiGet.mockRejectedValue(new Error(errorMessage))

        try {
          await store.fetchTasks()
        } catch (error) {
          expect(store.error).toBe(errorMessage)
          expect(store.loading).toBe(false)
        }
      })
    })

    describe('createTask', () => {
      it('creates task successfully', async () => {
        const newTask = mockTasks[0]
        mockApiPost.mockResolvedValue(newTask)

        const result = await store.createTask('https://tfasc.com.tw/BidTender/new')

        expect(mockApiPost).toHaveBeenCalledWith('/crawl-tasks', {
          url: 'https://tfasc.com.tw/BidTender/new'
        })
        expect(result).toEqual(newTask)
        expect(store.tasks[0]).toEqual(newTask)
        expect(store.pagination.total).toBe(1)
      })

      it('validates URL format', async () => {
        try {
          await store.createTask('invalid-url')
        } catch (error: any) {
          expect(error.message).toBe('請輸入有效的網址格式')
        }
      })

      it('prevents duplicate URLs', async () => {
        store.tasks = [mockTasks[0]]

        try {
          await store.createTask(mockTasks[0].url)
        } catch (error: any) {
          expect(error.message).toBe('此連結已存在於任務列表中')
        }
      })

      it('handles create task error', async () => {
        const errorMessage = 'Server error'
        mockApiPost.mockRejectedValue(new Error(errorMessage))

        try {
          await store.createTask('https://tfasc.com.tw/BidTender/test')
        } catch (error) {
          expect(store.error).toBe(errorMessage)
        }
      })
    })

    describe('getTask', () => {
      it('gets single task successfully', async () => {
        const task = mockTasks[0]
        mockApiGet.mockResolvedValue(task)

        const result = await store.getTask(1)

        expect(mockApiGet).toHaveBeenCalledWith('/crawl-tasks/1')
        expect(result).toEqual(task)
      })

      it('updates existing task in store', async () => {
        store.tasks = [mockTasks[0]]
        const updatedTask = { ...mockTasks[0], status: 'done' as const }
        mockApiGet.mockResolvedValue(updatedTask)

        await store.getTask(1)

        expect(store.tasks[0].status).toBe('done')
      })

      it('adds new task to store if not exists', async () => {
        const newTask = mockTasks[1]
        mockApiGet.mockResolvedValue(newTask)

        await store.getTask(2)

        expect(store.tasks).toContain(newTask)
      })
    })

    describe('deleteTask', () => {
      it('deletes task successfully', async () => {
        store.tasks = [...mockTasks]
        store.pagination.total = 3
        mockApiDelete.mockResolvedValue(undefined)

        const result = await store.deleteTask(1)

        expect(mockApiDelete).toHaveBeenCalledWith('/crawl-tasks/1')
        expect(result).toBe(true)
        expect(store.tasks).toHaveLength(2)
        expect(store.pagination.total).toBe(2)
        expect(store.tasks.find(t => t.id === 1)).toBeUndefined()
      })

      it('handles delete task error', async () => {
        const errorMessage = 'Delete failed'
        mockApiDelete.mockRejectedValue(new Error(errorMessage))

        try {
          await store.deleteTask(1)
        } catch (error) {
          expect(store.error).toBe(errorMessage)
        }
      })
    })

    describe('pollTaskStatus', () => {
      it('polls task status until completion', async () => {
        const taskRunning = { ...mockTasks[0], status: 'running' as const }
        const taskDone = { ...mockTasks[0], status: 'done' as const }
        
        mockApiGet
          .mockResolvedValueOnce(taskRunning)
          .mockResolvedValueOnce(taskDone)

        // 使用較短的間隔進行測試
        await store.pollTaskStatus(1, 100)

        // 驗證 API 被調用了多次
        expect(mockApiGet).toHaveBeenCalledWith('/crawl-tasks/1')
      })
    })

    describe('utility methods', () => {
      it('validates URLs correctly', () => {
        expect(store.isValidUrl('https://example.com')).toBe(true)
        expect(store.isValidUrl('invalid-url')).toBe(false)
        expect(store.isValidUrl('')).toBe(false)
      })

      it('clears error correctly', () => {
        store.error = 'Some error'
        store.clearError()
        expect(store.error).toBe(null)
      })

      it('resets store correctly', () => {
        store.tasks = mockTasks
        store.loading = true
        store.error = 'Some error'
        store.pagination.total = 10

        store.$reset()

        expect(store.tasks).toEqual([])
        expect(store.loading).toBe(false)
        expect(store.error).toBe(null)
        expect(store.pagination).toEqual({
          total: 0,
          page: 1,
          pageSize: 10
        })
      })
    })
  })
}) 