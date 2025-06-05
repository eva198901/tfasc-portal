<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <!-- 頁面標題 -->
      <div class="bg-white shadow-soft border-b border-primary-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-primary-900">標售資訊搜尋</h1>
              <p class="mt-2 text-primary-600">搜尋和瀏覽所有標售資訊</p>
            </div>
            
            <!-- 返回按鈕 -->
            <button
              @click="$router.push('/link-dashboard')"
              class="flex items-center px-4 py-2 text-primary-600 hover:text-primary-800 transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              返回管理台
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- 搜尋篩選區域 -->
        <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100 mb-6">
          <h2 class="text-lg font-semibold text-primary-900 mb-4">搜尋篩選</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- 標號搜尋 -->
            <div>
              <label for="tender-no-search" class="block text-sm font-medium text-primary-700 mb-2">
                標號
              </label>
              <input
                id="tender-no-search"
                v-model="searchFilters.tender_no"
                type="text"
                placeholder="搜尋標號..."
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              />
            </div>

            <!-- 公告搜尋 -->
            <div>
              <label for="announcement-search" class="block text-sm font-medium text-primary-700 mb-2">
                投標公告
              </label>
              <input
                id="announcement-search"
                v-model="searchFilters.announcement"
                type="text"
                placeholder="搜尋公告內容..."
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              />
            </div>

            <!-- 開始日期 -->
            <div>
              <label for="start-date" class="block text-sm font-medium text-primary-700 mb-2">
                開始日期
              </label>
              <input
                id="start-date"
                v-model="searchFilters.from"
                type="date"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              />
            </div>

            <!-- 結束日期 -->
            <div>
              <label for="end-date" class="block text-sm font-medium text-primary-700 mb-2">
                結束日期
              </label>
              <input
                id="end-date"
                v-model="searchFilters.to"
                type="date"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              />
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center space-x-3">
              <button
                @click="handleSearch"
                :disabled="loading"
                class="flex items-center px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-400 text-white rounded-lg hover:from-accent-600 hover:to-accent-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                搜尋
              </button>
              
              <button
                @click="clearFilters"
                class="flex items-center px-4 py-2 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                清除篩選
              </button>

              <!-- CSV 導出按鈕 -->
              <button
                @click="exportToCSV"
                :disabled="loading || tenders.length === 0"
                class="flex items-center px-4 py-2 text-secondary-600 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                匯出 CSV
              </button>
            </div>

            <!-- 每頁數量選擇 -->
            <div class="flex items-center space-x-2">
              <span class="text-sm text-primary-600">每頁顯示:</span>
              <select
                v-model="pagination.limit"
                @change="handleSearch"
                class="px-3 py-1 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 結果統計 -->
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-primary-600">
            <span v-if="!loading && tenders.length > 0">
              顯示第 {{ pagination.skip + 1 }} - {{ Math.min(pagination.skip + pagination.limit, totalCount) }} 筆，
              共 {{ totalCount }} 筆結果
            </span>
            <span v-else-if="!loading && tenders.length === 0">
              無符合條件的結果
            </span>
          </div>

          <!-- 排序選項 -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-primary-600">排序:</span>
            <select
              v-model="sortBy"
              @change="handleSearch"
              class="px-3 py-1 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm"
            >
              <option value="updated_at_desc">更新時間 (新→舊)</option>
              <option value="updated_at_asc">更新時間 (舊→新)</option>
              <option value="receive_start_desc">開始日期 (新→舊)</option>
              <option value="receive_start_asc">開始日期 (舊→新)</option>
              <option value="reserve_price_desc">底價 (高→低)</option>
              <option value="reserve_price_asc">底價 (低→高)</option>
            </select>
          </div>
        </div>

        <!-- 標售列表 -->
        <div class="bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden">
          <!-- 載入狀態 -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p class="mt-2 text-primary-600">載入中...</p>
          </div>

          <!-- 錯誤狀態 -->
          <div v-else-if="error" class="text-center py-12">
            <div class="text-error-500 text-4xl mb-2">⚠️</div>
            <p class="text-error-600 mb-4">{{ error }}</p>
            <button
              @click="handleSearch"
              class="text-accent-600 hover:text-accent-700 text-sm font-medium"
            >
              重新載入
            </button>
          </div>

          <!-- 無資料狀態 -->
          <div v-else-if="tenders.length === 0" class="text-center py-12">
            <div class="text-primary-400 text-4xl mb-2">📄</div>
            <p class="text-primary-600 mb-2">無標售資訊</p>
            <p class="text-primary-500 text-sm">請調整搜尋條件或清除篩選重新搜尋</p>
          </div>

          <!-- 表格 -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-primary-200">
              <thead class="bg-primary-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    標號
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    投標公告
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    投標期間
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    面積/分區
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    底價
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    更新時間
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-primary-200">
                <tr
                  v-for="tender in tenders"
                  :key="tender.id"
                  class="hover:bg-primary-50 transition-colors duration-200"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                      {{ tender.tender_no }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-primary-900 max-w-xs truncate">
                      {{ tender.announcement }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                    <div>{{ formatDate(tender.receive_start) }}</div>
                    <div class="text-primary-500">~ {{ formatDate(tender.receive_end) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                    <div v-if="tender.area_ping">{{ tender.area_ping }} 坪</div>
                    <div v-if="tender.area_m2" class="text-primary-500">{{ tender.area_m2 }} m²</div>
                    <div v-if="tender.zoning" class="text-xs text-primary-500 mt-1">{{ tender.zoning }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-primary-900">
                      NT${{ tender.reserve_price.toLocaleString() }}
                    </div>
                    <div class="text-xs text-primary-500">
                      保證金: NT${{ tender.deposit.toLocaleString() }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                    {{ formatDateTime(tender.updated_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="$router.push(`/tender-detail/${tender.id}`)"
                      class="text-accent-600 hover:text-accent-700 transition-colors duration-200"
                    >
                      查看詳情
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分頁 -->
          <div v-if="tenders.length > 0" class="bg-white px-4 py-3 border-t border-primary-200 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex-1 flex justify-between sm:hidden">
                <button
                  @click="previousPage"
                  :disabled="pagination.skip === 0"
                  class="relative inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一頁
                </button>
                <button
                  @click="nextPage"
                  :disabled="pagination.skip + pagination.limit >= totalCount"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-primary-300 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                </button>
              </div>
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-primary-700">
                    顯示第 <span class="font-medium">{{ pagination.skip + 1 }}</span> 到 
                    <span class="font-medium">{{ Math.min(pagination.skip + pagination.limit, totalCount) }}</span> 筆，
                    共 <span class="font-medium">{{ totalCount }}</span> 筆結果
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      @click="previousPage"
                      :disabled="pagination.skip === 0"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-primary-300 bg-white text-sm font-medium text-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    
                    <!-- 頁碼按鈕 -->
                    <template v-for="page in visiblePages" :key="page">
                      <button
                        v-if="page !== '...'"
                        @click="goToPage(page)"
                        :class="[
                          'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200',
                          currentPage === page
                            ? 'z-10 bg-accent-50 border-accent-500 text-accent-600'
                            : 'bg-white border-primary-300 text-primary-500 hover:bg-primary-50'
                        ]"
                      >
                        {{ page }}
                      </button>
                      <span
                        v-else
                        class="relative inline-flex items-center px-4 py-2 border border-primary-300 bg-white text-sm font-medium text-primary-700"
                      >
                        ...
                      </span>
                    </template>
                    
                    <button
                      @click="nextPage"
                      :disabled="pagination.skip + pagination.limit >= totalCount"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-primary-300 bg-white text-sm font-medium text-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { TenderOut, TenderSearchParams } from '~/types/tender'

// 頁面設定
definePageMeta({
  title: '標售資訊搜尋',
  description: '搜尋和瀏覽所有標售資訊'
})

// 響應式資料
const loading = ref(true)
const error = ref<string | null>(null)
const tenders = ref<TenderOut[]>([])
const totalCount = ref(0)

// 搜尋篩選
const searchFilters = reactive({
  tender_no: '',
  announcement: '',
  from: '',
  to: ''
})

// 分頁
const pagination = reactive({
  skip: 0,
  limit: 20
})

// 排序
const sortBy = ref('updated_at_desc')

// API 方法
const { getTenders } = useTenders()

// 計算當前頁碼
const currentPage = computed(() => Math.floor(pagination.skip / pagination.limit) + 1)

// 計算總頁數
const totalPages = computed(() => Math.ceil(totalCount.value / pagination.limit))

// 計算可見頁碼
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = currentPage.value
  const total = totalPages.value

  if (total <= 7) {
    // 總頁數 <= 7，顯示所有頁碼
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 總頁數 > 7，智慧顯示
    if (current <= 4) {
      // 靠近開頭
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 靠近結尾
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 在中間
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// 搜尋處理
const handleSearch = async () => {
  loading.value = true
  error.value = null
  pagination.skip = 0 // 重置到第一頁

  try {
    const params: TenderSearchParams = {
      skip: pagination.skip,
      limit: pagination.limit
    }

    // 添加日期篩選
    if (searchFilters.from) params.from = searchFilters.from
    if (searchFilters.to) params.to = searchFilters.to

    const results = await getTenders(params)
    
    // 客戶端篩選（因為 API 不支援標號和公告搜尋）
    let filteredResults = results
    
    if (searchFilters.tender_no) {
      filteredResults = filteredResults.filter(tender =>
        tender.tender_no.toLowerCase().includes(searchFilters.tender_no.toLowerCase())
      )
    }
    
    if (searchFilters.announcement) {
      filteredResults = filteredResults.filter(tender =>
        tender.announcement.toLowerCase().includes(searchFilters.announcement.toLowerCase())
      )
    }

    // 客戶端排序
    if (sortBy.value) {
      filteredResults.sort((a, b) => {
        const [field, order] = sortBy.value.split('_')
        let aValue, bValue

        switch (field) {
          case 'updated':
            aValue = new Date(a.updated_at).getTime()
            bValue = new Date(b.updated_at).getTime()
            break
          case 'receive':
            aValue = new Date(a.receive_start).getTime()
            bValue = new Date(b.receive_start).getTime()
            break
          case 'reserve':
            aValue = a.reserve_price
            bValue = b.reserve_price
            break
          default:
            return 0
        }

        if (order === 'desc') {
          return bValue > aValue ? 1 : -1
        } else {
          return aValue > bValue ? 1 : -1
        }
      })
    }

    tenders.value = filteredResults
    totalCount.value = filteredResults.length

  } catch (err: any) {
    error.value = err.message || '載入標售資訊失敗'
    console.error('載入標售資訊失敗:', err)
  } finally {
    loading.value = false
  }
}

// 清除篩選
const clearFilters = () => {
  searchFilters.tender_no = ''
  searchFilters.announcement = ''
  searchFilters.from = ''
  searchFilters.to = ''
  sortBy.value = 'updated_at_desc'
  handleSearch()
}

// 分頁方法
const nextPage = () => {
  if (pagination.skip + pagination.limit < totalCount.value) {
    pagination.skip += pagination.limit
    handleSearch()
  }
}

const previousPage = () => {
  if (pagination.skip > 0) {
    pagination.skip = Math.max(0, pagination.skip - pagination.limit)
    handleSearch()
  }
}

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    pagination.skip = (page - 1) * pagination.limit
    handleSearch()
  }
}

// 日期格式化
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

// 匯出CSV
const exportToCSV = () => {
  if (tenders.value.length === 0) {
    return
  }

  // CSV 標題行
  const headers = [
    '標號',
    '投標公告',
    '投標開始日期',
    '投標結束日期',
    '面積(坪)',
    '面積(平方公尺)',
    '分區',
    '底價(新台幣)',
    '保證金(新台幣)',
    '備註',
    '來源網址',
    '更新時間'
  ]

  // 轉換資料為 CSV 格式
  const csvContent = [
    headers.join(','),
    ...tenders.value.map(tender => [
      `"${tender.tender_no}"`,
      `"${tender.announcement}"`,
      `"${tender.receive_start}"`,
      `"${tender.receive_end}"`,
      tender.area_ping || '',
      tender.area_m2 || '',
      `"${tender.zoning || ''}"`,
      tender.reserve_price,
      tender.deposit,
      `"${tender.note || ''}"`,
      `"${tender.source_url}"`,
      `"${tender.updated_at}"`
    ].join(','))
  ].join('\n')

  // 建立並下載檔案
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `標售資料_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 頁面載入時執行
onMounted(() => {
  handleSearch()
})
</script> 