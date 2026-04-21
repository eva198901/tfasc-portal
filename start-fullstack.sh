#!/bin/bash

# TFASC Portal 全端啟動腳本
# 同時啟動前端 Nuxt 3 和後端 FastAPI

echo "🚀 啟動 TFASC Portal 全端應用程式"
echo "=================================="

# 檢查 Python 是否安裝
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 未安裝，請先安裝 Python 3.8+"
    exit 1
fi

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js 18+"
    exit 1
fi

# 檢查後端依賴
echo "🔍 檢查後端依賴..."
cd server
if [ ! -f "requirements.txt" ]; then
    echo "❌ 找不到 requirements.txt"
    exit 1
fi

# 安裝後端依賴（如果需要）
if [ ! -d "venv" ]; then
    echo "📦 建立 Python 虛擬環境..."
    python3 -m venv venv
fi

echo "📦 啟動虛擬環境並安裝依賴..."
source venv/bin/activate
pip install -r requirements.txt

# 啟動後端伺服器（背景執行）
echo "🔧 啟動後端 API 伺服器..."
python start.py &
BACKEND_PID=$!

# 等待後端啟動
echo "⏳ 等待後端伺服器啟動..."
sleep 5

# 檢查後端是否成功啟動
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 後端伺服器啟動成功 (PID: $BACKEND_PID)"
    echo "📚 API 文件: http://localhost:8000/docs"
else
    echo "❌ 後端伺服器啟動失敗"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 回到專案根目錄
cd ..

# 檢查前端依賴
echo "🔍 檢查前端依賴..."
if [ ! -f "package.json" ]; then
    echo "❌ 找不到 package.json"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 安裝前端依賴（如果需要）
if ! command -v pnpm &> /dev/null; then
    echo "❌ 請先安裝 pnpm（本專案僅支援 pnpm）：https://pnpm.io/installation"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 安裝前端依賴（pnpm）..."
    pnpm install
fi

# 啟動前端開發伺服器
echo "🎨 啟動前端開發伺服器..."
pnpm run dev &
FRONTEND_PID=$!

# 等待前端啟動
echo "⏳ 等待前端伺服器啟動..."
sleep 10

# 檢查前端是否成功啟動
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端伺服器啟動成功 (PID: $FRONTEND_PID)"
else
    echo "❌ 前端伺服器啟動失敗"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 TFASC Portal 全端應用程式啟動完成！"
echo "=================================="
echo "🎨 前端應用程式: http://localhost:3000"
echo "🔧 後端 API: http://localhost:8000"
echo "📚 API 文件: http://localhost:8000/docs"
echo "🧪 示範頁面: http://localhost:3000/crawl-tasks-demo"
echo ""
echo "💡 提示:"
echo "   - 按 Ctrl+C 停止所有服務"
echo "   - 前端會自動代理 API 請求到後端"
echo "   - 修改代碼會自動重新載入"
echo ""

# 等待用戶中斷
trap 'echo ""; echo "🛑 正在停止服務..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ 所有服務已停止"; exit 0' INT

# 保持腳本運行
while true; do
    sleep 1
done 