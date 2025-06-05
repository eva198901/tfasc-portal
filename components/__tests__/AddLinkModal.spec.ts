import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AddLinkModal from '../AddLinkModal.vue'

// Mock composables
vi.mock('~/composables/useCrawlTasks', () => ({
  useCrawlTasks: () => ({
    createCrawlTask: vi.fn().mockResolvedValue({
      id: 1,
      url: 'https://tfasc.com.tw/BidTender/example',
      status: 'pending'
    }),
    checkTaskStatus: vi.fn().mockResolvedValue({
      id: 1,
      status: 'done'
    })
  })
}))

vi.mock('~/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  })
}))

describe('AddLinkModal.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders modal correctly', () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    expect(wrapper.find('[data-testid="modal-title"]').text()).toContain('新增標售連結')
    expect(wrapper.find('[data-testid="url-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="submit-button"]').exists()).toBe(true)
  })

  it('validates TFASC URL format', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    // 輸入無效URL
    const urlInput = wrapper.find('[data-testid="url-input"]')
    await urlInput.setValue('https://example.com')
    
    const submitButton = wrapper.find('[data-testid="submit-button"]')
    await submitButton.trigger('click')

    // 檢查錯誤訊息
    expect(wrapper.find('[data-testid="url-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('請輸入有效的 TFASC 官方網站連結')
  })

  it('validates BidTender path requirement', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    // 輸入沒有BidTender路徑的URL
    const urlInput = wrapper.find('[data-testid="url-input"]')
    await urlInput.setValue('https://tfasc.com.tw/other-page')
    
    const submitButton = wrapper.find('[data-testid="submit-button"]')
    await submitButton.trigger('click')

    // 檢查錯誤訊息
    expect(wrapper.find('[data-testid="url-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('URL 格式錯誤：必須包含 /BidTender/ 路徑')
  })

  it('accepts valid TFASC BidTender URL', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    // 輸入有效URL
    const urlInput = wrapper.find('[data-testid="url-input"]')
    await urlInput.setValue('https://tfasc.com.tw/BidTender/example')
    
    // 填寫其他必要欄位
    await wrapper.find('[data-testid="tender-no-input"]').setValue('TEST001')
    await wrapper.find('[data-testid="start-date-input"]').setValue('2025-01-27')
    await wrapper.find('[data-testid="end-date-input"]').setValue('2025-02-27')
    await wrapper.find('[data-testid="announcement-input"]').setValue('測試公告')
    await wrapper.find('[data-testid="reserve-price-input"]').setValue('1000000')
    await wrapper.find('[data-testid="deposit-input"]').setValue('100000')

    const submitButton = wrapper.find('[data-testid="submit-button"]')
    await submitButton.trigger('click')

    // 檢查沒有錯誤訊息
    expect(wrapper.find('[data-testid="url-error"]').exists()).toBe(false)
  })

  it('validates required fields', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    const submitButton = wrapper.find('[data-testid="submit-button"]')
    await submitButton.trigger('click')

    // 檢查必填欄位錯誤
    expect(wrapper.find('[data-testid="url-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tender-no-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="announcement-error"]').exists()).toBe(true)
  })

  it('validates date range', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    // 設定結束日期早於開始日期
    await wrapper.find('[data-testid="start-date-input"]').setValue('2025-02-27')
    await wrapper.find('[data-testid="end-date-input"]').setValue('2025-01-27')

    const submitButton = wrapper.find('[data-testid="submit-button"]')
    await submitButton.trigger('click')

    // 檢查日期錯誤
    expect(wrapper.find('[data-testid="end-date-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('結束日期不能早於開始日期')
  })

  it('validates price fields', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    // 設定無效價格
    await wrapper.find('[data-testid="reserve-price-input"]').setValue('0')
    await wrapper.find('[data-testid="deposit-input"]').setValue('-100')

    const submitButton = wrapper.find('[data-testid="submit-button"]')
    await submitButton.trigger('click')

    // 檢查價格錯誤
    expect(wrapper.find('[data-testid="reserve-price-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="deposit-error"]').exists()).toBe(true)
  })

  it('emits close event when close button clicked', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    const closeButton = wrapper.find('[data-testid="close-button"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when backdrop clicked', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    const backdrop = wrapper.find('[data-testid="modal-backdrop"]')
    await backdrop.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows submitting state during form submission', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    // 填寫有效表單
    await wrapper.find('[data-testid="url-input"]').setValue('https://tfasc.com.tw/BidTender/example')
    await wrapper.find('[data-testid="tender-no-input"]').setValue('TEST001')
    await wrapper.find('[data-testid="start-date-input"]').setValue('2025-01-27')
    await wrapper.find('[data-testid="end-date-input"]').setValue('2025-02-27')
    await wrapper.find('[data-testid="announcement-input"]').setValue('測試公告')
    await wrapper.find('[data-testid="reserve-price-input"]').setValue('1000000')
    await wrapper.find('[data-testid="deposit-input"]').setValue('100000')

    const submitButton = wrapper.find('[data-testid="submit-button"]')
    await submitButton.trigger('click')

    // 檢查提交狀態
    expect(wrapper.find('[data-testid="submit-button"]').attributes('disabled')).toBeDefined()
  })

  it('handles keyboard events correctly', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    // 模擬ESC鍵
    await wrapper.trigger('keydown.esc')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('resets form after successful submission', async () => {
    const wrapper = mount(AddLinkModal, {
      global: {
        plugins: [pinia]
      }
    })

    // 填寫表單
    const urlInput = wrapper.find('[data-testid="url-input"]')
    await urlInput.setValue('https://tfasc.com.tw/BidTender/example')

    // 模擬成功提交
    const vm = wrapper.vm as any
    vm.handleSubmit()

    await wrapper.vm.$nextTick()

    // 檢查表單重置
    expect((urlInput.element as HTMLInputElement).value).toBe('')
  })
}) 