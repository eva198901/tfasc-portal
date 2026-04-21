<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">爬蟲任務管理示範</h1>
      
      <!-- 新增任務表單 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">新增爬蟲任務</h2>
        <form @submit.prevent="handleAddTask" class="space-y-4">
          <div>
            <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
              網址 (URL)
            </label>
            <input
              id="url"
              v-model="newTaskUrl"
              type="url"
              required
              placeholder="https://example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              :disabled="loading || isImportingLatest || !newTaskUrl"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? '新增中...' : '新增任務' }}
            </button>
            <button
              type="button"
              :disabled="loading || isImportingLatest"
              class="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="importLatestTasks"
            >
              {{ isImportingLatest ? '抓取中...' : '抓取最新資訊' }}
            </button>
            <span v-if="importResultMessage" class="text-sm text-emerald-700">
              {{ importResultMessage }}
            </span>
          </div>
        </form>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="text-red-800">
            <strong>錯誤：</strong> {{ error }}
          </div>
          <button
            @click="clearError"
            class="ml-auto text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- 任務統計 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-blue-600">{{ taskStats.total }}</div>
          <div class="text-sm text-blue-800">總任務數</div>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-yellow-600">{{ taskStats.pending }}</div>
          <div class="text-sm text-yellow-800">等待中</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-green-600">{{ taskStats.running }}</div>
          <div class="text-sm text-green-800">執行中</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-4">
          <div class="text-2xl font-bold text-purple-600">{{ taskStats.done }}</div>
          <div class="text-sm text-purple-800">已完成</div>
        </div>
      </div>

      <!-- 任務列表 -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-xl font-semibold">任務列表</h2>
          <button
            @click="fetchTasks"
            :disabled="loading"
            class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
          >
            {{ loading ? '載入中...' : '重新載入' }}
          </button>
        </div>
        
        <div v-if="loading && tasks.length === 0" class="p-8 text-center text-gray-500">
          載入中...
        </div>
        
        <div v-else-if="tasks.length === 0" class="p-8 text-center text-gray-500">
          尚無任務
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="p-6 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <span class="text-sm font-medium text-gray-900">
                    #{{ task.id }}
                  </span>
                  <span
                    :class="getStatusClass(task.status)"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getStatusText(task.status) }}
                  </span>
                </div>
                <div class="mt-1">
                  <a
                    :href="task.url"
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {{ task.url }}
                  </a>
                </div>
                <div class="mt-1 text-sm text-gray-500">
                  建立時間: {{ formatDate(task.created_at) }}
                  <span v-if="task.finished_at">
                    | 完成時間: {{ formatDate(task.finished_at) }}
                  </span>
                  <span v-if="task.item_count">
                    | 項目數: {{ task.item_count }}
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  v-if="task.status === 'failed'"
                  @click="retryTask(task.id)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  重試
                </button>
                <button
                  @click="deleteTask(task.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分頁 -->
        <div v-if="pagination.total > pagination.pageSize" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              顯示 {{ (pagination.page - 1) * pagination.pageSize + 1 }} 到 
              {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 項，
              共 {{ pagination.total }} 項
            </div>
            <div class="flex space-x-2">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一頁
              </button>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= Math.ceil(pagination.total / pagination.pageSize)"
                class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一頁
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { TaskStatus } from '~/types/crawlTask'

// 使用統一的 crawl tasks store
const crawlTasksStore = useCrawlTasksStore()
const { tasks, loading, error, pagination, taskStats } = storeToRefs(crawlTasksStore)

// 表單狀態
const newTaskUrl = ref('')
const isImportingLatest = ref(false)
const importResultMessage = ref('')

// 頁面載入時取得任務列表
onMounted(() => {
  fetchTasks()
})

// 取得任務列表
const fetchTasks = async () => {
  try {
    await crawlTasksStore.fetchTasks()
  } catch (err) {
    console.error('取得任務列表失敗:', err)
  }
}

// 新增任務
const handleAddTask = async () => {
  if (!newTaskUrl.value) return
  
  try {
    await crawlTasksStore.addTask(newTaskUrl.value)
    newTaskUrl.value = ''
  } catch (err) {
    console.error('新增任務失敗:', err)
  }
}

// 一鍵抓取 TFASC 最新批號連結並建立任務
const importLatestTasks = async () => {
  importResultMessage.value = ''
  crawlTasksStore.clearError()
  isImportingLatest.value = true

  try {
    const result = await crawlTasksStore.importLatestTasks()

    importResultMessage.value = `找到 ${result.totalFound} 筆，新增 ${result.created} 筆（已存在 ${result.skippedExisting}、頁面重複 ${result.skippedDuplicateInPage}）。`
  } catch (err: any) {
    console.error('抓取最新資訊失敗:', err)
  } finally {
    isImportingLatest.value = false
  }
}

// 刪除任務
const deleteTask = async (taskId: number) => {
  if (!confirm('確定要刪除此任務嗎？')) return
  
  try {
    await crawlTasksStore.deleteTask(taskId)
  } catch (err) {
    console.error('刪除任務失敗:', err)
  }
}

// 重試任務
const retryTask = async (taskId: number) => {
  try {
    await crawlTasksStore.retryTask(taskId)
  } catch (err) {
    console.error('重試任務失敗:', err)
  }
}

// 清除錯誤
const clearError = () => {
  crawlTasksStore.clearError()
}

// 換頁
const changePage = async (page: number) => {
  try {
    await crawlTasksStore.fetchTasks(page)
  } catch (err) {
    console.error('換頁失敗:', err)
  }
}

// 狀態樣式
const getStatusClass = (status: TaskStatus) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// 狀態文字
const getStatusText = (status: TaskStatus) => {
  const texts = {
    pending: '等待中',
    running: '執行中',
    done: '已完成',
    failed: '失敗'
  }
  return texts[status] || status
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

// 設定頁面標題
useHead({
  title: '爬蟲任務管理示範 - TFASC Portal'
})
</script> 