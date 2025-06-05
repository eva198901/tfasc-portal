<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <!-- 頁面標題 -->
      <div class="bg-white shadow-soft border-b border-primary-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-primary-900">TFASC 標售管理台</h1>
              <p class="mt-2 text-primary-600">統一標案資料處理與管理平台</p>
            </div>
            
            <!-- API 狀態指示器 -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center" :class="apiStatus === 'healthy' ? 'text-success-600' : 'text-error-600'">
                <div 
                  class="w-3 h-3 rounded-full mr-2 animate-pulse"
                  :class="apiStatus === 'healthy' ? 'bg-success-500' : 'bg-error-500'"
                ></div>
                <span class="text-sm font-medium">
                  API {{ apiStatus === 'healthy' ? '正常' : '異常' }}
                </span>
              </div>
              
              <!-- 最後更新時間 -->
              <div class="text-sm text-primary-500">
                最後更新: {{ lastUpdated }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- 統計卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            v-for="stat in stats" 
            :key="stat.title"
            class="bg-white rounded-xl shadow-soft p-6 border border-primary-100 hover:shadow-moderate hover:border-primary-200 transition-all duration-300"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div 
                  class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  :class="stat.bgColor"
                >
                  {{ stat.icon }}
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-primary-600">{{ stat.title }}</p>
                <p class="text-2xl font-bold text-primary-900">{{ stat.value }}</p>
                <p class="text-xs text-primary-500 mt-1">{{ stat.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 主要功能區域 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 快速操作 -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100">
              <h2 class="text-lg font-semibold text-primary-900 mb-4">快速操作</h2>
              <div class="space-y-3">
                <button
                  @click="showAddLinkModal"
                  class="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-accent-500 to-accent-400 text-white rounded-lg hover:from-accent-600 hover:to-accent-500 transition-all duration-300 transform hover:scale-105 shadow-moderate"
                >
                  <span class="mr-2">➕</span>
                  新增標售連結
                </button>
                
                <button
                  @click="$router.push('/tender-search')"
                  class="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all duration-300 transform hover:scale-105 shadow-moderate"
                >
                  <span class="mr-2">🔍</span>
                  搜尋標售資訊
                </button>
                
                <button
                  @click="syncTenderData"
                  :disabled="syncing"
                  class="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white rounded-lg hover:from-secondary-700 hover:to-secondary-600 transition-all duration-300 transform hover:scale-105 shadow-moderate disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="mr-2" :class="syncing ? 'animate-spin' : ''">
                    {{ syncing ? '⏳' : '🔄' }}
                  </span>
                  {{ syncing ? '同步中...' : '手動同步資料' }}
                </button>
              </div>
            </div>

            <!-- 系統資訊 -->
            <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100 mt-6">
              <h2 class="text-lg font-semibold text-primary-900 mb-4">系統資訊</h2>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-primary-600">API 版本</span>
                  <span class="font-medium text-primary-900">v1.0.0</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-primary-600">資料來源</span>
                  <span class="font-medium text-primary-900">TFASC 官網</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-primary-600">更新頻率</span>
                  <span class="font-medium text-primary-900">每日同步</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-primary-600">資料格式</span>
                  <span class="font-medium text-primary-900">JSON REST API</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 最新標售資訊 -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-primary-900">最新標售資訊</h2>
                <button
                  @click="$router.push('/tender-search')"
                  class="text-accent-600 hover:text-accent-700 text-sm font-medium"
                >
                  查看全部 →
                </button>
              </div>

              <!-- 載入狀態 -->
              <div v-if="loading" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p class="mt-2 text-primary-600">載入中...</p>
              </div>

              <!-- 錯誤狀態 -->
              <div v-else-if="error" class="text-center py-8">
                <div class="text-error-500 text-4xl mb-2">⚠️</div>
                <p class="text-error-600">{{ error }}</p>
                <button
                  @click="fetchLatestTenders"
                  class="mt-2 text-accent-600 hover:text-accent-700 text-sm"
                >
                  重新載入
                </button>
              </div>

              <!-- 標售列表 -->
              <div v-else-if="latestTenders.length > 0" class="space-y-4">
                <div
                  v-for="tender in latestTenders"
                  :key="tender.id"
                  @click="$router.push(`/tender-detail/${tender.id}`)"
                  class="border border-primary-200 rounded-lg p-4 hover:border-accent-300 hover:shadow-soft transition-all duration-300 cursor-pointer"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                          標號 {{ tender.tender_no }}
                        </span>
                        <span class="text-xs text-primary-500">
                          {{ formatDate(tender.updated_at) }}
                        </span>
                      </div>
                      <h3 class="font-medium text-primary-900 mb-1">{{ tender.announcement }}</h3>
                      <div class="text-sm text-primary-600 space-y-1">
                        <p>📅 投標期間: {{ tender.receive_start }} ~ {{ tender.receive_end }}</p>
                        <p v-if="tender.zoning">🏘️ 分區: {{ tender.zoning }}</p>
                        <p>💰 底價: NT${{ tender.reserve_price.toLocaleString() }}</p>
                      </div>
                    </div>
                    <div class="ml-4 text-right">
                      <span class="text-accent-600 hover:text-accent-700">
                        查看詳情 →
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 無資料狀態 -->
              <div v-else class="text-center py-8">
                <div class="text-primary-400 text-4xl mb-2">📄</div>
                <p class="text-primary-600">暫無標售資訊</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Link Modal -->
      <AddLinkModal 
        v-if="isAddLinkModalVisible" 
        @close="hideAddLinkModal"
        @success="onAddLinkSuccess"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { TenderOut } from '~/types/tender'

// 頁面設定
definePageMeta({
  title: 'TFASC 標售管理台',
  description: '統一標案資料處理與管理平台主控台'
})

// 響應式資料
const apiStatus = ref<'healthy' | 'error'>('error')
const loading = ref(true)
const error = ref<string | null>(null)
const syncing = ref(false)
const latestTenders = ref<TenderOut[]>([])
const isAddLinkModalVisible = ref(false)

// 統計資料
const stats = computed(() => [
  {
    title: '總標售數',
    value: latestTenders.value.length.toString(),
    description: '本月新增',
    icon: '📊',
    bgColor: 'bg-accent-100 text-accent-600'
  },
  {
    title: 'API 狀態',
    value: apiStatus.value === 'healthy' ? '正常' : '異常',
    description: '服務狀態',
    icon: '🔗',
    bgColor: apiStatus.value === 'healthy' ? 'bg-success-100 text-success-600' : 'bg-error-100 text-error-600'
  },
  {
    title: '資料來源',
    value: 'TFASC',
    description: '官方網站',
    icon: '🏢',
    bgColor: 'bg-secondary-100 text-secondary-600'
  },
  {
    title: '同步狀態',
    value: syncing.value ? '同步中' : '就緒',
    description: '資料同步',
    icon: syncing.value ? '⏳' : '✅',
    bgColor: 'bg-primary-100 text-primary-600'
  }
])

// 計算最後更新時間
const lastUpdated = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-TW')
})

// API 方法
const { getTenders, checkHealth, syncTenders: apiSyncTenders } = useTenders()
const { useCrawlTasksStore } = await import('~/stores/crawlTasks')
const crawlTasksStore = useCrawlTasksStore()

// 取得最新標售資訊
const fetchLatestTenders = async () => {
  loading.value = true
  error.value = null
  
  try {
    const tenders = await getTenders({ limit: 5 })
    latestTenders.value = tenders
  } catch (err: any) {
    error.value = err.message || '載入標售資訊失敗'
    console.error('載入標售資訊失敗:', err)
  } finally {
    loading.value = false
  }
}

// 檢查 API 健康狀態
const checkApiHealth = async () => {
  try {
    await checkHealth()
    apiStatus.value = 'healthy'
  } catch (err) {
    apiStatus.value = 'error'
    console.error('API 健康檢查失敗:', err)
  }
}

// 手動同步資料
const syncTenderData = async () => {
  syncing.value = true
  
  try {
    // 注意: 實際使用時需要 JWT token
    await apiSyncTenders()
    
    // 同步完成後重新載入資料
    await fetchLatestTenders()
    
    // 顯示成功訊息
    alert('資料同步成功!')
  } catch (err: any) {
    console.error('同步失敗:', err)
    alert('同步失敗: ' + (err.message || '未知錯誤'))
  } finally {
    syncing.value = false
  }
}

// Modal 相關方法
const showAddLinkModal = () => {
  isAddLinkModalVisible.value = true
}

const hideAddLinkModal = () => {
  isAddLinkModalVisible.value = false
}

const onAddLinkSuccess = () => {
  hideAddLinkModal()
  // 重新載入資料
  fetchLatestTenders()
}

// 日期格式化
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 頁面載入時執行
onMounted(async () => {
  await Promise.all([
    checkApiHealth(),
    fetchLatestTenders()
  ])
})
</script> 