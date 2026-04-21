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
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <!-- 關鍵字搜尋 -->
            <div>
              <label for="tender-no-search" class="block text-sm font-medium text-primary-700 mb-2">
                關鍵字
              </label>
              <input
                id="tender-no-search"
                v-model="searchFilters.keyword"
                type="text"
                placeholder="搜尋標號、公告、分區、備註..."
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              />
            </div>

            <!-- 縣市／區域：tw-city-selector（UMD，與官方文件一致） -->
            <div class="md:col-span-2 lg:col-span-2">
              <span class="block text-sm font-medium text-primary-700 mb-2">
                縣市／區域
              </span>
              <div
                id="tender-search-tw-city-host"
                class="flex flex-wrap gap-2 items-center [&_select]:min-w-[9rem] [&_select]:px-3 [&_select]:py-2 [&_select]:border [&_select]:border-primary-300 [&_select]:rounded-lg [&_select]:bg-white"
              />
            </div>

            <!-- 開始日期 -->
            <div>
              <label for="start-date" class="block text-sm font-medium text-primary-700 mb-2">
                開始日期
              </label>
              <input
                id="start-date"
                v-model="searchFilters.date_from"
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
                v-model="searchFilters.date_to"
                type="date"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              />
            </div>

            <!-- 顯示過期案件（與「使用分區」位置對調） -->
            <div>
              <span class="block text-sm font-medium text-primary-700 mb-2">
                顯示過期案件
              </span>
              <label class="inline-flex items-center gap-2 h-[42px] text-sm text-primary-800">
                <input
                  v-model="searchFilters.include_expired"
                  type="checkbox"
                  class="h-4 w-4 rounded border-primary-300 text-accent-600 focus:ring-accent-500"
                  @change="onLocalFilterChanged"
                />
                包含收件截止日已過案件
              </label>
            </div>

            <!-- 標的類型（多選） -->
            <div>
              <span class="block text-sm font-medium text-primary-700 mb-2">
                標的類型（可複選）
              </span>
              <div class="flex items-center gap-4 h-[42px]">
                <label class="inline-flex items-center gap-2 text-sm text-primary-800">
                  <input
                    v-model="searchFilters.property_types"
                    type="checkbox"
                    value="land"
                    class="h-4 w-4 rounded border-primary-300 text-accent-600 focus:ring-accent-500"
                    @change="onLocalFilterChanged"
                  />
                  土地
                </label>
                <label class="inline-flex items-center gap-2 text-sm text-primary-800">
                  <input
                    v-model="searchFilters.property_types"
                    type="checkbox"
                    value="building"
                    class="h-4 w-4 rounded border-primary-300 text-accent-600 focus:ring-accent-500"
                    @change="onLocalFilterChanged"
                  />
                  建物
                </label>
              </div>
            </div>

            <!-- 區域分類 -->
            <div>
              <label for="zoning" class="block text-sm font-medium text-primary-700 mb-2">
                使用分區
              </label>
              <select
                id="zoning"
                v-model="searchFilters.zoning"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              >
                <option value="">請選擇分區</option>
                <option value="住宅區">住宅區 (各種)</option>
                <option value="第一種住宅區">第一種住宅區</option>
                <option value="第二種住宅區">第二種住宅區</option>
                <option value="第三種住宅區">第三種住宅區</option>
                <option value="第四種住宅區">第四種住宅區</option>
                <option value="商業區">商業區</option>
                <option value="工業區">工業區</option>
                <option value="農業區">農業區</option>
                <option value="保護區">保護區</option>
                <option value="特定專用區">特定專用區</option>
              </select>
            </div>

            <!-- 金額範圍（最低／最高同一列） -->
            <div class="md:col-span-2 lg:col-span-2">
              <span class="block text-sm font-medium text-primary-700 mb-2">
                底價範圍（萬元）
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="price-min" class="block text-xs text-primary-600 mb-1">最低 (萬元)</label>
                  <input
                    id="price-min"
                    v-model="searchFilters.price_min"
                    type="number"
                    min="0"
                    placeholder="例: 100"
                    class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label for="price-max" class="block text-xs text-primary-600 mb-1">最高 (萬元)</label>
                  <input
                    id="price-max"
                    v-model="searchFilters.price_max"
                    type="number"
                    min="0"
                    placeholder="例: 500"
                    class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 表單驗證錯誤顯示 -->
          <div v-if="formErrors.length > 0" class="mb-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <div class="flex">
                <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-red-800">表單驗證錯誤：</h3>
                  <ul class="mt-1 text-sm text-red-700">
                    <li v-for="error in formErrors" :key="error">• {{ error }}</li>
                  </ul>
                </div>
              </div>
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
                @change="() => { pagination.skip = 0; applyPagination(); }"
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
          
          <!-- 開發模式：顯示資料統計 -->
          <div class="text-xs text-gray-500">
            <button
              @click="showDebugInfo = !showDebugInfo"
              class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
            >
              {{ showDebugInfo ? '隱藏' : '顯示' }}偵錯資訊
            </button>
          </div>

          <!-- 排序選項 -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-primary-600">排序:</span>
            <select
              v-model="sortBy"
              @change="applyPagination"
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

        <!-- 偵錯資訊 -->
        <div v-if="showDebugInfo" class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 class="text-sm font-medium text-gray-900 mb-3">🔍 偵錯資訊</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div class="bg-white p-3 rounded border">
              <div class="font-medium text-gray-700 mb-1">📊 資料統計</div>
              <div>後端搜尋結果: {{ allFilteredResults.length }}</div>
              <div>當前頁顯示: {{ tenders.length }}</div>
              <div>總頁數: {{ totalPages }}</div>
            </div>
            <div class="bg-white p-3 rounded border">
              <div class="font-medium text-gray-700 mb-1">🔧 目前篩選</div>
              <div v-if="searchFilters.keyword">關鍵字: {{ searchFilters.keyword }}</div>
              <div v-if="regionQueryLabel">縣市區域: {{ regionQueryLabel }}</div>
              <div v-if="searchFilters.date_from">開始: {{ searchFilters.date_from }}</div>
              <div v-if="searchFilters.date_to">結束: {{ searchFilters.date_to }}</div>
              <div v-if="searchFilters.zoning">區域: {{ searchFilters.zoning }}</div>
              <div v-if="searchFilters.property_types.length > 0">
                標的類型: {{ propertyTypeLabel }}
              </div>
              <div v-if="searchFilters.include_expired">包含過期案件: 是</div>
              <div v-if="searchFilters.price_min">最低價: {{ searchFilters.price_min }}萬</div>
              <div v-if="searchFilters.price_max">最高價: {{ searchFilters.price_max }}萬</div>
            </div>
            <div class="bg-white p-3 rounded border">
              <div class="font-medium text-gray-700 mb-1">📋 分頁資訊</div>
              <div>Skip: {{ pagination.skip }}</div>
              <div>Limit: {{ pagination.limit }}</div>
              <div>當前頁: {{ currentPage }}</div>
              <div>總頁數: {{ totalPages }}</div>
            </div>
          </div>
          <div class="mt-3 text-xs text-gray-600">
            💡 提示: 請打開瀏覽器開發者工具的 Console 頁籤查看詳細的 API 資料
          </div>
        </div>

        <!-- 搜尋結果統計 -->
        <div v-if="!loading && !error" class="mb-6 bg-white rounded-xl shadow-soft border border-primary-100 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h3 class="text-lg font-semibold text-primary-800">搜尋結果</h3>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-100 text-accent-800">
                共 {{ totalCount }} 筆
              </span>
            </div>
            <div class="flex items-center space-x-2 text-sm text-primary-600">
              <span>第 {{ currentPage }} / {{ totalPages }} 頁</span>
              <span>•</span>
              <span>每頁 {{ pagination.limit }} 筆</span>
            </div>
          </div>
          
          <!-- 篩選條件摘要 -->
          <div v-if="hasActiveFilters" class="mt-3 pt-3 border-t border-primary-100">
            <div class="flex flex-wrap gap-2">
              <span class="text-sm text-primary-600 mr-2">篩選條件:</span>
              <span v-if="searchFilters.keyword" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                關鍵字: {{ searchFilters.keyword }}
              </span>
              <span v-if="regionQueryLabel" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                縣市區域: {{ regionQueryLabel }}
              </span>
              <span v-if="searchFilters.date_from || searchFilters.date_to" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                日期: {{ searchFilters.date_from || '不限' }} ~ {{ searchFilters.date_to || '不限' }}
              </span>
              <span v-if="searchFilters.zoning" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                區域: {{ searchFilters.zoning }}
              </span>
              <span v-if="searchFilters.property_types.length > 0" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                標的類型: {{ propertyTypeLabel }}
              </span>
              <span v-if="searchFilters.include_expired" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                包含過期案件
              </span>
              <span v-if="searchFilters.price_min || searchFilters.price_max" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700">
                價格: {{ searchFilters.price_min || 0 }}萬 - {{ searchFilters.price_max || '不限' }}萬
              </span>
            </div>
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
                    公告批次
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    收件期間
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    不動產標示
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                    底價/保證金
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
                    <div class="text-sm font-medium text-primary-900 max-w-xs">
                      {{ tender.announcement }}
                    </div>
                    <div v-if="tender.note" class="text-xs text-primary-500 mt-1 max-w-xs truncate">
                      {{ tender.note }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                    <div class="font-medium">{{ formatDate(tender.receive_start) }}</div>
                    <div class="text-primary-500">{{ formatDate(tender.receive_end) }}</div>
                    <div class="text-xs text-primary-400 mt-1">{{ formatDateTime(tender.updated_at) }}</div>
                  </td>
                  <!-- 🆕 v0.4.3 不動產標示顯示 -->
                  <td class="px-6 py-4 text-sm text-primary-600">
                    <div v-if="tender.property_mark && tender.property_mark.length > 0" class="space-y-2">
                      <div 
                        v-for="(mark, index) in tender.property_mark" 
                        :key="index"
                        class="p-2 bg-primary-25 rounded-lg border border-primary-100"
                      >
                        <!-- 地號信息 -->
                        <div v-if="mark.地號" class="text-xs font-medium text-primary-800">
                          🏠 {{ mark.地號 }}
                        </div>
                        <!-- 建號信息 -->
                        <div v-if="mark.建號" class="text-xs font-medium text-secondary-800">
                          🏢 {{ mark.建號 }}
                        </div>
                        <!-- 面積信息 -->
                        <div v-if="mark.面積" class="text-xs text-primary-600">
                          📐 {{ mark.面積 }}
                        </div>
                        <!-- 使用分區 -->
                        <div v-if="mark.使用分區" class="text-xs text-accent-600">
                          🗺️ {{ mark.使用分區 }}
                        </div>
                      </div>
                    </div>
                    <!-- 傳統面積/分區信息 (fallback) -->
                    <div v-else class="space-y-1">
                      <div v-if="tender.area_ping || tender.area_m2" class="text-xs text-primary-600">
                        📐 
                        <span v-if="tender.area_ping">{{ tender.area_ping }} 坪</span>
                        <span v-if="tender.area_ping && tender.area_m2"> / </span>
                        <span v-if="tender.area_m2">{{ tender.area_m2 }} m²</span>
                      </div>
                      <div v-if="tender.zoning" class="text-xs text-accent-600">
                        🗺️ {{ tender.zoning }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-primary-900">
                      NT${{ tender.reserve_price.toLocaleString() }}
                    </div>
                    <div class="text-xs text-primary-500 mt-1">
                      保證金: NT${{ tender.deposit.toLocaleString() }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1">
                    <button
                      @click="$router.push(`/tender-detail/${tender.id}`)"
                      class="block text-accent-600 hover:text-accent-700 transition-colors duration-200"
                    >
                      查看詳情
                    </button>
                    <a
                      :href="tender.source_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block text-secondary-600 hover:text-secondary-700 transition-colors duration-200 text-xs"
                    >
                      原始連結 ↗
                    </a>
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

type TwCitySelectorApi = {
  reset: () => unknown
  setValue: (county?: string | null, district?: string | null) => unknown
}

declare global {
  interface Window {
    TwCitySelector?: new (opts?: Record<string, unknown>) => TwCitySelectorApi
  }
}

const TW_CITY_SELECTOR_CDN =
  'https://cdn.jsdelivr.net/npm/tw-city-selector@2.1.2/dist/tw-city-selector.js'

const TW_CITY_HOST_ID = 'tender-search-tw-city-host'

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
  keyword: '',
  region_city: '',
  region_district: '',
  date_from: '',
  date_to: '',
  zoning: '',
  property_types: [] as Array<'land' | 'building'>,
  include_expired: false,
  price_min: null as number | null,
  price_max: null as number | null
})

// 表單驗證錯誤
const formErrors = ref<string[]>([])

// 開發模式偵錯
const showDebugInfo = ref(false)

// 分頁
const pagination = reactive({
  skip: 0,
  limit: 20
})

// 排序
const sortBy = ref('updated_at_desc')

// API 方法
const { getTenders, searchTenders } = useTenders()

let twCitySelectorInstance: TwCitySelectorApi | null = null
let detachTwCityDomListeners: (() => void) | null = null

function loadTwCitySelectorScript(): Promise<void> {
  if (import.meta.server) {
    return Promise.resolve()
  }
  if (window.TwCitySelector) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-tw-city-selector="1"]'
    ) as HTMLScriptElement | null
    if (existing) {
      if (window.TwCitySelector) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () =>
        reject(new Error('tw-city-selector 腳本載入失敗'))
      , { once: true })
      return
    }
    const s = document.createElement('script')
    s.src = TW_CITY_SELECTOR_CDN
    s.async = true
    s.dataset.twCitySelector = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('tw-city-selector 腳本載入失敗'))
    document.head.appendChild(s)
  })
}

