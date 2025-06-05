import { test, expect } from '@playwright/test'

test.describe('Basic Tests', () => {
  test('應該能夠載入首頁', async ({ page }) => {
    await page.goto('/')
    
    // 檢查頁面是否載入成功
    await expect(page).toHaveTitle(/TFASC Portal/)
  })

  test('應該能夠導航到 link-dashboard', async ({ page }) => {
    await page.goto('/link-dashboard')
    
    // 檢查是否成功載入管理台頁面
    await expect(page.locator('h1')).toContainText('TFASC')
  })
}) 