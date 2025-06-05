<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div 
      class="bg-white rounded-xl shadow-strong max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-primary-200">
        <h2 class="text-xl font-semibold text-primary-900">新增標售連結</h2>
        <button
          @click="$emit('close')"
          class="text-primary-400 hover:text-primary-600 transition-colors duration-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- URL 輸入 -->
          <div>
            <label for="url" class="block text-sm font-medium text-primary-700 mb-2">
              標售連結 URL <span class="text-error-500">*</span>
            </label>
            <input
              id="url"
              v-model="form.url"
              type="url"
              required
              placeholder="https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/..."
              class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              :class="{ 'border-error-500': errors.url }"
            />
            <p v-if="errors.url" class="mt-1 text-sm text-error-600">{{ errors.url }}</p>
            <p class="mt-1 text-xs text-primary-500">
              請輸入 TFASC 官方網站的標售頁面連結
            </p>
          </div>

          <!-- 標號輸入 -->
          <div>
            <label for="tender_no" class="block text-sm font-medium text-primary-700 mb-2">
              標號 <span class="text-error-500">*</span>
            </label>
            <input
              id="tender_no"
              v-model="form.tender_no"
              type="text"
              required
              placeholder="例如: 1, 2, 3..."
              class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              :class="{ 'border-error-500': errors.tender_no }"
            />
            <p v-if="errors.tender_no" class="mt-1 text-sm text-error-600">{{ errors.tender_no }}</p>
          </div>

          <!-- 投標起始日期 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="receive_start" class="block text-sm font-medium text-primary-700 mb-2">
                投標開始日期 <span class="text-error-500">*</span>
              </label>
              <input
                id="receive_start"
                v-model="form.receive_start"
                type="date"
                required
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
                :class="{ 'border-error-500': errors.receive_start }"
              />
              <p v-if="errors.receive_start" class="mt-1 text-sm text-error-600">{{ errors.receive_start }}</p>
            </div>

            <div>
              <label for="receive_end" class="block text-sm font-medium text-primary-700 mb-2">
                投標結束日期 <span class="text-error-500">*</span>
              </label>
              <input
                id="receive_end"
                v-model="form.receive_end"
                type="date"
                required
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
                :class="{ 'border-error-500': errors.receive_end }"
              />
              <p v-if="errors.receive_end" class="mt-1 text-sm text-error-600">{{ errors.receive_end }}</p>
            </div>
          </div>

          <!-- 投標公告 -->
          <div>
            <label for="announcement" class="block text-sm font-medium text-primary-700 mb-2">
              投標公告 <span class="text-error-500">*</span>
            </label>
            <input
              id="announcement"
              v-model="form.announcement"
              type="text"
              required
              placeholder="例如: 北區分署114年度第102批"
              class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              :class="{ 'border-error-500': errors.announcement }"
            />
            <p v-if="errors.announcement" class="mt-1 text-sm text-error-600">{{ errors.announcement }}</p>
          </div>

          <!-- 面積資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="area_ping" class="block text-sm font-medium text-primary-700 mb-2">
                面積 (坪)
              </label>
              <input
                id="area_ping"
                v-model.number="form.area_ping"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.24"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              />
            </div>

            <div>
              <label for="area_m2" class="block text-sm font-medium text-primary-700 mb-2">
                面積 (平方公尺)
              </label>
              <input
                id="area_m2"
                v-model.number="form.area_m2"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.8"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
              />
            </div>
          </div>

          <!-- 分區 -->
          <div>
            <label for="zoning" class="block text-sm font-medium text-primary-700 mb-2">
              分區
            </label>
            <input
              id="zoning"
              v-model="form.zoning"
              type="text"
              placeholder="例如: 第二種住宅區"
              class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
            />
          </div>

          <!-- 價格資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="reserve_price" class="block text-sm font-medium text-primary-700 mb-2">
                底價 (新台幣) <span class="text-error-500">*</span>
              </label>
              <input
                id="reserve_price"
                v-model.number="form.reserve_price"
                type="number"
                min="0"
                required
                placeholder="180800"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
                :class="{ 'border-error-500': errors.reserve_price }"
              />
              <p v-if="errors.reserve_price" class="mt-1 text-sm text-error-600">{{ errors.reserve_price }}</p>
            </div>

            <div>
              <label for="deposit" class="block text-sm font-medium text-primary-700 mb-2">
                保證金 (新台幣) <span class="text-error-500">*</span>
              </label>
              <input
                id="deposit"
                v-model.number="form.deposit"
                type="number"
                min="0"
                required
                placeholder="18080"
                class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200"
                :class="{ 'border-error-500': errors.deposit }"
              />
              <p v-if="errors.deposit" class="mt-1 text-sm text-error-600">{{ errors.deposit }}</p>
            </div>
          </div>

          <!-- 備註 -->
          <div>
            <label for="note" class="block text-sm font-medium text-primary-700 mb-2">
              備註
            </label>
            <textarea
              id="note"
              v-model="form.note"
              rows="3"
              placeholder="其他相關資訊..."
              class="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors duration-200 resize-none"
            ></textarea>
          </div>

          <!-- 提交按鈕 -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-primary-200">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors duration-200"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-gradient-to-r from-accent-500 to-accent-400 text-white rounded-lg hover:from-accent-600 hover:to-accent-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span v-if="submitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                處理中...
              </span>
              <span v-else>新增標售</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TenderForm {
  url: string
  tender_no: string
  receive_start: string
  receive_end: string
  announcement: string
  area_ping?: number
  area_m2?: number
  zoning: string
  reserve_price: number
  deposit: number
  note: string
}

// 定義 emits
const emit = defineEmits<{
  close: []
  success: [data: any]
}>()