function syncTwCitySelectionsToFilters() {
  if (import.meta.server) {
    return
  }
  const root = document.getElementById(TW_CITY_HOST_ID)
  if (!root) {
    return
  }
  const county = root.querySelector('select.county') as HTMLSelectElement | null
  const district = root.querySelector('select.district') as HTMLSelectElement | null
  searchFilters.region_city = county?.value || ''
  searchFilters.region_district = district?.value || ''
}

function attachTwCityDomListeners() {
  detachTwCityDomListeners?.()
  detachTwCityDomListeners = null
  const root = document.getElementById(TW_CITY_HOST_ID)
  if (!root) {
    return
  }
  const county = root.querySelector('select.county')
  const district = root.querySelector('select.district')
  const onChange = () => {
    syncTwCitySelectionsToFilters()
  }
  county?.addEventListener('change', onChange)
  district?.addEventListener('change', onChange)
  detachTwCityDomListeners = () => {
    county?.removeEventListener('change', onChange)
    district?.removeEventListener('change', onChange)
    detachTwCityDomListeners = null
  }
}

async function initTwCitySelector() {
  if (import.meta.server) {
    return
  }
  await loadTwCitySelectorScript()
  await nextTick()
  const Ctor = window.TwCitySelector
  if (!Ctor) {
    console.error('TwCitySelector 未載入')
    return
  }
  const host = document.getElementById(TW_CITY_HOST_ID)
  if (!host) {
    return
  }
  host.innerHTML = ''
  detachTwCityDomListeners?.()
  detachTwCityDomListeners = null
  twCitySelectorInstance = null
  try {
    twCitySelectorInstance = new Ctor({
      el: `#${TW_CITY_HOST_ID}`,
      standardWords: true,
    })
  } catch (e) {
    console.error('TwCitySelector 初始化失敗:', e)
    return
  }
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 0)
  })
  attachTwCityDomListeners()
  syncTwCitySelectionsToFilters()
}

