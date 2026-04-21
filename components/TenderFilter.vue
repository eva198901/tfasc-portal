<template>
  <div class="bg-white rounded-xl shadow-soft p-6 border border-primary-100 mb-6">
    <h2 class="text-lg font-semibold text-primary-900 mb-4">搜尋篩選</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- 標號搜尋 -->
        <div>
          <label for="tender-no" class="block text-sm font-medium text-primary-700 mb-2">
            標號
          </label>
          <input
            id="tender-no"
            v-model="formData.tender_no"
            type="text"
            placeholder="搜尋標號..."
            class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
          />
        </div>

        <!-- 開始日期 -->
        <div>
          <label for="date-from" class="block text-sm font-medium text-primary-700 mb-2">
            開始日期
          </label>
          <input
            id="date-from"
            v-model="formData.date_from"
            type="date"
            class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
          />
        </div>

        <!-- 結束日期 -->
        <div>
          <label for="date-to" class="block text-sm font-medium text-primary-700 mb-2">
            結束日期
          </label>
          <input
            id="date-to"
            v-model="formData.date_to"
            type="date"
            class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
          />
        </div>

        <!-- 分區 -->
        <div>
          <label for="zoning" class="block text-sm font-medium text-primary-700 mb-2">
            分區
          </label>
          <select
            id="zoning"
            v-model="formData.zoning"
            class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
          >
            <option value="">全部分區</option>
            <option value="住宅區">住宅區</option>
            <option value="商業區">商業區</option>
            <option value="工業區">工業區</option>
            <option value="農業區">農業區</option>
            <option value="特定專用區">特定專用區</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <!-- 最低價格 -->
        <div>
          <label for="price-min" class="block text-sm font-medium text-primary-700 mb-2">
            最低價格 (萬元)
          </label>
          <input
            id="price-min"
            v-model.number="formData.price_min"
            type="number"
            placeholder="0"
            min="0"
            step="1"
            class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
          />
        </div>

        <!-- 最高價格 -->
        <div>
          <label for="price-max" class="block text-sm font-medium text-primary-700 mb-2">
            最高價格 (萬元)
          </label>
          <input
            id="price-max"
            v-model.number="formData.price_max"
            type="number"
            placeholder="無限制"
            min="0"
            step="1"
            class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
          />
        </div>
      </div>

      <!-- 操作按鈕 -->
      <div class="flex items-center justify-between pt-4">
        <div class="flex items-center space-x-3">
          <button
            type="submit"
            :disabled="loading"
            class="flex items-center px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-400 text-white rounded-lg hover:from-accent-600 hover:to-accent-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              v-if="loading"
              class="w-4 h-4 mr-2 animate-spin" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <svg 
              v-else
              class="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            {{ loading ? '搜尋中...' : '搜尋' }}
          </button>
          
          <button
            type="button"
            @click="clearFilters"
            :disabled="loading"
            class="flex items-center px-4 py-2 text-primary-600 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            清除篩選
          </button>
        </div>

        <!-- 搜尋結果統計 -->
        <div v-if="!loading && totalCount !== null" class="text-sm text-primary-600">
          共找到 <span class="font-medium">{{ totalCount }}</span> 筆結果
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700 text-sm">{{ error }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTendersStore, type TenderSearchParams } from '~/stores/tenders'

// Props 定義
interface Props {
  // 可以從外部傳入初始搜尋參數
  initialParams?: Partial<TenderSearchParams>
}

const props = withDefaults(defineProps<Props>(), {
  initialParams: () => ({})
})

// Emit 定義
const emit = defineEmits<{
  search: [params: TenderSearchParams]
  clear: []
}>()

// Store
const tendersStore = useTendersStore()
const { loading, error, totalCount, searchParams } = storeToRefs(tendersStore)

// 表單資料
const formData = reactive<TenderSearchParams>({
  tender_no: '',
  date_from: '',
  date_to: '',
  zoning: '',
  price_min: undefined,
  price_max: undefined,
  ...props.initialParams
})

// 處理表單提交
const handleSubmit = async () => {
  // 準備搜尋參數
  const params: TenderSearchParams = {
    tender_no: formData.tender_no || undefined,
    date_from: formData.date_from || undefined,
    date_to: formData.date_to || undefined,
    zoning: formData.zoning || undefined,
    price_min: formData.price_min ? formData.price_min * 10000 : undefined, // 轉換為台幣
    price_max: formData.price_max ? formData.price_max * 10000 : undefined, // 轉換為台幣
  }

  // 驗證日期範圍
  if (params.date_from && params.date_to && params.date_from > params.date_to) {
    error.value = '結束日期不能早於開始日期'
    return
  }

  // 驗證價格範圍
  if (params.price_min && params.price_max && params.price_min > params.price_max) {
    error.value = '最高價格不能低於最低價格'
    return
  }

  try {
    // 傳給 Pinia store 執行搜尋
    await tendersStore.searchTenders(params)
    
    // 發送事件給父組件
    emit('search', params)
  } catch (err) {
    console.error('搜尋失敗:', err)
  }
}

// 清除篩選
const clearFilters = () => {
  formData.tender_no = ''
  formData.date_from = ''
  formData.date_to = ''
  formData.zoning = ''
  formData.price_min = undefined
  formData.price_max = undefined

  // 重置 store
  tendersStore.resetSearch()
  
  // 發送事件給父組件
  emit('clear')
}

// 監聽外部參數變化
watch(() => props.initialParams, (newParams) => {
  Object.assign(formData, newParams)
}, { deep: true })

// 初始化時如果有參數就執行搜尋
onMounted(() => {
  if (Object.values(props.initialParams).some(val => val !== undefined && val !== '')) {
    handleSubmit()
  }
})
</script> 