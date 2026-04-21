"""
TFASC Portal 後端 API
實作統一的 /crawl-tasks 端點
"""

from fastapi import FastAPI, HTTPException, Query, status, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uvicorn
from sqlalchemy import create_engine, Column, Integer, String, DateTime, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
import os
import asyncio
import aiohttp
import random
import logging
import ssl
from bs4 import BeautifulSoup
import re

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 資料庫設定
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crawl_tasks.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 資料庫模型
class CrawlTaskDB(Base):
    __tablename__ = "crawl_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(500), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)
    item_count = Column(Integer, nullable=True)
    
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'running', 'done', 'failed')", name='valid_status'),
    )

# 建立表格
Base.metadata.create_all(bind=engine)

# Pydantic 模型
class CrawlTaskCreate(BaseModel):
    url: HttpUrl

class CrawlTaskUpdate(BaseModel):
    status: Optional[str] = None
    finished_at: Optional[datetime] = None
    item_count: Optional[int] = None

class BatchDeleteParams(BaseModel):
    taskIds: List[int]

class CrawlTask(BaseModel):
    id: int
    url: str
    status: str
    created_at: datetime
    finished_at: Optional[datetime] = None
    item_count: Optional[int] = None
    
    class Config:
        from_attributes = True

# FastAPI 應用程式
app = FastAPI(
    title="TFASC Portal API",
    description="標售資料爬蟲任務管理 API",
    version="1.0.0"
)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料庫依賴
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 任務處理相關功能

async def validate_url_and_crawl(url: str) -> tuple[bool, int]:
    """
    驗證URL並進行簡單的爬蟲
    返回 (是否成功, 項目數量)
    """
    try:
        # 創建不嚴格驗證SSL的連接器來處理證書問題
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=connector
        ) as session:
            async with session.get(url) as response:
                if response.status != 200:
                    logger.warning(f"URL {url} 返回狀態碼: {response.status}")
                    return False, 0
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # 檢查是否包含標案相關內容
                keywords = ["標案", "招標", "投標", "tender", "bid", "採購", "公告"]
                keyword_count = 0
                
                for keyword in keywords:
                    keyword_count += len(soup.find_all(text=re.compile(keyword, re.IGNORECASE)))
                
                # 如果找到足夠的關鍵字，認為是成功的
                if keyword_count > 10:  # 至少要有10個相關關鍵字
                    # 模擬項目數量（根據內容複雜度）
                    item_count = min(keyword_count // 10, 100)  # 每10個關鍵字對應1個項目，最大100個
                    return True, max(item_count, 1)  # 至少1個項目
                else:
                    logger.warning(f"URL {url} 內容不包含足夠的標案關鍵字")
                    return False, 0
                    
    except Exception as e:
        logger.error(f"爬蟲URL {url} 時發生錯誤: {str(e)}")
        return False, 0

async def process_pending_task(task_id: int, url: str):
    """
    處理單個等待中的任務
    """
    db = SessionLocal()
    try:
        # 取得任務
        task = db.query(CrawlTaskDB).filter(CrawlTaskDB.id == task_id).first()
        if not task or task.status != "pending":
            return
        
        logger.info(f"開始處理任務 {task_id}: {url}")
        
        # 更新狀態為執行中
        task.status = "running"
        db.commit()
        
        # 模擬處理時間（5-15秒）
        processing_time = random.randint(5, 15)
        await asyncio.sleep(processing_time)
        
        # 驗證URL並爬蟲
        success, item_count = await validate_url_and_crawl(url)
        
        # 更新最終狀態
        if success:
            task.status = "done"
            task.item_count = item_count
            logger.info(f"任務 {task_id} 成功完成，獲得 {item_count} 個項目")
        else:
            task.status = "failed"
            task.item_count = 0
            logger.warning(f"任務 {task_id} 處理失敗")
        
        task.finished_at = datetime.now(timezone.utc)
        db.commit()
        
    except Exception as e:
        logger.error(f"處理任務 {task_id} 時發生錯誤: {str(e)}")
        # 標記為失敗
        try:
            task = db.query(CrawlTaskDB).filter(CrawlTaskDB.id == task_id).first()
            if task:
                task.status = "failed"
                task.finished_at = datetime.now(timezone.utc)
                db.commit()
        except Exception as commit_error:
            logger.error(f"提交失敗狀態時發生錯誤: {str(commit_error)}")
    finally:
        db.close()

async def auto_process_tasks():
    """
    自動處理等待中的任務（背景任務）
    """
    logger.info("開始自動任務處理器")
    
    while True:
        try:
            db = SessionLocal()
            try:
                # 找到所有等待中的任務
                pending_tasks = db.query(CrawlTaskDB).filter(
                    CrawlTaskDB.status == "pending"
                ).limit(5).all()  # 一次最多處理5個任務
                
                if pending_tasks:
                    logger.info(f"找到 {len(pending_tasks)} 個等待中的任務")
                    
                    # 並行處理任務
                    tasks = []
                    for task in pending_tasks:
                        tasks.append(process_pending_task(task.id, task.url))
                    
                    await asyncio.gather(*tasks)
                    
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"自動任務處理器錯誤: {str(e)}")
        
        # 等待30秒後再次檢查
        await asyncio.sleep(30)

