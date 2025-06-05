import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Nuxt 組件
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    runWithContext: (fn: any) => fn()
  }),
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3001/api'
    }
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    go: vi.fn()
  }),
  useRoute: () => ({
    params: {},
    query: {},
    path: '/'
  }),
  navigateTo: vi.fn(),
  useHead: vi.fn(),
  useLazyAsyncData: vi.fn(),
  useAsyncData: vi.fn()
}))

// Mock Nuxt Link component
config.global.stubs = {
  NuxtLink: {
    template: '<a><slot /></a>'
  },
  NuxtLayout: {
    template: '<div><slot /></div>'
  },
  NuxtPage: {
    template: '<div><slot /></div>'
  }
}

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true)
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})) 