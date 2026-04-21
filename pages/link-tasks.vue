<template>
  <NuxtLayout>
    <div class="min-h-screen bg-background flex items-center justify-center">
      <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div class="mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-primary mb-2">頁面已遷移</h1>
          <p class="text-primary-light mb-6">
            連結任務管理功能已整合到爬蟲任務管理中，為您提供更完整的功能體驗。
          </p>
        </div>
        
        <div class="space-y-4">
          <NuxtLink 
            to="/crawl-tasks-demo"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
            前往爬蟲任務管理
          </NuxtLink>
          
          <NuxtLink 
            to="/"
            class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors duration-200"
          >
            返回首頁
          </NuxtLink>
        </div>
        
        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-left">
              <h3 class="text-sm font-medium text-blue-800 mb-1">新功能亮點</h3>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>• 統一的任務管理介面</li>
                <li>• 即時狀態更新</li>
                <li>• 批量操作支援</li>
                <li>• 完整的API文檔</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// 頁面元資料
useHead({
  title: '頁面已遷移 - TFASC Portal',
  meta: [
    { name: 'description', content: '連結任務管理功能已遷移到爬蟲任務管理' }
  ]
})

// 5秒後自動重定向（可選）
// setTimeout(() => {
//   navigateTo('/crawl-tasks-demo')
// }, 5000)
</script> 