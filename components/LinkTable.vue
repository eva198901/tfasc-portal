<template>
  <div class="bg-white shadow-card rounded-lg border border-gray-200">
    <!-- 表格標題和操作區 -->
    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium leading-6 text-primary">連結任務列表</h3>
          <p class="mt-1 max-w-2xl text-sm text-primary-light">
            管理和監控所有連結處理任務
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- 重新整理按鈕 -->
          <button
            @click="handleRefresh"
            :disabled="loading"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200 disabled:opacity-50"
          >
            <ArrowPathIcon 
              :class="['h-4 w-4 mr-2', loading ? 'animate-spin' : '']" 
              aria-hidden="true" 
            />
            重新整理
          </button>
          
          <!-- 狀態篩選 -->
          <Listbox v-model="selectedStatus" as="div" class="relative">
            <ListboxButton class="relative w-40 cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-accent">
              <span class="block truncate">{{ getStatusText(selectedStatus) }}</span>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </ListboxButton>
            
            <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <ListboxOption
                  v-for="status in statusOptions"
                  :key="status.value"
                  :value="status.value"
                  as="template"
                  v-slot="{ active, selected }"
                >
                  <li :class="[active ? 'bg-accent text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-8 pr-4']">
                    <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                      {{ status.label }}
                    </span>
                    <span v-if="selected" :class="[active ? 'text-white' : 'text-accent', 'absolute inset-y-0 left-0 flex items-center pl-1.5']">
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </Listbox>
        </div>
      </div>
    </div>

    <!-- 表格內容 -->
    <div class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                連結網址
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                建立時間
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- 載入中狀態 -->
            <tr v-if="loading">
              <td colspan="4" class="px-6 py-12 text-center">
                <div class="flex items-center justify-center">
                  <ArrowPathIcon class="h-6 w-6 text-gray-400 animate-spin mr-3" />
                  <span class="text-sm text-gray-500">載入中...</span>
                </div>
              </td>
            </tr>
            
            <!-- 無資料狀態 -->
            <tr v-else-if="!filteredTasks.length">
              <td colspan="4" class="px-6 py-12 text-center">
                <div class="text-center">
                  <LinkIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <h3 class="mt-2 text-sm font-medium text-gray-900">尚無連結任務</h3>
                  <p class="mt-1 text-sm text-gray-500">開始新增您的第一個連結任務</p>
                </div>
              </td>
            </tr>
            
            <!-- 資料列 -->
            <tr 
              v-else
              v-for="task in paginatedTasks" 
              :key="task.id"
              class="hover:bg-gray-50 transition-colors duration-150"
            >
              <!-- URL 欄位 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                      <LinkIcon class="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 max-w-xs truncate" :title="task.url">
                      {{ task.url }}
                    </div>
                    <div class="text-sm text-gray-500 text-xs">
                      ID: {{ task.id }}
                    </div>
                  </div>
                </div>
              </td>
              
              <!-- 狀態欄位 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(task.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  <span :class="getStatusDotClass(task.status)" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                  {{ getStatusText(task.status) }}
                </span>
              </td>
              
              <!-- 建立時間欄位 -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex flex-col">
                  <span>{{ formatDate(task.created_at) }}</span>
                  <span class="text-xs text-gray-400">{{ formatTime(task.created_at) }}</span>
                </div>
              </td>
              
              <!-- 操作欄位 -->
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Menu as="div" class="relative inline-block text-left">
                  <div>
                    <MenuButton class="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-100">
                      <span class="sr-only">開啟選項</span>
                      <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
                    </MenuButton>
                  </div>

                  <transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95"
                    enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95"
                  >
                    <MenuItems class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div class="py-1">
                        <MenuItem v-if="task.status === 'failed'" v-slot="{ active }">
                          <button
                            @click="handleRetry(task.id)"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm w-full text-left']"
                          >
                            <ArrowPathIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                            重試任務
                          </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }">
                          <button
                            @click="handleDelete(task.id)"
                            :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'group flex items-center px-4 py-2 text-sm w-full text-left']"
                          >
                            <TrashIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                            刪除任務
                          </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </transition>
                </Menu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分頁組件 -->
    <div v-if="!loading && filteredTasks.length > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div class="flex items-center justify-between">
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            @click="goToPreviousPage"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一頁
          </button>
          <button
            @click="goToNextPage"
            :disabled="currentPage === totalPages"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一頁
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              顯示第
              <span class="font-medium">{{ startIndex }}</span>
              至
              <span class="font-medium">{{ endIndex }}</span>
              項，共
              <span class="font-medium">{{ filteredTasks.length }}</span>
              項結果
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="分頁">
              <button
                @click="goToPreviousPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">上一頁</span>
                <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
              </button>
              
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  page === currentPage
                    ? 'relative z-10 inline-flex items-center border border-accent bg-accent px-4 py-2 text-sm font-medium text-white focus:z-20'
                    : 'relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="goToNextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">下一頁</span>
                <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/vue'
