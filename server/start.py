#!/usr/bin/env python3
"""
TFASC Portal 後端啟動腳本
"""

import uvicorn
from config import settings

def start_server():
    """啟動 FastAPI 伺服器"""
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug",
        access_log=True
    )

if __name__ == "__main__":
    print(f"🚀 啟動 {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"📍 伺服器地址: http://{settings.HOST}:{settings.PORT}")
    print(f"📚 API 文件: http://{settings.HOST}:{settings.PORT}/docs")
    print(f"🔧 除錯模式: {'開啟' if settings.DEBUG else '關閉'}")
    
    start_server() 