// 表單資料
const form = reactive<TenderForm>({
  url: '',
  tender_no: '',
  receive_start: '',
  receive_end: '',
  announcement: '',
  area_ping: undefined,
  area_m2: undefined,
  zoning: '',
  reserve_price: 0,
  deposit: 0,
  note: ''
})

// 錯誤資訊
const errors = reactive<Partial<Record<keyof TenderForm, string>>>({})

// 提交狀態
const submitting = ref(false)
const taskId = ref<number | null>(null)
const taskStatus = ref<'pending' | 'running' | 'done' | 'failed' | null>(null)

// API 方法
const { createCrawlTask, checkTaskStatus } = useCrawlTasks()
const { success: showSuccess, error: showError, warning: showWarning } = useToast()

// 表單驗證
const validateForm = (): boolean => {
  // 清除舊的錯誤
  Object.keys(errors).forEach(key => {
    delete errors[key as keyof TenderForm]
  })

  let isValid = true

  // URL 驗證 - 更嚴格的 BidTender 格式檢查
  if (!form.url) {
    errors.url = '請輸入標售連結 URL'
    isValid = false
  } else if (!form.url.includes('tfasc.com.tw')) {
    errors.url = '請輸入有效的 TFASC 官方網站連結'
    isValid = false
  } else if (!form.url.includes('/BidTender/')) {
    errors.url = 'URL 格式錯誤：必須包含 /BidTender/ 路徑'
    isValid = false
  } else {
    // 檢查 URL 格式是否正確
    try {
      const url = new URL(form.url)
      if (!url.pathname.includes('/BidTender/')) {
        errors.url = 'URL 格式錯誤：必須是 BidTender 頁面連結'
        isValid = false
      }
    } catch (e) {
      errors.url = 'URL 格式無效'
      isValid = false
    }
  }

  // 標號驗證
  if (!form.tender_no) {
    errors.tender_no = '請輸入標號'
    isValid = false
  }

  // 日期驗證
  if (!form.receive_start) {
    errors.receive_start = '請選擇投標開始日期'
    isValid = false
  }

  if (!form.receive_end) {
    errors.receive_end = '請選擇投標結束日期'
    isValid = false
  }

  if (form.receive_start && form.receive_end && form.receive_start > form.receive_end) {
    errors.receive_end = '結束日期不能早於開始日期'
    isValid = false
  }

  // 公告驗證
  if (!form.announcement) {
    errors.announcement = '請輸入投標公告'
    isValid = false
  }

  // 價格驗證
  if (!form.reserve_price || form.reserve_price <= 0) {
    errors.reserve_price = '請輸入有效的底價'
    isValid = false
  }

  if (!form.deposit || form.deposit <= 0) {
    errors.deposit = '請輸入有效的保證金'
    isValid = false
  }

  return isValid
}

// 輪詢檢查任務狀態
const pollTaskStatus = async (id: number) => {
  const maxAttempts = 30 // 最多檢查 30 次 (約 1 分鐘)
  let attempts = 0

  const checkStatus = async (): Promise<void> => {
    try {
      const task = await checkTaskStatus(id)
      taskStatus.value = task.status

      if (task.status === 'done') {
        showSuccess('爬蟲任務完成', '標售資料已成功新增到系統中')
        emit('success', { 
          message: '標售資料新增成功',
          data: { ...form },
          taskId: id
        })
        return
      } else if (task.status === 'failed') {
        showError('爬蟲任務失敗', '處理過程中發生錯誤')
        submitting.value = false
        return
      } else if (task.status === 'running') {
        showWarning('處理中...', '正在爬取標售資料，請稍候')
      }

      // 繼續輪詢
      attempts++
      if (attempts < maxAttempts && (task.status === 'pending' || task.status === 'running')) {
        setTimeout(() => checkStatus(), 2000) // 每 2 秒檢查一次
      } else if (attempts >= maxAttempts) {
        showWarning('任務處理中', '任務仍在處理中，請稍後到管理台查看結果')
        submitting.value = false
      }
    } catch (error: any) {
      console.error('檢查任務狀態失敗:', error)
      showError('檢查狀態失敗', error.message || '無法檢查任務狀態')
      submitting.value = false
    }
  }

  await checkStatus()
}

// 處理表單提交
const handleSubmit = async () => {
  if (!validateForm()) {
    // 如果有 URL 格式錯誤，顯示 Toast
    if (errors.url && errors.url.includes('BidTender')) {
      showError('URL 格式錯誤', errors.url)
    }
    return
  }

  submitting.value = true
  taskStatus.value = null
  taskId.value = null

  try {
    // 創建爬蟲任務
    const task = await createCrawlTask({ url: form.url })
    taskId.value = task.id
    taskStatus.value = task.status

    showSuccess('任務已建立', '開始處理標售資料，請稍候...')

    // 開始輪詢任務狀態
    await pollTaskStatus(task.id)

  } catch (error: any) {
    console.error('創建爬蟲任務失敗:', error)
    
    // 根據錯誤類型顯示不同的 Toast
    if (error.response?.status === 400) {
      showError('請求錯誤', error.response.data?.detail || '請檢查輸入的資料')
    } else if (error.response?.status === 422) {
      showError('資料驗證失敗', '請檢查 URL 格式是否正確')
    } else {
      showError('建立任務失敗', error.message || '伺服器發生錯誤，請稍後再試')
    }
    
    submitting.value = false
  }
}

// 處理背景點擊
const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// 監聽 ESC 鍵
onMounted(() => {
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      emit('close')
    }
  }

  document.addEventListener('keydown', handleEscapeKey)

  // 清理事件監聽器
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey)
  })
})
</script> 