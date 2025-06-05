import { test, expect } from '@playwright/test'

test.describe('Tender Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tender-search')
  })

  test('應該顯示搜尋頁面基本元素', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('標售資訊搜尋')
    await expect(page.getByText('搜尋篩選')).toBeVisible()
    await expect(page.getByPlaceholder('搜尋標號...')).toBeVisible()
    await expect(page.getByPlaceholder('搜尋公告內容...')).toBeVisible()
  })

  test('應該能夠執行搜尋', async ({ page }) => {
    await page.getByRole('button', { name: '搜尋' }).click()
    // 檢查載入狀態或結果
    await expect(page.locator('table, .text-center')).toBeVisible()
  })

  test('應該能夠清除篩選', async ({ page }) => {
    // 輸入一些搜尋條件
    await page.getByPlaceholder('搜尋標號...').fill('123')
    await page.getByPlaceholder('搜尋公告內容...').fill('測試')
    
    // 點擊清除篩選
    await page.getByRole('button', { name: '清除篩選' }).click()
    
    // 檢查輸入框是否已清空
    await expect(page.getByPlaceholder('搜尋標號...')).toHaveValue('')
    await expect(page.getByPlaceholder('搜尋公告內容...')).toHaveValue('')
  })

  test('應該能夠匯出 CSV', async ({ page }) => {
    // 檢查匯出 CSV 按鈕存在
    await expect(page.getByRole('button', { name: '匯出 CSV' })).toBeVisible()
  })

  test('應該能夠改變分頁設定', async ({ page }) => {
    // 檢查每頁顯示選擇器
    const limitSelect = page.locator('select').filter({ hasText: '10' })
    await expect(limitSelect).toBeVisible()
  })

  test('應該能夠返回管理台', async ({ page }) => {
    await page.getByRole('button', { name: '返回管理台' }).click()
    await expect(page).toHaveURL('/link-dashboard')
  })
}) 