/** 組合縣市 + 區名，供後端 region 模糊搜尋（不動產標示／公告／備註） */
const buildRegionParam = (): string => {
  const city = (searchFilters.region_city || '').trim()
  const dis = (searchFilters.region_district || '').trim()
  if (city && dis) {
    return `${city}${dis}`
  }
  if (city) {
    return city
  }
  if (dis) {
    return dis
  }
  return ''
}

const regionQueryLabel = computed(() => {
  const city = (searchFilters.region_city || '').trim()
  const dis = (searchFilters.region_district || '').trim()
  if (!city && !dis) {
    return ''
  }
  if (city && dis) {
    return `${city} ${dis}`
  }
  return city || dis
})

// 計算當前頁碼
const currentPage = computed(() => Math.floor(pagination.skip / pagination.limit) + 1)

// 計算總頁數
const totalPages = computed(() => Math.ceil(totalCount.value / pagination.limit))

// 檢查是否有啟用的篩選條件
const hasActiveFilters = computed(() => {
  return !!(
    searchFilters.keyword ||
    searchFilters.region_city ||
    searchFilters.region_district ||
    searchFilters.date_from ||
    searchFilters.date_to ||
    searchFilters.zoning ||
    searchFilters.property_types.length > 0 ||
    searchFilters.include_expired ||
    searchFilters.price_min !== null ||
    searchFilters.price_max !== null
  )
})

