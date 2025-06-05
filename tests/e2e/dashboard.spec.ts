import { test, expect } from '@playwright/test'

test.describe('Link Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // 導航到 Link Dashboard
    await page.goto('/link-dashboard')
  })

  test('應該顯示頁面標題和基本元素', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.locator('h1')).toContainText('TFASC 標售管理台')
    
    // 檢查統計卡片
    await expect(page.locator('.grid').first()).toBeVisible()
    
    // 檢查快速操作區域
    await expect(page.getByText('新增標售連結')).toBeVisible()
    await expect(page.getByText('搜尋標售資訊')).toBeVisible()
    await expect(page.getByText('手動同步資料')).toBeVisible()
  })

  test('應該能夠打開新增標售連結模態框', async ({ page }) => {
    // 點擊新增標售連結按鈕
    await page.getByText('新增標售連結').click()
    
    // 檢查模態框是否出現
    await expect(page.getByText('新增標售連結')).toBeVisible()
    await expect(page.getByText('標售連結 URL')).toBeVisible()
  })

  test('應該能夠導航到搜尋頁面', async ({ page }) => {
    // 點擊搜尋標售資訊按鈕
    await page.getByText('搜尋標售資訊').click()
    
    // 檢查是否導航到搜尋頁面
    await expect(page).toHaveURL('/tender-search')
    await expect(page.locator('h1')).toContainText('標售資訊搜尋')
  })

  test('應該顯示 API 狀態', async ({ page }) => {
    // 檢查 API 狀態指示器
    const apiStatus = page.locator('.flex').filter({ hasText: 'API' })
    await expect(apiStatus).toBeVisible()
  })

  test('應該顯示最新標售資訊區域', async ({ page }) => {
    // 檢查最新標售資訊區域
    await expect(page.getByText('最新標售資訊')).toBeVisible()
    await expect(page.getByText('查看全部')).toBeVisible()
  })
}) 