import { test, expect } from '@playwright/test'

test.describe('Add Link Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/link-dashboard')
    await page.getByText('新增標售連結').click()
  })

  test('應該顯示模態框基本元素', async ({ page }) => {
    await expect(page.getByText('新增標售連結')).toBeVisible()
    await expect(page.getByText('標售連結 URL')).toBeVisible()
    await expect(page.getByText('標號')).toBeVisible()
    await expect(page.getByRole('button', { name: '新增標售' })).toBeVisible()
  })

  test('應該驗證 BidTender URL 格式 - 顯示錯誤訊息', async ({ page }) => {
    // 輸入錯誤的 URL（沒有 BidTender 路徑）
    await page.getByPlaceholder('https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/...').fill('https://www.tfasc.com.tw/other/page')
    
    // 填寫其他必填欄位
    await page.getByPlaceholder('例如: 1, 2, 3...').fill('1')
    await page.locator('input[type="date"]').first().fill('2025-01-01')
    await page.locator('input[type="date"]').last().fill('2025-01-31')
    await page.getByPlaceholder('例如: 北區分署114年度第102批').fill('測試公告')
    await page.getByPlaceholder('180800').fill('100000')
    await page.getByPlaceholder('18080').fill('10000')
    
    // 點擊提交
    await page.getByRole('button', { name: '新增標售' }).click()
    
    // 應該看到錯誤訊息（Toast 或 表單錯誤）
    await expect(page.locator('text=URL 格式錯誤').or(page.locator('text=BidTender'))).toBeVisible()
  })

  test('應該驗證必填欄位', async ({ page }) => {
    // 直接點擊提交而不填寫任何欄位
    await page.getByRole('button', { name: '新增標售' }).click()
    
    // 應該看到驗證錯誤
    await expect(page.locator('text=請輸入')).toBeVisible()
  })

  test('應該能夠關閉模態框', async ({ page }) => {
    // 點擊關閉按鈕
    await page.locator('button').filter({ hasText: '×' }).or(page.getByText('取消')).click()
    
    // 模態框應該消失
    await expect(page.getByText('新增標售連結').nth(1)).not.toBeVisible()
  })

  test('應該能夠使用 ESC 鍵關閉模態框', async ({ page }) => {
    // 按下 ESC 鍵
    await page.keyboard.press('Escape')
    
    // 模態框應該消失
    await expect(page.getByText('新增標售連結').nth(1)).not.toBeVisible()
  })

  test('應該驗證正確的 BidTender URL 格式', async ({ page }) => {
    // 輸入正確的 URL
    await page.getByPlaceholder('https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/...').fill('https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/2474')
    
    // 填寫其他必填欄位
    await page.getByPlaceholder('例如: 1, 2, 3...').fill('1')
    await page.locator('input[type="date"]').first().fill('2025-01-01')
    await page.locator('input[type="date"]').last().fill('2025-01-31')
    await page.getByPlaceholder('例如: 北區分署114年度第102批').fill('測試公告')
    await page.getByPlaceholder('180800').fill('100000')
    await page.getByPlaceholder('18080').fill('10000')
    
    // 點擊提交
    await page.getByRole('button', { name: '新增標售' }).click()
    
    // 應該開始處理（顯示載入狀態或成功訊息）
    await expect(page.locator('text=處理中').or(page.locator('text=任務已建立'))).toBeVisible()
  })
}) 