const propertyTypeLabel = computed(() => {
  const labels: string[] = []
  if (searchFilters.property_types.includes('land')) {
    labels.push('土地')
  }
  if (searchFilters.property_types.includes('building')) {
    labels.push('建物')
  }
  return labels.join(' / ')
})

const classifyTenderPropertyType = (tender: TenderOut): { hasLand: boolean; hasBuilding: boolean } => {
  const marks = Array.isArray(tender.property_mark) ? tender.property_mark : []
  let hasLand = false
  let hasBuilding = false
  for (const mark of marks) {
    if (!mark || typeof mark !== 'object') {
      continue
    }
    const obj = mark as Record<string, unknown>
    if (typeof obj['地號'] === 'string' && obj['地號'].trim() !== '') {
      hasLand = true
    }
    if (typeof obj['建號'] === 'string' && obj['建號'].trim() !== '') {
      hasBuilding = true
    }
  }
  return { hasLand, hasBuilding }
}

const isExpiredTender = (tender: TenderOut): boolean => {
  const end = new Date(tender.receive_end)
  if (Number.isNaN(end.getTime())) {
    return false
  }
  const now = new Date()
  end.setHours(23, 59, 59, 999)
  return end.getTime() < now.getTime()
}

const onLocalFilterChanged = () => {
  pagination.skip = 0
  applyPagination()
}

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

