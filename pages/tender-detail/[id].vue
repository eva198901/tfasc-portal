<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <!-- 頁面標題 -->
      <div class="bg-white shadow-soft border-b border-primary-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-primary-900">標售詳情</h1>
              <p class="mt-2 text-primary-600">查看標售資訊詳細內容</p>
            </div>
            
            <!-- 操作按鈕 -->
            <div class="flex items-center space-x-3">
              <button
                @click="$router.push('/tender-search')"
                class="flex items-center px-4 py-2 text-primary-600 hover:text-primary-800 transition-colors duration-200"
              >
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                返回搜尋
              </button>

              <button
                @click="$router.push('/link-dashboard')"
                class="flex items-center px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg transition-colors duration-200"
              >
                🏠 管理台
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- 載入狀態 -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-primary-600">載入中...</p>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-error-500 text-6xl mb-4">⚠️</div>
          <h2 class="text-2xl font-bold text-error-600 mb-2">載入失敗</h2>
          <p class="text-error-600 mb-6">{{ error }}</p>
          <div class="space-x-4">
            <button
              @click="fetchTenderDetail"
              class="px-6 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors duration-200"
            >
              重新載入
            </button>
            <button
              @click="$router.push('/tender-search')"
              class="px-6 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-200"
            >
              返回搜尋
            </button>
          </div>
        </div>

        <!-- 標售詳情 -->
        <div v-else-if="tender" class="space-y-6">
          <!-- 基本資訊卡片 -->
          <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100">
            <div class="flex items-start justify-between mb-6">
              <div>
                <div class="flex items-center space-x-3 mb-2">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 text-accent-800">
                    標號 {{ tender.tender_no }}
                  </span>
                  <span class="text-sm text-primary-500">
                    ID: {{ tender.id }}
                  </span>
                </div>
                <h2 class="text-2xl font-bold text-primary-900 mb-2">{{ tender.announcement }}</h2>
                <p class="text-primary-600">{{ formatDateTime(tender.updated_at) }} 更新</p>
              </div>

              <!-- 外部連結 -->
              <div class="flex flex-col space-y-2">
                <a
                  :href="tender.source_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-400 text-white rounded-lg hover:from-accent-600 hover:to-accent-500 transition-all duration-300 transform hover:scale-105"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  查看原始頁面
                </a>
              </div>
            </div>

            <!-- 狀態標籤 -->
            <div class="flex items-center space-x-4 mb-6">
              <div 
                class="flex items-center px-3 py-1 rounded-full text-sm font-medium"
                :class="getTenderStatus(tender).class"
              >
                <span class="mr-1">{{ getTenderStatus(tender).icon }}</span>
                {{ getTenderStatus(tender).text }}
              </div>
              
              <div class="text-sm text-primary-600">
                剩餘 {{ getRemainingDays(tender.receive_end) }} 天
              </div>
            </div>

            <!-- 重要資訊網格 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- 投標期間 -->
              <div class="bg-primary-50 rounded-lg p-4">
                <div class="flex items-center text-primary-600 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-sm font-medium">投標期間</span>
                </div>
                <div class="text-sm text-primary-900">
                  <div>開始: {{ formatDate(tender.receive_start) }}</div>
                  <div>結束: {{ formatDate(tender.receive_end) }}</div>
                </div>
              </div>

              <!-- 底價 -->
              <div class="bg-accent-50 rounded-lg p-4">
                <div class="flex items-center text-accent-600 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span class="text-sm font-medium">底價</span>
                </div>
                <div class="text-lg font-bold text-accent-900">
                  NT${{ tender.reserve_price.toLocaleString() }}
                </div>
              </div>

              <!-- 保證金 -->
              <div class="bg-secondary-50 rounded-lg p-4">
                <div class="flex items-center text-secondary-600 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <span class="text-sm font-medium">保證金</span>
                </div>
                <div class="text-lg font-bold text-secondary-900">
                  NT${{ tender.deposit.toLocaleString() }}
                </div>
              </div>

              <!-- 面積資訊 -->
              <div class="bg-success-50 rounded-lg p-4">
                <div class="flex items-center text-success-600 mb-2">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                  </svg>
                  <span class="text-sm font-medium">面積</span>
                </div>
                <div class="text-sm text-success-900">
                  <div v-if="tender.area_ping">{{ tender.area_ping }} 坪</div>
                  <div v-if="tender.area_m2">{{ tender.area_m2 }} m²</div>
                  <div v-if="!tender.area_ping && !tender.area_m2" class="text-success-600">未提供</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 詳細資訊 -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 物件資訊 -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100">
                <h3 class="text-lg font-semibold text-primary-900 mb-4">物件資訊</h3>
                
                <div class="space-y-4">
                  <!-- 分區 -->
                  <div class="flex items-start">
                    <div class="w-24 text-sm font-medium text-primary-600">分區</div>
                    <div class="flex-1 text-sm text-primary-900">
                      {{ tender.zoning || '未提供' }}
                    </div>
                  </div>

                  <!-- 面積詳情 -->
                  <div class="flex items-start">
                    <div class="w-24 text-sm font-medium text-primary-600">面積</div>
                    <div class="flex-1 text-sm text-primary-900">
                      <div v-if="tender.area_ping || tender.area_m2" class="space-y-1">
                        <div v-if="tender.area_ping">{{ tender.area_ping }} 坪</div>
                        <div v-if="tender.area_m2">{{ tender.area_m2 }} 平方公尺</div>
                        <div v-if="tender.area_ping && tender.area_m2" class="text-xs text-primary-500">
                          (1 坪 ≈ {{ (tender.area_m2 / tender.area_ping).toFixed(2) }} m²)
                        </div>
                      </div>
                      <div v-else>未提供</div>
                    </div>
                  </div>

                  <!-- 價格分析 -->
                  <div class="flex items-start">
                    <div class="w-24 text-sm font-medium text-primary-600">價格分析</div>
                    <div class="flex-1 text-sm text-primary-900">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div class="font-medium">底價</div>
                          <div>NT${{ tender.reserve_price.toLocaleString() }}</div>
                          <div v-if="tender.area_ping" class="text-xs text-primary-500 mt-1">
                            每坪 NT${{ Math.round(tender.reserve_price / tender.area_ping).toLocaleString() }}
                          </div>
                        </div>
                        <div>
                          <div class="font-medium">保證金</div>
                          <div>NT${{ tender.deposit.toLocaleString() }}</div>
                          <div class="text-xs text-primary-500 mt-1">
                            占底價 {{ ((tender.deposit / tender.reserve_price) * 100).toFixed(1) }}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 備註 -->
                  <div v-if="tender.note" class="flex items-start">
                    <div class="w-24 text-sm font-medium text-primary-600">備註</div>
                    <div class="flex-1 text-sm text-primary-900">
                      {{ tender.note }}
                    </div>
                  </div>

                  <!-- 🆕 v0.4.3 不動產標示 -->
                  <div v-if="tender.property_mark && tender.property_mark.length > 0" class="flex items-start">
                    <div class="w-24 text-sm font-medium text-primary-600">不動產標示</div>
                    <div class="flex-1 space-y-3">
                      <div 
                        v-for="(mark, index) in tender.property_mark" 
                        :key="index"
                        class="bg-gradient-to-r from-primary-25 to-accent-25 rounded-lg p-4 border border-primary-100"
                      >
                        <div class="flex items-center mb-3">
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                            項目 {{ index + 1 }}
                          </span>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <!-- 地號信息 -->
                          <div v-if="mark.地號" class="bg-white rounded-lg p-3 border border-primary-100">
                            <div class="flex items-center text-primary-700 mb-2">
                              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span class="text-sm font-medium">土地地號</span>
                            </div>
                            <p class="text-sm text-primary-900 break-all">{{ mark.地號 }}</p>
                          </div>
                          
                          <!-- 建號信息 -->
                          <div v-if="mark.建號" class="bg-white rounded-lg p-3 border border-secondary-100">
                            <div class="flex items-center text-secondary-700 mb-2">
                              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                              </svg>
                              <span class="text-sm font-medium">建物建號</span>
                            </div>
                            <p class="text-sm text-secondary-900 break-all">{{ mark.建號 }}</p>
                          </div>
                          
                          <!-- 面積信息 -->
                          <div v-if="mark.面積" class="bg-white rounded-lg p-3 border border-success-100">
                            <div class="flex items-center text-success-700 mb-2">
                              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                              </svg>
                              <span class="text-sm font-medium">面積</span>
                            </div>
                            <p class="text-sm text-success-900">{{ mark.面積 }}</p>
                          </div>
                          
                          <!-- 使用分區 -->
                          <div v-if="mark.使用分區" class="bg-white rounded-lg p-3 border border-accent-100">
                            <div class="flex items-center text-accent-700 mb-2">
                              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                              </svg>
                              <span class="text-sm font-medium">使用分區</span>
                            </div>
                            <p class="text-sm text-accent-900">{{ mark.使用分區 }}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="text-xs text-primary-500 mt-2">
                        💡 根據 TFASC v0.4.3 規格顯示的結構化不動產標示資料
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作面板 -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100">
                <h3 class="text-lg font-semibold text-primary-900 mb-4">快速操作</h3>
                
                <div class="space-y-3">
                  <!-- 查看原始頁面 -->
                  <a
                    :href="tender.source_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-accent-500 to-accent-400 text-white rounded-lg hover:from-accent-600 hover:to-accent-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    查看 TFASC 原始頁面
                  </a>

                  <!-- 複製連結 -->
                  <button
                    @click="copySourceUrl"
                    class="w-full flex items-center justify-center px-4 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-200"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    複製原始連結
                  </button>

                  <!-- 分享功能 -->
                  <button
                    @click="shareDetail"
                    class="w-full flex items-center justify-center px-4 py-3 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors duration-200"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                    </svg>
                    分享詳情頁面
                  </button>
                </div>

                <!-- 系統資訊 -->
                <div class="mt-6 pt-6 border-t border-primary-200">
                  <h4 class="text-sm font-medium text-primary-900 mb-3">系統資訊</h4>
                  <div class="space-y-2 text-xs text-primary-600">
                    <div class="flex justify-between">
                      <span>記錄 ID</span>
                      <span>{{ tender.id }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>最後更新</span>
                      <span>{{ formatDate(tender.updated_at) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>資料來源</span>
                      <span>TFASC 官網</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 相關操作 -->
          <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100">
            <h3 class="text-lg font-semibold text-primary-900 mb-4">相關操作</h3>
            
            <div class="flex flex-wrap gap-3">
              <button
                @click="$router.push('/tender-search')"
                class="flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                搜尋類似標售
              </button>

              <button
                @click="$router.push('/link-dashboard')"
                class="flex items-center px-4 py-2 bg-accent-100 text-accent-700 rounded-lg hover:bg-accent-200 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                </svg>
                返回管理台
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { TenderOut } from '~/types/tender'

// 頁面設定
definePageMeta({
  title: '標售詳情',
  description: '查看標售資訊詳細內容'
})

// 路由參數
const route = useRoute()
const tenderId = parseInt(route.params.id as string)

// 響應式資料
const loading = ref(true)
const error = ref<string | null>(null)
const tender = ref<TenderOut | null>(null)

// API 方法
const { getTender } = useTenders()

// 取得標售詳情
const fetchTenderDetail = async () => {
  loading.value = true
  error.value = null

  try {
    tender.value = await getTender(tenderId)
  } catch (err: any) {
    error.value = err.message || '載入標售詳情失敗'
    console.error('載入標售詳情失敗:', err)
  } finally {
    loading.value = false
  }
}

// 取得標售狀態
const getTenderStatus = (tender: TenderOut) => {
  const now = new Date()
  const startDate = new Date(tender.receive_start)
  const endDate = new Date(tender.receive_end)

  if (now < startDate) {
    return {
      text: '未開始',
      icon: '⏰',
      class: 'bg-warning-100 text-warning-800'
    }
  } else if (now >= startDate && now <= endDate) {
    return {
      text: '進行中',
      icon: '🟢',
      class: 'bg-success-100 text-success-800'
    }
  } else {
    return {
      text: '已結束',
      icon: '🔴',
      class: 'bg-error-100 text-error-800'
    }
  }
}

// 計算剩餘天數
const getRemainingDays = (endDate: string) => {
  const now = new Date()
  const end = new Date(endDate)
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

// 複製原始連結
const copySourceUrl = async () => {
  if (tender.value?.source_url) {
    try {
      await navigator.clipboard.writeText(tender.value.source_url)
      alert('連結已複製到剪貼簿')
    } catch (err) {
      console.error('複製失敗:', err)
      alert('複製失敗，請手動複製連結')
    }
  }
}

// 分享詳情
const shareDetail = async () => {
  const currentUrl = window.location.href
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `標售詳情 - ${tender.value?.announcement}`,
        text: `標號 ${tender.value?.tender_no} 的標售資訊`,
        url: currentUrl
      })
    } catch (err) {
      console.error('分享失敗:', err)
    }
  } else {
    // 降級處理：複製到剪貼簿
    try {
      await navigator.clipboard.writeText(currentUrl)
      alert('頁面連結已複製到剪貼簿')
    } catch (err) {
      console.error('複製失敗:', err)
      alert('分享失敗，請手動複製網址')
    }
  }
}

// 日期格式化
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW')
}

// 🆕 v0.4.3: Property Mark 現在是結構化數據，不再需要 JSON 解析

// 頁面載入時執行
onMounted(() => {
  if (tenderId) {
    fetchTenderDetail()
  } else {
    error.value = '無效的標售 ID'
  }
})

// SEO 設定
useSeoMeta({
  title: computed(() => tender.value ? `標售詳情 - ${tender.value.announcement}` : '標售詳情'),
  description: computed(() => tender.value ? `查看標號 ${tender.value.tender_no} 的詳細標售資訊` : '查看標售資訊詳細內容')
})
</script> 