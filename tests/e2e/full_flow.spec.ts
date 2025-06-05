import { test, expect } from '@playwright/test'

const EXAMPLE_URL = 'https://tfasc.com.tw/BidTender/example'
const API_BASE_URL = 'http://localhost:3001/api'

test.describe('TFASC Portal E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route(`${API_BASE_URL}/crawl-tasks`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          json: []
        })
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          json: {
            id: 1,
            url: EXAMPLE_URL,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        })
      }
    })

    await page.route(`${API_BASE_URL}/crawl-tasks/1`, async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          url: EXAMPLE_URL,
          status: 'done',
          created_at: new Date().toISOString(),
          finished_at: new Date().toISOString()
        }
      })
    })

    await page.route(`${API_BASE_URL}/tenders`, async (route) => {
      await route.fulfill({
        json: [
          {
            id: '1',
            tenderNo: 'TEST001',
            announcement: '測試標案',
            startDate: '2025-01-27',
            endDate: '2025-02-27',
            reservePrice: 1000000,
            deposit: 100000,
            organization: 'TFASC',
            location: '台北市',
            status: 'active',
            lastUpdated: new Date().toISOString()
          }
        ]
      })
    })
  })

  test('user can submit URL and view result', async ({ page }) => {
    // 前往 Link Dashboard
    await page.goto('/link-dashboard')
    await expect(page.getByText('連結管理')).toBeVisible()

    // 點擊新增網址按鈕
    await page.click('[data-testid="add-link-button"]')
    await expect(page.getByText('新增標售連結')).toBeVisible()

    // 填寫表單
    await page.fill('[data-testid="url-input"]', EXAMPLE_URL)
    await page.fill('[data-testid="tender-no-input"]', 'TEST001')
    await page.fill('[data-testid="start-date-input"]', '2025-01-27')
    await page.fill('[data-testid="end-date-input"]', '2025-02-27')
    await page.fill('[data-testid="announcement-input"]', '測試標案')
    await page.fill('[data-testid="reserve-price-input"]', '1000000')
    await page.fill('[data-testid="deposit-input"]', '100000')

    // 提交表單
    await page.click('[data-testid="submit-button"]')
    
    // 等待模態框關閉
    await expect(page.getByText('新增標售連結')).not.toBeVisible()

    // 檢查任務已經被加入到表格中
    await expect(page.getByText('待處理')).toBeVisible()
    await expect(page.getByText(EXAMPLE_URL)).toBeVisible()

    // 模擬輪詢後狀態更新為 done
    await page.route(`${API_BASE_URL}/crawl-tasks/1`, async (route) => {
      await route.fulfill({
        json: {
          id: 1,
          url: EXAMPLE_URL,
          status: 'done',
          created_at: new Date().toISOString(),
          finished_at: new Date().toISOString()
        }
      })
    })

    // 點擊重新整理按鈕
    await page.click('[data-testid="refresh-button"]')
    
    // 檢查狀態更新為已完成
    await expect(page.getByText('已完成')).toBeVisible()
  })

  test('user can filter tasks by status', async ({ page }) => {
    // Mock API with multiple tasks
    await page.route(`${API_BASE_URL}/crawl-tasks`, async (route) => {
      await route.fulfill({
        json: [
          {
            id: 1,
            url: 'https://tfasc.com.tw/BidTender/example1',
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            url: 'https://tfasc.com.tw/BidTender/example2',
            status: 'running',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            url: 'https://tfasc.com.tw/BidTender/example3',
            status: 'done',
            created_at: new Date().toISOString()
          }
        ]
      })
    })

    await page.goto('/link-dashboard')

    // 檢查所有任務都顯示
    await expect(page.getByText('待處理')).toBeVisible()
    await expect(page.getByText('執行中')).toBeVisible()
    await expect(page.getByText('已完成')).toBeVisible()

    // 篩選待處理任務
    await page.selectOption('[data-testid="status-filter"]', 'pending')
    await expect(page.getByText('待處理')).toBeVisible()
    await expect(page.getByText('執行中')).not.toBeVisible()
    await expect(page.getByText('已完成')).not.toBeVisible()

    // 篩選執行中任務
    await page.selectOption('[data-testid="status-filter"]', 'running')
    await expect(page.getByText('執行中')).toBeVisible()
    await expect(page.getByText('待處理')).not.toBeVisible()
    await expect(page.getByText('已完成')).not.toBeVisible()

    // 顯示所有任務
    await page.selectOption('[data-testid="status-filter"]', 'all')
    await expect(page.getByText('待處理')).toBeVisible()
    await expect(page.getByText('執行中')).toBeVisible()
    await expect(page.getByText('已完成')).toBeVisible()
  })

  test('user can delete tasks', async ({ page }) => {
    // Mock API with task
    await page.route(`${API_BASE_URL}/crawl-tasks`, async (route) => {
      await route.fulfill({
        json: [
          {
            id: 1,
            url: EXAMPLE_URL,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]
      })
    })

    await page.route(`${API_BASE_URL}/crawl-tasks/1`, async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200 })
      }
    })

    await page.goto('/link-dashboard')

    // 檢查任務存在
    await expect(page.getByText(EXAMPLE_URL)).toBeVisible()

    // 點擊刪除按鈕
    await page.click('[data-testid="delete-task-1"]')

    // 確認刪除
    await page.getByRole('button', { name: '確定' }).click()

    // 模擬刪除後的API回應
    await page.route(`${API_BASE_URL}/crawl-tasks`, async (route) => {
      await route.fulfill({ json: [] })
    })

    // 檢查任務被移除
    await expect(page.getByText(EXAMPLE_URL)).not.toBeVisible()
    await expect(page.getByText('尚無連結任務')).toBeVisible()
  })

  test('user can search tenders', async ({ page }) => {
    await page.goto('/tenders')
    
    // 檢查標案列表
    await expect(page.getByText('標案搜尋')).toBeVisible()
    await expect(page.getByText('TEST001')).toBeVisible()
    await expect(page.getByText('測試標案')).toBeVisible()

    // 搜尋功能
    await page.fill('[data-testid="search-input"]', 'TEST001')
    await page.click('[data-testid="search-button"]')

    // 檢查搜尋結果
    await expect(page.getByText('TEST001')).toBeVisible()
  })

  test('user can navigate between pages', async ({ page }) => {
    await page.goto('/')

    // 檢查首頁
    await expect(page.getByText('TFASC Portal')).toBeVisible()

    // 前往 Link Dashboard
    await page.click('[data-testid="nav-link-dashboard"]')
    await expect(page.url()).toContain('/link-dashboard')

    // 前往 Tender Search
    await page.click('[data-testid="nav-tenders"]')
    await expect(page.url()).toContain('/tenders')

    // 返回首頁
    await page.click('[data-testid="nav-home"]')
    await expect(page.url()).toBe(page.url().split('/').slice(0, 3).join('/') + '/')
  })

  test('validates form inputs correctly', async ({ page }) => {
    await page.goto('/link-dashboard')

    // 點擊新增網址
    await page.click('[data-testid="add-link-button"]')

    // 嘗試提交空表單
    await page.click('[data-testid="submit-button"]')

    // 檢查驗證錯誤
    await expect(page.getByText('請輸入網址')).toBeVisible()
    await expect(page.getByText('請輸入標案編號')).toBeVisible()
    await expect(page.getByText('請輸入公告內容')).toBeVisible()

    // 輸入無效URL
    await page.fill('[data-testid="url-input"]', 'invalid-url')
    await page.click('[data-testid="submit-button"]')
    await expect(page.getByText('請輸入有效的網址格式')).toBeVisible()

    // 輸入非TFASC網址
    await page.fill('[data-testid="url-input"]', 'https://example.com')
    await page.click('[data-testid="submit-button"]')
    await expect(page.getByText('請輸入有效的 TFASC 官方網站連結')).toBeVisible()

    // 輸入沒有BidTender路徑的URL
    await page.fill('[data-testid="url-input"]', 'https://tfasc.com.tw/other')
    await page.click('[data-testid="submit-button"]')
    await expect(page.getByText('URL 格式錯誤：必須包含 /BidTender/ 路徑')).toBeVisible()
  })

  test('handles loading states correctly', async ({ page }) => {
    // Mock slow API response
    await page.route(`${API_BASE_URL}/crawl-tasks`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({ json: [] })
    })

    await page.goto('/link-dashboard')

    // 檢查載入狀態
    await expect(page.getByText('載入中...')).toBeVisible()
    
    // 等待載入完成
    await expect(page.getByText('載入中...')).not.toBeVisible()
  })

  test('handles error states correctly', async ({ page }) => {
    // Mock API error
    await page.route(`${API_BASE_URL}/crawl-tasks`, async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server Error' })
      })
    })

    await page.goto('/link-dashboard')

    // 檢查錯誤狀態
    await expect(page.getByText('載入資料時發生錯誤')).toBeVisible()
  })
}) 