// 表單驗證
const validateForm = () => {
  const errors: string[] = []

  // 日期範圍驗證
  if (searchFilters.date_from && searchFilters.date_to) {
    if (new Date(searchFilters.date_from) > new Date(searchFilters.date_to)) {
      errors.push('開始日期不能晚於結束日期')
    }
  }

  // 價格範圍驗證
  if (searchFilters.price_min !== null && searchFilters.price_max !== null) {
    if (searchFilters.price_min > searchFilters.price_max) {
      errors.push('最低價格不能高於最高價格')
    }
  }

  formErrors.value = errors
  return errors.length === 0
}

// 響應式的所有篩選後資料
const allFilteredResults = ref<TenderOut[]>([])

// 搜尋處理
const handleSearch = async () => {
  // 表單驗證
  if (!validateForm()) {
    return
  }

  loading.value = true
  error.value = null
  pagination.skip = 0 // 重置到第一頁

  try {
    // 構建搜尋參數，將萬元轉換為新台幣
    const params: Record<string, any> = {
      offset: 0,
      // 不設定 limit，讓後端返回所有符合條件的結果（由後端 limit=None 處理）
    }

    // 添加所有搜尋參數
    if (searchFilters.date_from) params.date_from = searchFilters.date_from
    if (searchFilters.date_to) params.date_to = searchFilters.date_to
    if (searchFilters.keyword) params.keyword = searchFilters.keyword
    const regionParam = buildRegionParam()
    if (regionParam) {
      params.region = regionParam
    }
    if (searchFilters.zoning) params.zoning = searchFilters.zoning
    
    // 價格參數：從萬元轉換為新台幣
    if (searchFilters.price_min !== null) {
      params.price_min = searchFilters.price_min * 10000
    }
    if (searchFilters.price_max !== null) {
      params.price_max = searchFilters.price_max * 10000
    }
    
    console.log('🔍 搜尋參數 (發送至後端):', params)
    const results = await searchTenders(params)
    console.log('📊 後端返回的資料筆數:', results.length)
    console.log('📋 後端返回的完整資料:', results)
    
    // 後端已經進行了篩選，直接使用結果
    allFilteredResults.value = results
    
    // 應用客戶端分頁
    applyPagination()

    console.log('✅ 最終結果筆數:', allFilteredResults.value.length)
    console.log('🎯 最終資料:', allFilteredResults.value)

  } catch (err: any) {
    error.value = err.message || '載入標售資訊失敗'
    console.error('載入標售資訊失敗:', err)
  } finally {
    loading.value = false
  }
}