# API 端點實作

@app.get("/api/v1/crawl-tasks")
async def get_crawl_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    page: Optional[int] = Query(None, ge=1),
    pageSize: Optional[int] = Query(None, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """取得爬蟲任務列表"""
    # 支援兩種分頁參數格式
    if page and pageSize:
        skip = (page - 1) * pageSize
        limit = pageSize
    
    # 查詢任務
    tasks = db.query(CrawlTaskDB).offset(skip).limit(limit).all()
    total = db.query(CrawlTaskDB).count()
    
    # 統計各狀態數量
    stats = {
        "pending": db.query(CrawlTaskDB).filter(CrawlTaskDB.status == "pending").count(),
        "running": db.query(CrawlTaskDB).filter(CrawlTaskDB.status == "running").count(),
        "done": db.query(CrawlTaskDB).filter(CrawlTaskDB.status == "done").count(),
        "failed": db.query(CrawlTaskDB).filter(CrawlTaskDB.status == "failed").count(),
    }
    
    return {
        "tasks": [CrawlTask.model_validate(task) for task in tasks],
        "total": total,
        "page": page or (skip // limit + 1),
        "pageSize": limit,
        "stats": stats
    }

@app.post("/api/v1/crawl-tasks", response_model=CrawlTask)
async def create_crawl_task(
    task_data: CrawlTaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """建立新的爬蟲任務"""
    # 檢查URL是否已存在且仍在處理中
    existing_task = db.query(CrawlTaskDB).filter(
        CrawlTaskDB.url == str(task_data.url),
        CrawlTaskDB.status.in_(["pending", "running"])
    ).first()
    
    if existing_task:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="該URL已有任務正在處理中"
        )
    
    # 建立新任務
    db_task = CrawlTaskDB(
        url=str(task_data.url),
        status="pending",
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # 自動觸發任務處理（背景任務）
    background_tasks.add_task(process_pending_task, db_task.id, str(task_data.url))
    
    logger.info(f"新任務已建立並加入處理佇列: {db_task.id} - {task_data.url}")
    
    return CrawlTask.model_validate(db_task)

@app.get("/api/v1/crawl-tasks/{task_id}", response_model=CrawlTask)
async def get_crawl_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    """取得單一爬蟲任務"""
    task = db.query(CrawlTaskDB).filter(CrawlTaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    return CrawlTask.model_validate(task)

@app.put("/api/v1/crawl-tasks/{task_id}", response_model=CrawlTask)
async def update_crawl_task(
    task_id: int,
    update_data: CrawlTaskUpdate,
    db: Session = Depends(get_db)
):
    """更新爬蟲任務狀態"""
    task = db.query(CrawlTaskDB).filter(CrawlTaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    # 驗證狀態轉換
    valid_statuses = ["pending", "running", "done", "failed"]
    if update_data.status and update_data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"無效的狀態值，必須是: {', '.join(valid_statuses)}"
        )
    
    # 更新任務
    if update_data.status:
        task.status = update_data.status
    if update_data.finished_at:
        task.finished_at = update_data.finished_at
    if update_data.item_count is not None:
        task.item_count = update_data.item_count
    
    # 如果狀態改為 done 或 failed，自動設定完成時間
    if update_data.status in ["done", "failed"] and not task.finished_at:
        task.finished_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(task)
    
    return CrawlTask.model_validate(task)

@app.delete("/api/v1/crawl-tasks/{task_id}")
async def delete_crawl_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    """刪除爬蟲任務"""
    task = db.query(CrawlTaskDB).filter(CrawlTaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    # 檢查任務狀態，不允許刪除正在運行的任務
    if task.status == "running":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無法刪除正在運行的任務"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "任務已成功刪除"}

@app.post("/api/v1/crawl-tasks/batch-delete")
async def batch_delete_crawl_tasks(
    params: BatchDeleteParams,
    db: Session = Depends(get_db)
):
    """批次刪除爬蟲任務"""
    if not params.taskIds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="請提供要刪除的任務ID列表"
        )
    
    # 查詢要刪除的任務
    tasks = db.query(CrawlTaskDB).filter(CrawlTaskDB.id.in_(params.taskIds)).all()
    
    if not tasks:
        raise HTTPException(status_code=404, detail="找不到指定的任務")
    
    # 檢查是否有正在運行的任務
    running_tasks = [task for task in tasks if task.status == "running"]
    if running_tasks:
        running_ids = [str(task.id) for task in running_tasks]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"無法刪除正在運行的任務: {', '.join(running_ids)}"
        )
    
    # 執行批次刪除
    deleted_count = db.query(CrawlTaskDB).filter(CrawlTaskDB.id.in_(params.taskIds)).delete()
    db.commit()
    
    return {
        "message": f"成功刪除 {deleted_count} 個任務",
        "deletedCount": deleted_count
    }

@app.post("/api/v1/crawl-tasks/{task_id}/retry", response_model=CrawlTask)
async def retry_crawl_task(
    task_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """重試失敗的爬蟲任務"""
    task = db.query(CrawlTaskDB).filter(CrawlTaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    # 只能重試失敗的任務
    if task.status != "failed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能重試失敗的任務"
        )
    
    # 重置任務狀態
    task.status = "pending"
    task.finished_at = None
    task.item_count = None
    
    db.commit()
    db.refresh(task)
    
    # 自動觸發任務處理
    background_tasks.add_task(process_pending_task, task.id, task.url)
    
    logger.info(f"任務 {task_id} 已重新加入處理佇列")
    
    return CrawlTask.model_validate(task)

@app.post("/api/v1/crawl-tasks/process-pending")
async def process_all_pending_tasks(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """手動觸發處理所有等待中的任務"""
    pending_tasks = db.query(CrawlTaskDB).filter(
        CrawlTaskDB.status == "pending"
    ).all()
    
    if not pending_tasks:
        return {"message": "沒有等待中的任務", "processedCount": 0}
    
    # 將所有等待中的任務加入背景處理佇列
    for task in pending_tasks:
        background_tasks.add_task(process_pending_task, task.id, task.url)
    
    logger.info(f"已將 {len(pending_tasks)} 個等待中的任務加入處理佇列")
    
    return {
        "message": f"已開始處理 {len(pending_tasks)} 個等待中的任務",
        "processedCount": len(pending_tasks)
    }

@app.get("/api/v1/system/status")
async def get_system_status(db: Session = Depends(get_db)):
    """取得系統狀態統計"""
    total_tasks = db.query(CrawlTaskDB).count()
    
    # 各狀態統計
    stats = {
        "pending": db.query(CrawlTaskDB).filter(CrawlTaskDB.status == "pending").count(),
        "running": db.query(CrawlTaskDB).filter(CrawlTaskDB.status == "running").count(),
        "done": db.query(CrawlTaskDB).filter(CrawlTaskDB.status == "done").count(),
        "failed": db.query(CrawlTaskDB).filter(CrawlTaskDB.status == "failed").count(),
    }
    
    # 最近24小時的任務統計
    yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_tasks = db.query(CrawlTaskDB).filter(
        CrawlTaskDB.created_at >= yesterday
    ).count()
    
    # 成功率計算
    completed_tasks = stats["done"] + stats["failed"]
    success_rate = (stats["done"] / completed_tasks * 100) if completed_tasks > 0 else 0
    
    return {
        "total_tasks": total_tasks,
        "status_stats": stats,
        "recent_24h": recent_tasks,
        "success_rate": round(success_rate, 2),
        "system_uptime": datetime.now(timezone.utc).isoformat()
    }

# 健康檢查端點
@app.get("/health")
async def health_check():
    """健康檢查端點"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

# 標售資訊相關的模擬API端點

# 不動產標示項目模型
class PropertyMark(BaseModel):
    地號: Optional[str] = None
    建號: Optional[str] = None  
    面積: str
    使用分區: Optional[str] = None

# 標售資訊數據模型 (根據API文件v1.0.0規格)
class TenderOut(BaseModel):
    id: int
    tender_no: str                                          # 標號 (如: "1", "2", "3")
    receive_start: str                                      # 投標開始日期 (YYYY-MM-DD)
    receive_end: str                                        # 投標結束日期 (YYYY-MM-DD)
    announcement: str                                       # 投標公告 (如: "北區分署114年度第102批")
    area_ping: Optional[float] = None                       # 面積 (坪)
    area_m2: Optional[float] = None                         # 面積 (平方公尺)
    zoning: Optional[str] = None                            # 分區 (如: "第二種住宅區")
    reserve_price: int                                      # 底價 (新台幣)
    deposit: int                                            # 保證金 (新台幣)
    note: Optional[str] = None                              # 備註
    property_mark: Optional[List[PropertyMark]] = None      # 不動產標示 (修正為PropertyMark[]格式)
    source_url: str                                         # 來源網址
    updated_at: str                                         # 更新時間 (ISO 8601)

# 模擬標售數據 (根據API文件規格生成)
def generate_mock_tenders(count: int = 20) -> List[TenderOut]:
    """生成符合API文件格式的模擬標售數據"""
    import random
    from datetime import timedelta
    
    mock_data = []
    base_date = datetime.now(timezone.utc)
    
    # 符合台灣標售資訊的真實分區選項
    zoning_options = [
        "第一種住宅區", "第二種住宅區", "第三種住宅區", "第四種住宅區",
        "商業區", "工業區", "農業區", "保護區", "特定專用區"
    ]
    
    # 台灣各縣市地區選項
    areas = [
        "臺北市大安區", "臺北市信義區", "臺北市中山區", "臺北市松山區", "臺北市大同區",
        "新北市板橋區", "新北市新莊區", "新北市中和區", "新北市永和區", "新北市土城區",
        "桃園市桃園區", "桃園市中壢區", "桃園市平鎮區", "桃園市八德區",
        "臺中市西屯區", "臺中市南屯區", "臺中市北屯區", "臺中市西區", "臺中市南區",
        "臺南市東區", "臺南市南區", "臺南市北區", "高雄市前鎮區", "高雄市苓雅區"
    ]
    
    property_marks = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
    
    for i in range(1, count + 1):
        # 隨機生成日期 (符合標售時程)
        receive_start = base_date + timedelta(days=random.randint(5, 45))
        receive_end = receive_start + timedelta(days=random.randint(10, 21))
        updated_at = base_date - timedelta(days=random.randint(0, 7))
        
        # 隨機生成價格和面積 (更符合台灣不動產市場)
        area_ping = round(random.uniform(0.1, 200), 2)
        area_m2 = round(area_ping * 3.3058, 2)
        reserve_price = random.randint(180000, 10000000)  # 18萬到1000萬
        deposit = int(reserve_price * 0.1)  # 保證金為底價的10%
        
        # 隨機選擇地區和分區
        selected_area = random.choice(areas)
        selected_zoning = random.choice(zoning_options)
        
        # 生成不動產標示資料
        property_marks_list = []
        
        # 80%機率有地號
        if random.random() > 0.2:
            land_no = f"{selected_area}{random.choice(['大安段', '信義段', '中山段', '松山段', '文山段'])}{random.choice(['一小段', '二小段', '三小段', '四小段'])}{random.randint(1, 9999):04d}地號"
            property_marks_list.append(PropertyMark(
                地號=land_no,
                面積=f"{area_m2:.1f}㎡, {area_ping:.2f}坪",
                使用分區=selected_zoning
            ))
        
        # 30%機率有建號 (如果是建物)
        if random.random() > 0.7:
            building_no = f"{selected_area}{random.choice(['大安段', '信義段', '中山段', '松山段', '文山段'])}{random.choice(['一小段', '二小段', '三小段', '四小段'])}{random.randint(1, 9999):05d}建號"
            building_area = round(random.uniform(20, 150), 2)
            building_ping = round(building_area / 3.3058, 2)
            property_marks_list.append(PropertyMark(
                建號=building_no,
                面積=f"{building_area:.1f}㎡, {building_ping:.2f}坪",
                使用分區=selected_zoning
            ))
        
        # 生成公告內容 (符合實際格式)
        announcement_options = [
            f"北區分署114年度第{100 + i}批",
            f"中區分署114年度第{200 + i}批", 
            f"南區分署114年度第{300 + i}批",
            f"台灣金融資產服務股份有限公司第{i}次不動產標售公告"
        ]
        
        tender = TenderOut(
            id=i,
            tender_no=str(i),  # 簡化標號格式，符合文件範例
            receive_start=receive_start.strftime("%Y-%m-%d"),
            receive_end=receive_end.strftime("%Y-%m-%d"),
            announcement=random.choice(announcement_options),
            area_ping=area_ping,
            area_m2=area_m2,
            zoning=selected_zoning,
            reserve_price=reserve_price,
            deposit=deposit,
            note=f"測試標號{i}" if random.random() > 0.7 else None,
            property_mark=property_marks_list if property_marks_list else None,
            source_url=f"https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/{2470 + i}",
            updated_at=updated_at.strftime("%Y-%m-%dT%H:%M:%S")
        )
        mock_data.append(tender)
    
    return mock_data

@app.get("/api/v1/tenders/", response_model=List[TenderOut])
async def get_tenders(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: Optional[str] = Query("updated_at", regex="^(id|updated_at|receive_start|reserve_price|tender_no)$"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$")
):
    """取得標售列表 - 符合 v0.4.3 規範"""
    # 生成模擬數據
    all_tenders = generate_mock_tenders(100)
    
    # 排序邏輯
    if sort_by:
        reverse = (sort_order == "desc")
        if sort_by == "id":
            all_tenders.sort(key=lambda x: x.id, reverse=reverse)
        elif sort_by == "updated_at":
            all_tenders.sort(key=lambda x: x.updated_at, reverse=reverse)
        elif sort_by == "receive_start":
            all_tenders.sort(key=lambda x: x.receive_start, reverse=reverse)
        elif sort_by == "reserve_price":
            all_tenders.sort(key=lambda x: x.reserve_price, reverse=reverse)
        elif sort_by == "tender_no":
            all_tenders.sort(key=lambda x: int(x.tender_no), reverse=reverse)
    
    # 分頁
    total = len(all_tenders)
    tenders = all_tenders[offset:offset + limit]
    
    logger.info(f"標售列表查詢: 總共{total}筆，返回{len(tenders)}筆 (offset={offset}, limit={limit})")
    
    return tenders

@app.get("/api/v1/tenders/search/", response_model=List[TenderOut])
async def search_tenders(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: Optional[str] = Query("updated_at", regex="^(id|updated_at|receive_start|reserve_price|tender_no)$"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    tender_no: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    price_min: Optional[int] = Query(None),
    price_max: Optional[int] = Query(None)
):
    """搜尋標售資訊 - 符合 v0.4.3 規範"""
    # 生成模擬數據
    all_tenders = generate_mock_tenders(200)
    
    # 篩選邏輯
    filtered_tenders = all_tenders
    
    # 日期範圍篩選
    if date_from:
        filtered_tenders = [t for t in filtered_tenders if t.receive_start >= date_from]
    if date_to:
        filtered_tenders = [t for t in filtered_tenders if t.receive_start <= date_to]
    
    # 標號篩選
    if tender_no:
        filtered_tenders = [t for t in filtered_tenders if tender_no.upper() in t.tender_no.upper()]
    
    # 地點搜尋 (在 zoning 和 property_mark 中搜尋)
    if location:
        location_filtered = []
        for tender in filtered_tenders:
            # 在分區中搜尋
            if tender.zoning and location in tender.zoning:
                location_filtered.append(tender)
                continue
            # 在不動產標示中搜尋
            if tender.property_mark:
                for prop in tender.property_mark:
                    if (prop.地號 and location in prop.地號) or \
                       (prop.建號 and location in prop.建號) or \
                       (prop.使用分區 and location in prop.使用分區):
                        location_filtered.append(tender)
                        break
        filtered_tenders = location_filtered
    
    # 價格範圍篩選
    if price_min is not None:
        filtered_tenders = [t for t in filtered_tenders if t.reserve_price >= price_min]
    if price_max is not None:
        filtered_tenders = [t for t in filtered_tenders if t.reserve_price <= price_max]
    
    # 排序邏輯
    if sort_by:
        reverse = (sort_order == "desc")
        if sort_by == "id":
            filtered_tenders.sort(key=lambda x: x.id, reverse=reverse)
        elif sort_by == "updated_at":
            filtered_tenders.sort(key=lambda x: x.updated_at, reverse=reverse)
        elif sort_by == "receive_start":
            filtered_tenders.sort(key=lambda x: x.receive_start, reverse=reverse)
        elif sort_by == "reserve_price":
            filtered_tenders.sort(key=lambda x: x.reserve_price, reverse=reverse)
        elif sort_by == "tender_no":
            filtered_tenders.sort(key=lambda x: int(x.tender_no), reverse=reverse)
    
    # 分頁
    total = len(filtered_tenders)
    tenders = filtered_tenders[offset:offset + limit]
    
    logger.info(f"標售搜尋: 總共{total}筆，返回{len(tenders)}筆 (offset={offset}, limit={limit})")
    
    return tenders

@app.get("/api/v1/tenders/{tender_id}", response_model=TenderOut)
async def get_tender(tender_id: int):
    """取得單筆標售資訊"""
    # 生成模擬數據並找到對應ID
    all_tenders = generate_mock_tenders(100)
    
    for tender in all_tenders:
        if tender.id == tender_id:
            return tender
    
    raise HTTPException(status_code=404, detail="標售資訊不存在")

@app.post("/api/v1/tenders/sync")
async def sync_tenders():
    """手動觸發標售資訊同步"""
    return {
        "message": "同步已觸發",
        "status": "success",
        "triggered_by": "system"
    }

# 根路徑
@app.get("/")
async def root():
    """API 根路徑"""
    return {
        "message": "TFASC Portal API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 