"""
TFASC Portal 後端配置設定
"""

import os
from typing import Optional

class Settings:
    """應用程式設定"""
    
    # 資料庫設定
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./crawl_tasks.db"
    )
    
    # API 設定
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "TFASC Portal API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "標售資料爬蟲任務管理 API"
    
    # 伺服器設定
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS 設定
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ]
    
    # 安全設定
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # 爬蟲任務設定
    MAX_CONCURRENT_TASKS: int = int(os.getenv("MAX_CONCURRENT_TASKS", "5"))
    TASK_TIMEOUT_SECONDS: int = int(os.getenv("TASK_TIMEOUT_SECONDS", "300"))
    
    # 分頁設定
    DEFAULT_PAGE_SIZE: int = 10
    MAX_PAGE_SIZE: int = 100
    
    # 開發模式
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

# 全域設定實例
settings = Settings() 