// 應用分頁和排序
const applyPagination = () => {
  // 先排序
  let sortedResults = [...allFilteredResults.value]

  // 本地篩選：標的類型（土地/建物）
  if (searchFilters.property_types.length > 0) {
    sortedResults = sortedResults.filter((tender) => {
      const { hasLand, hasBuilding } = classifyTenderPropertyType(tender)
      const hitLand =
        searchFilters.property_types.includes('land') && hasLand
      const hitBuilding =
        searchFilters.property_types.includes('building') && hasBuilding
      return hitLand || hitBuilding
    })
  }

  // 本地篩選：是否顯示過期案件
  if (!searchFilters.include_expired) {
    sortedResults = sortedResults.filter((tender) => !isExpiredTender(tender))
  }
  
  if (sortBy.value) {
    sortedResults.sort((a, b) => {
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

  // 更新總筆數
  totalCount.value = sortedResults.length

  // 應用分頁
  const startIndex = pagination.skip
  const endIndex = startIndex + pagination.limit
  tenders.value = sortedResults.slice(startIndex, endIndex)

  console.log('📄 分頁資訊:', {
    skip: pagination.skip,
    limit: pagination.limit,
    totalCount: totalCount.value,
    currentPageData: tenders.value.length
  })
}

// 清除篩選
const clearFilters = () => {
  searchFilters.keyword = ''
  try {
    twCitySelectorInstance?.reset()
  } catch {
    // ignore
  }
  searchFilters.region_city = ''
  searchFilters.region_district = ''
  searchFilters.date_from = ''
  searchFilters.date_to = ''
  searchFilters.zoning = ''
  searchFilters.property_types = []
  searchFilters.include_expired = false
  searchFilters.price_min = null
  searchFilters.price_max = null
  formErrors.value = []
  sortBy.value = 'updated_at_desc'
  handleSearch()
}

// 分頁方法
const nextPage = () => {
  if (pagination.skip + pagination.limit < totalCount.value) {
    pagination.skip += pagination.limit
    applyPagination()
  }
}

const previousPage = () => {
  if (pagination.skip > 0) {
    pagination.skip = Math.max(0, pagination.skip - pagination.limit)
    applyPagination()
  }
}

const goToPage = (page: number | string) => {
  if (typeof page === 'number') {
    pagination.skip = (page - 1) * pagination.limit
    applyPagination()
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
onMounted(async () => {
  await initTwCitySelector()
  await handleSearch()
})

onBeforeUnmount(() => {
  detachTwCityDomListeners?.()
  detachTwCityDomListeners = null
  try {
    twCitySelectorInstance?.reset()
  } catch {
    // ignore
  }
  twCitySelectorInstance = null
  if (import.meta.client) {
    const host = document.getElementById(TW_CITY_HOST_ID)
    if (host) {
      host.innerHTML = ''
    }
  }
})
</script> 