# TFASC Portal

TFASC 標售資訊管理系統 - 統一標案資料處理與管理平台

## 🚀 快速開始

### 安裝依賴
```bash
pnpm install
```

### 開發環境
```bash
pnpm run dev
```

應用程式將在 `http://localhost:3000` 運行

### 建置
```bash
pnpm run build
```

### 預覽生產版本
```bash
pnpm run preview
```

## 🧪 測試

### E2E 測試
```bash
# 運行所有 E2E 測試
pnpm run test:e2e

# 使用 UI 模式運行測試
pnpm run test:e2e:ui

# 除錯模式
pnpm run test:e2e:debug
```

## 🏗️ 專案結構

```
tfasc-portal/
├── components/          # Vue 組件
├── composables/         # Composable 函數
├── pages/              # 頁面路由
├── types/              # TypeScript 類型定義
├── tests/e2e/          # E2E 測試
├── layouts/            # 布局模板
└── assets/             # 靜態資源
```

## 🎯 主要功能

- ✅ 標售資訊管理
- ✅ 智慧搜尋與篩選
- ✅ CSV 數據匯出
- ✅ 即時任務狀態追蹤
- ✅ 響應式設計
- ✅ Toast 通知系統

## 🔧 技術棧

- **框架**: Nuxt 3
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: Pinia
- **測試**: Playwright
- **包管理**: pnpm (必須使用 pnpm)

## 📋 驗收清單

詳見 [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)

## 🚀 功能特色

- **儀表板** - 查看整體標案統計、進度概覽和近期活動
- **標案管理** - 新增、編輯和管理所有標案，追蹤標案進度
- **響應式設計** - 支援桌面和行動裝置
- **現代化界面** - 使用 Tailwind CSS 打造美觀的使用者介面

## 🛠 技術架構

- **Nuxt 3** - Vue.js 全端框架
- **Tailwind CSS** - 實用優先的 CSS 框架
- **Vue 3** - 漸進式 JavaScript 框架
- **TypeScript** - 型別安全的 JavaScript
- **PostCSS** - CSS 後處理器

## 📦 安裝與設定

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 啟動開發服務器

```bash
pnpm run dev
```

開發服務器將在 http://localhost:3000 啟動

### 3. 建置生產版本

```bash
pnpm run build
```

### 4. 預覽生產版本

```bash
pnpm run preview
```

## 📁 專案結構

```
tfasc-portal/
├── assets/
│   └── css/
│       └── main.css          # 主要 CSS 文件 (Tailwind 引入)
├── pages/
│   ├── index.vue             # 首頁
│   ├── dashboard.vue         # 儀表板頁面
│   └── tenders.vue           # 標案管理頁面
├── app.vue                   # 根組件
├── nuxt.config.ts            # Nuxt 配置文件
├── tailwind.config.js        # Tailwind CSS 配置
├── postcss.config.js         # PostCSS 配置
└── package.json              # 專案依賴和腳本
```

## 🎨 頁面說明

### 首頁 (/)
- 系統介紹和功能導覽
- 提供快速進入儀表板和標案管理的入口

### 儀表板 (/dashboard)
- 標案統計概覽 (總數、已完成、進行中)
- 近期活動時間軸
- 快速操作功能

### 標案管理 (/tenders)
- 標案列表檢視
- 搜尋和篩選功能 (按狀態、類別)
- 標案操作功能 (檢視、編輯、刪除)
- 響應式表格設計

## 🎯 主要功能

### 標案狀態管理
- 準備中 (黃色標籤)
- 進行中 (藍色標籤) 
- 已完成 (綠色標籤)
- 已取消 (紅色標籤)

### 標案類別
- 資訊服務
- 設備採購
- 維護服務
- 軟體授權

### 搜尋與篩選
- 支援標案名稱和編號搜尋
- 按狀態篩選
- 按類別篩選
- 清除篩選功能

## 🔧 自訂設定

### Tailwind CSS
Tailwind 配置文件位於 `tailwind.config.js`，包含：
- 內容掃描路徑設定
- 主題擴展配置
- Typography 插件

### Nuxt 配置
Nuxt 配置文件位於 `nuxt.config.ts`，包含：
- CSS 文件引入
- PostCSS 插件配置
- 開發工具設定

## 📝 開發說明

### 新增頁面
在 `pages/` 目錄下建立 `.vue` 文件，Nuxt 將自動產生對應路由。

### 樣式開發
使用 Tailwind CSS 類別進行樣式設計，主要 CSS 文件位於 `assets/css/main.css`。

### 組件開發
可在 `components/` 目錄下建立可重用組件 (需要時建立此目錄)。

## 🚀 部署

專案支援多種部署方式：
- Vercel
- Netlify
- Node.js 服務器
- 靜態託管服務

詳細部署說明請參考 [Nuxt 3 部署文件](https://nuxt.com/docs/getting-started/deployment)

## 📄 授權

此專案為內部使用，請遵守相關資料保護和隱私政策。

---

建立日期：2025年6月4日  
最後更新：2025年6月4日

## ⚠️ 重要提醒

本專案使用 **pnpm** 作為包管理器，請確保：
1. 已安裝 pnpm: `npm install -g pnpm`
2. 使用 pnpm 指令而非 npm 或 yarn
3. E2E 測試需要先安裝瀏覽器: `pnpm exec playwright install`
