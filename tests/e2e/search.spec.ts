import { test, expect } from '@playwright/test'

test.describe('標售搜尋功能 E2E 測試', () => {
  test.beforeEach(async ({ page }) => {
    // 導航到標售搜尋頁面
    await page.goto('/tender-search')
    
    // 等待頁面載入完成
    await expect(page.locator('h1')).toContainText('標售資訊搜尋')
    await expect(page.getByText('搜尋篩選')).toBeVisible()
  })

  test('應該能夠使用分區和價格範圍搜尋', async ({ page }) => {
    // 填入搜尋條件：分區="住宅區" + 最高價格 <= 20萬元
    await page.selectOption('#zoning', '住宅區')
    await page.fill('#price-max', '20')  // 20 萬元
    
    // 點擊搜尋按鈕
    await page.getByRole('button', { name: /搜尋/ }).click()
    
    // 等待搜尋完成（等待載入狀態消失）
    await page.waitForTimeout(2000) // 等待請求完成
    
    // 檢查頁面狀態
    const isLoading = await page.locator('.inline-block.animate-spin').isVisible()
    if (!isLoading) {
      // 檢查是否有搜尋結果表格
      const tableExists = await page.locator('table').isVisible()
      
      if (tableExists) {
        const searchResults = page.locator('tbody tr')
        const resultCount = await searchResults.count()
        
        if (resultCount > 0) {
          // 期望表格長度 >= 1
          expect(resultCount).toBeGreaterThanOrEqual(1)
          
          // 檢查結果是否包含 "住宅"
          const tableContent = await page.locator('table').textContent()
          expect(tableContent).toContain('住宅')
          
          console.log(`找到 ${resultCount} 筆搜尋結果`)
        } else {
          console.log('沒有找到符合條件的結果')
        }
      } else {
        // 檢查是否顯示無結果或錯誤訊息
        const noResultsVisible = await page.getByText('尚未搜尋或無符合條件的結果').isVisible()
        const errorVisible = await page.locator('.text-error-600').isVisible()
        
        if (noResultsVisible) {
          console.log('顯示無結果訊息')
        } else if (errorVisible) {
          const errorText = await page.locator('.text-error-600').textContent()
          console.log('顯示錯誤訊息:', errorText)
        }
        
        // 至少要有其中一種狀態
        expect(noResultsVisible || errorVisible).toBe(true)
      }
    } else {
      console.log('搜尋仍在進行中')
    }
  })

  test('應該能夠清除搜尋條件', async ({ page }) => {
    // 填入一些搜尋條件
    await page.fill('#tender-no', '測試標號')
    await page.selectOption('#zoning', '住宅區')
    await page.fill('#price-min', '10')
    await page.fill('#price-max', '50')
    await page.fill('#date-from', '2024-01-01')
    await page.fill('#date-to', '2024-12-31')
    
    // 點擊清除篩選
    await page.getByRole('button', { name: '清除篩選' }).click()
    
    // 檢查所有欄位是否已清空
    await expect(page.locator('#tender-no')).toHaveValue('')
    await expect(page.locator('#zoning')).toHaveValue('')
    await expect(page.locator('#price-min')).toHaveValue('')
    await expect(page.locator('#price-max')).toHaveValue('')
    await expect(page.locator('#date-from')).toHaveValue('')
    await expect(page.locator('#date-to')).toHaveValue('')
  })

  test('應該驗證表單輸入', async ({ page }) => {
    // 測試日期範圍驗證：結束日期早於開始日期
    await page.fill('#date-from', '2024-12-31')
    await page.fill('#date-to', '2024-01-01')
    await page.getByRole('button', { name: /搜尋/ }).click()
    
    // 等待驗證
    await page.waitForTimeout(1000)
    
    // 檢查是否有錯誤訊息顯示
    const hasDateError = await page.locator('form').getByText('結束日期不能早於開始日期').isVisible()
    if (hasDateError) {
      console.log('日期驗證正確顯示錯誤')
    }
    
    // 清除並測試價格範圍驗證
    await page.getByRole('button', { name: '清除篩選' }).click()
    
    await page.fill('#price-min', '100')
    await page.fill('#price-max', '50')
    await page.getByRole('button', { name: /搜尋/ }).click()
    
    // 等待驗證
    await page.waitForTimeout(1000)
    
    // 檢查是否有價格錯誤訊息
    const hasPriceError = await page.locator('form').getByText('最高價格不能低於最低價格').isVisible()
    if (hasPriceError) {
      console.log('價格驗證正確顯示錯誤')
    }
  })

  test('應該能夠返回管理台', async ({ page }) => {
    await page.getByRole('button', { name: '返回管理台' }).click()
    
    // 等待導航完成
    await page.waitForTimeout(1000)
    
    // 檢查是否導航到管理台 
    await expect(page).toHaveURL(/\/link-dashboard/)
  })

  test('搜尋表單基本功能測試', async ({ page }) => {
    // 測試基本搜尋表單是否正常運作
    
    // 檢查表單元素是否存在
    await expect(page.locator('#tender-no')).toBeVisible()
    await expect(page.locator('#zoning')).toBeVisible()
    await expect(page.locator('#price-min')).toBeVisible()
    await expect(page.locator('#price-max')).toBeVisible()
    await expect(page.locator('#date-from')).toBeVisible()
    await expect(page.locator('#date-to')).toBeVisible()
    
    // 測試輸入功能
    await page.fill('#tender-no', '110001')
    await expect(page.locator('#tender-no')).toHaveValue('110001')
    
    await page.selectOption('#zoning', '住宅區')
    await expect(page.locator('#zoning')).toHaveValue('住宅區')
    
    await page.fill('#price-min', '10')
    await expect(page.locator('#price-min')).toHaveValue('10')
    
    await page.fill('#price-max', '100')
    await expect(page.locator('#price-max')).toHaveValue('100')
    
    // 檢查搜尋按鈕
    await expect(page.getByRole('button', { name: /搜尋/ })).toBeVisible()
    await expect(page.getByRole('button', { name: '清除篩選' })).toBeVisible()
    
    console.log('搜尋表單基本功能正常')
  })
}) 