import {
  ArrowPathIcon,
  ChevronUpDownIcon,
  CheckIcon,
  LinkIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useCrawlTasksStore } from '~/stores/crawlTasks'
import type { CrawlTask } from '~/types/crawlTask'

// 組件屬性
interface Props {
  pageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10
})

// Store 和狀態
const crawlTasksStore = useCrawlTasksStore()
const { tasks, loading, error } = storeToRefs(crawlTasksStore)

// 本地狀態
const currentPage = ref(1)
const selectedStatus = ref<CrawlTask['status'] | 'all'>('all')

// 狀態選項
const statusOptions = [
  { value: 'all', label: '所有狀態' },
  { value: 'pending', label: '待處理' },
  { value: 'running', label: '執行中' },
  { value: 'done', label: '已完成' },
  { value: 'failed', label: '失敗' },
] as const

// 計算屬性
const filteredTasks = computed(() => {
  if (selectedStatus.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(task => task.status === selectedStatus.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / props.pageSize)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * props.pageSize + 1
})

const endIndex = computed(() => {
  return Math.min(currentPage.value * props.pageSize, filteredTasks.value.length)
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return filteredTasks.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  
  const range = []
  const rangeStart = Math.max(2, current - delta)
  const rangeEnd = Math.min(total - 1, current + delta)
  
  if (total <= 1) return [1]
  
  // 第一頁
  range.push(1)
  
  if (rangeStart > 2) {
    range.push('...')
  }
  
  // 中間頁面
  for (let i = rangeStart; i <= rangeEnd; i++) {
    range.push(i)
  }
  
  if (rangeEnd < total - 1) {
    range.push('...')
  }
  
  // 最後一頁
  if (total > 1) {
    range.push(total)
  }
  
  return range.filter((item, index, array) => array.indexOf(item) === index)
})

// 方法
const handleRefresh = async () => {
  try {
    await crawlTasksStore.fetchTasks()
    currentPage.value = 1
  } catch (error) {
    console.error('重新整理失敗:', error)
  }
}

const handleRetry = async (taskId: number) => {
  try {
    // 重新獲取任務狀態
    await crawlTasksStore.getTask(taskId)
  } catch (error) {
    console.error('重新獲取任務失敗:', error)
  }
}

const handleDelete = async (taskId: number) => {
  if (confirm('確定要刪除這個任務嗎？')) {
    try {
      await crawlTasksStore.deleteTask(taskId)
      // 如果當前頁面沒有資料，回到上一頁
      if (paginatedTasks.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
    } catch (error) {
      console.error('刪除任務失敗:', error)
    }
  }
}

const goToPage = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const getStatusText = (status: CrawlTask['status'] | 'all'): string => {
  const statusMap = {
    all: '所有狀態',
    pending: '待處理',
    running: '執行中',
    done: '已完成',
    failed: '失敗'
  }
  return statusMap[status]
}

const getStatusBadgeClass = (status: CrawlTask['status']): string => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }
  return classes[status]
}

const getStatusDotClass = (status: CrawlTask['status']): string => {
  const classes = {
    pending: 'bg-yellow-400',
    running: 'bg-blue-400',
    done: 'bg-green-400',
    failed: 'bg-red-400'
  }
  return classes[status]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 監聽狀態變化時重設頁面
watch(selectedStatus, () => {
  currentPage.value = 1
})

// 初始化
onMounted(() => {
  if (tasks.value.length === 0) {
    crawlTasksStore.fetchTasks()
  }
})
</script> 