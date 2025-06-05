<template>
  <NuxtLayout>
    <div class="min-h-screen bg-background">
      <!-- 導航欄 -->
      <nav class="bg-white shadow-card border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-sm">T</span>
                </div>
                <h1 class="text-xl font-semibold text-primary">TFASC Portal</h1>
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <NuxtLink to="/link-dashboard" 
                        class="text-primary-light hover:text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                儀表板
              </NuxtLink>
              <NuxtLink to="/tender-search" 
                        class="text-primary-light hover:text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                標售搜尋
              </NuxtLink>
              <NuxtLink to="/link-tasks" 
                        class="text-primary-light hover:text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                連結任務
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>

      <!-- 主要內容 -->
      <main class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-primary mb-4">
            歡迎使用 <span class="text-accent">TFASC Portal</span>
          </h1>
          <p class="text-lg text-primary-light max-w-2xl mx-auto mb-8">
            標案資料處理與管理平台
          </p>
          
          <!-- 快速開始按鈕 -->
          <div class="flex items-center justify-center space-x-4">
            <NuxtLink to="/link-dashboard"
                      class="px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-400 text-white rounded-lg hover:from-accent-600 hover:to-accent-500 transition-all duration-300 transform hover:scale-105">
              進入管理台
            </NuxtLink>
            <NuxtLink to="/tender-search"
                      class="px-6 py-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-300">
              瀏覽標售
            </NuxtLink>
          </div>
        </div>
      </main>
    </div>
  </NuxtLayout>
</template>

<script setup>
useHead({
  title: 'TFASC Portal',
  meta: [
    { name: 'description', content: 'TFASC Portal 標案資料處理平台' }
  ]
})
</script> 