<template>
  <NuxtLayout>
    <div class="container mx-auto px-4 py-8">
      <div class="min-h-screen bg-background">
        <!-- 導航欄 -->
        <nav class="bg-white shadow-card border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex items-center">
                <NuxtLink to="/" class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-sm">T</span>
                  </div>
                  <h1 class="text-xl font-semibold text-primary">TFASC Portal</h1>
                </NuxtLink>
              </div>
              <div class="flex items-center space-x-1">
                <NuxtLink to="/dashboard" 
                          class="text-primary-light hover:text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  儀表板
                </NuxtLink>
                <NuxtLink to="/tenders" 
                          class="text-primary-light hover:text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  標案管理
                </NuxtLink>
                <span class="bg-accent/10 text-accent px-4 py-2 rounded-md text-sm font-medium">
                  連結任務
                </span>
              </div>
            </div>
          </div>
        </nav>

        <!-- 主要內容 -->
        <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <!-- 頁面標題 -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-primary">連結任務管理</h1>
            <p class="mt-2 text-primary-light">
              管理和監控所有連結處理任務的狀態和進度
            </p>
          </div>

          <!-- 快速新增區域 -->
          <div class="mb-8">
            <div class="bg-white shadow-card rounded-lg border border-gray-200 p-6">
              <h2 class="text-lg font-medium text-primary mb-4">新增連結任務</h2>
              <form @submit.prevent="handleAddTask" class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                  <label for="url" class="sr-only">連結網址</label>
                  <input
                    id="url"
                    v-model="newTaskUrl"
                    type="url"
                    required
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                    placeholder="輸入連結網址... (例如: https://example.com)"
                  />
                </div>
                <div class="flex-shrink-0">
                  <button
                    type="submit"
                    :disabled="loading || !newTaskUrl.trim()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <PlusIcon v-if="!loading" class="h-4 w-4 mr-2" />
                    <ArrowPathIcon v-else class="h-4 w-4 mr-2 animate-spin" />
                    {{ loading ? '新增中...' : '新增任務' }}
                  </button>
                </div>
              </form>
              
              <!-- 錯誤訊息 -->
              <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div class="flex">
                  <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
                  <div class="ml-3">
                    <p class="text-sm text-red-800">{{ error }}</p>
                    <button
                      @click="clearError"
                      class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                    >
                      關閉
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 統計卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white overflow-hidden shadow-card rounded-lg border border-gray-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <QueueListIcon class="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">總任務數</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ taskStats.total }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow-card rounded-lg border border-gray-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <ClockIcon class="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">執行中</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ taskStats.running }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow-card rounded-lg border border-gray-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon class="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">已完成</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ taskStats.done }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow-card rounded-lg border border-gray-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircleIcon class="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">失敗</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ taskStats.failed }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 連結任務表格 -->
          <LinkTable :page-size="15" />
        </main>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  PlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  QueueListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'
import { useCrawlTasksStore } from '~/stores/crawlTasks'
import LinkTable from '~/components/LinkTable.vue'

// 頁面元資料
useHead({
  title: '爬蟲任務管理 - TFASC Portal',
  meta: [
    { name: 'description', content: 'TFASC Portal 爬蟲任務管理系統' }
  ]
})

// Store 和狀態
const crawlTasksStore = useCrawlTasksStore()
const { loading, error, taskStats } = storeToRefs(crawlTasksStore)

// 本地狀態
const newTaskUrl = ref('')

// 方法
const handleAddTask = async () => {
  if (!newTaskUrl.value.trim()) return

  try {
    await crawlTasksStore.createTask(newTaskUrl.value.trim())
    newTaskUrl.value = ''
  } catch (error) {
    // 錯誤已在 store 中處理
    console.error('新增任務失敗:', error)
  }
}

const clearError = () => {
  crawlTasksStore.clearError()
}
</script> 