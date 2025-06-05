<template>
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
            <span class="bg-accent/10 text-accent px-4 py-2 rounded-md text-sm font-medium">
              儀表板
            </span>
            <NuxtLink to="/tenders" 
                      class="text-primary-light hover:text-primary px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
              標案管理
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要內容 -->
    <main class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-primary mb-4">儀表板</h1>
        <p class="text-lg text-primary-light">
          歡迎使用 TFASC Portal 管理系統
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
useHead({
  title: '儀表板 - TFASC Portal',
  meta: [
    { name: 'description', content: 'TFASC Portal 儀表板' }
  ]
})
</script> 