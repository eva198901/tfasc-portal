import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()
      
      if (url.includes('/crawl-tasks')) {
        await route.fulfill({
          json: [
            {
              id: 1,
              url: 'https://tfasc.com.tw/BidTender/example',
              status: 'pending',
              created_at: new Date().toISOString()
            }
          ]
        })
      } else if (url.includes('/tenders')) {
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
      } else {
        await route.continue()
      }
    })
  })

  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('link dashboard should not have accessibility violations', async ({ page }) => {
    await page.goto('/link-dashboard')
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('tender search page should not have accessibility violations', async ({ page }) => {
    await page.goto('/tenders')
    await page.waitForLoadState('networkidle')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('add link modal should not have accessibility violations', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 打開模態框
    await page.click('[data-testid="add-link-button"]')
    await page.waitForSelector('[data-testid="modal-title"]')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation should work correctly', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 測試Tab鍵導航
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // 測試表單內的鍵盤導航
    await page.click('[data-testid="add-link-button"]')
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="url-input"]:focus')).toBeVisible()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="tender-no-input"]:focus')).toBeVisible()
    
    // 測試ESC鍵關閉模態框
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="modal-title"]')).not.toBeVisible()
  })

  test('form labels and inputs should be properly associated', async ({ page }) => {
    await page.goto('/link-dashboard')
    await page.click('[data-testid="add-link-button"]')
    
    // 檢查表單標籤和輸入框的關聯
    const urlInput = page.locator('[data-testid="url-input"]')
    const urlLabel = page.locator('label[for="url"]')
    
    await expect(urlLabel).toBeVisible()
    await expect(urlInput).toHaveAttribute('id', 'url')
    
    // 檢查必填欄位標示
    await expect(urlLabel).toContainText('*')
  })

  test('error messages should be accessible', async ({ page }) => {
    await page.goto('/link-dashboard')
    await page.click('[data-testid="add-link-button"]')
    
    // 觸發驗證錯誤
    await page.click('[data-testid="submit-button"]')
    
    // 檢查錯誤訊息的無障礙屬性
    const urlError = page.locator('[data-testid="url-error"]')
    await expect(urlError).toBeVisible()
    await expect(urlError).toHaveAttribute('role', 'alert')
    
    // 檢查aria-describedby連結
    const urlInput = page.locator('[data-testid="url-input"]')
    await expect(urlInput).toHaveAttribute('aria-describedby', 'url-error')
  })

  test('status indicators should have proper ARIA labels', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 檢查狀態徽章的無障礙標籤
    const statusBadge = page.locator('[data-testid="status-pending"]').first()
    await expect(statusBadge).toHaveAttribute('aria-label', '狀態：待處理')
  })

  test('buttons should have descriptive text or ARIA labels', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 檢查新增按鈕
    const addButton = page.locator('[data-testid="add-link-button"]')
    await expect(addButton).toHaveText(/新增/)
    
    // 檢查刪除按鈕
    const deleteButton = page.locator('[data-testid="delete-task-1"]').first()
    await expect(deleteButton).toHaveAttribute('aria-label', '刪除任務')
  })

  test('tables should have proper headers and structure', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 檢查表格標題
    const table = page.locator('[data-testid="tasks-table"]')
    await expect(table).toBeVisible()
    
    // 檢查表格標題行
    const headers = page.locator('th')
    await expect(headers.first()).toBeVisible()
    
    // 檢查表格的可訪問性
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="tasks-table"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('focus management in modals should work correctly', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 打開模態框
    await page.click('[data-testid="add-link-button"]')
    
    // 檢查焦點是否移動到模態框
    await expect(page.locator('[data-testid="modal-title"]')).toBeFocused()
    
    // 測試焦點陷阱（Tab循環）
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // 關閉模態框後焦點應該回到觸發按鈕
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="add-link-button"]')).toBeFocused()
  })

  test('color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('page should have proper heading structure', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 檢查標題層級結構
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('form controls should have labels', async ({ page }) => {
    await page.goto('/link-dashboard')
    await page.click('[data-testid="add-link-button"]')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 測試所有互動元素都可以用鍵盤訪問
    const interactiveElements = page.locator('button, a, input, select, textarea')
    const count = await interactiveElements.count()
    
    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i)
      await element.focus()
      await expect(element).toBeFocused()
    }
  })
}) 