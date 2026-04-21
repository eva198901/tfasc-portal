// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  // 開發時若出現 vite-node「IPC connection closed」，可先設 NUXT_DEVTOOLS=false 再 pnpm dev
  devtools: {
    enabled: import.meta.dev && process.env.NUXT_DEVTOOLS !== 'false',
  },

  // 固定綁定本機 loopback，減少 IPv6／主機名與 HMR WebSocket 不一致導致的連線中斷（macOS 常見）
  devServer: {
    host: process.env.NUXT_DEV_HOST || '127.0.0.1',
  },
  
  css: [
    '~/assets/css/main.css',
    '@fontsource/noto-sans-tc/400.css',
    '@fontsource/noto-sans-tc/500.css',
    '@fontsource/noto-sans-tc/600.css',
    '@fontsource/noto-sans-tc/700.css'
  ],
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  // 性能優化設定
  experimental: {
    payloadExtraction: false
  },
  
  // 建置優化
  nitro: {
    compressPublicAssets: true,
    minify: true
  },
  
  // PWA 和 SEO 優化
  app: {
    head: {
      title: 'TFASC Portal - 標案資料處理平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'TFASC Portal 統一標案資料處理與管理平台' },
        { name: 'theme-color', content: '#2563eb' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  },
  
  runtimeConfig: {
    // 私有環境變數（僅在服務端可用）
    apiSecret: '',
    
    // 公共環境變數（客戶端和服務端都可用）
    public: {
      // 使用 NUXT_PUBLIC_API_BASE_URL 環境變數，默認為 TFASC API v0.4.3
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
    }
  },
  
  // Vite 優化設定
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            utils: ['axios']
          }
        }
      }
    },
    // 開發模式下的 API 代理設定（解決 CORS 問題）- v0.4.3
    server: {
      hmr: {
        host: process.env.NUXT_VITE_HMR_HOST || '127.0.0.1',
      },
      watch: {
        ignored: ['**/.git/**', '**/node_modules/**', '**/.output/**'],
        // macOS 若出現 EMFILE: too many open files，可設 NUXT_VITE_POLL=1 改用輪詢（較吃 CPU）
        usePolling: process.env.NUXT_VITE_POLL === '1',
        interval: process.env.NUXT_VITE_POLL === '1' ? 1000 : undefined,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        },
        '/health': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
