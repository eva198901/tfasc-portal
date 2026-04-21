#!/usr/bin/env python3
"""
手動更新任務狀態腳本
用於模擬任務執行或手動完成卡住的任務
"""

import requests
import sys
import json
from datetime import datetime

# API基礎URL
BASE_URL = "http://localhost:8002/api/v1"

def get_tasks():
    """獲取所有任務"""
    try:
        response = requests.get(f"{BASE_URL}/crawl-tasks/?page=1&pageSize=100")
        response.raise_for_status()
        data = response.json()
        return data.get('tasks', [])
    except Exception as e:
        print(f"獲取任務失敗: {e}")
        return []

def update_task_status(task_id, status, item_count=None):
    """更新任務狀態"""
    payload = {
        "status": status,
        "finished_at": datetime.utcnow().isoformat() + "Z" if status in ["done", "failed"] else None
    }
    if item_count is not None:
        payload["item_count"] = item_count
    
    try:
        response = requests.put(f"{BASE_URL}/crawl-tasks/{task_id}/", json=payload)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"更新任務 {task_id} 失敗: {e}")
        return None

def simulate_task_completion(task_id, success=True, item_count=None):
    """模擬任務完成"""
    print(f"正在處理任務 ID: {task_id}")
    
    # 先設為執行中
    print("  → 設定為執行中...")
    update_task_status(task_id, "running")
    
    # 然後設為完成或失敗
    if success:
        final_status = "done"
        final_count = item_count or 42  # 預設42筆數據
        print(f"  → 設定為已完成 ({final_count} 筆)")
    else:
        final_status = "failed"
        final_count = None
        print("  → 設定為失敗")
    
    result = update_task_status(task_id, final_status, final_count)
    if result:
        print(f"  ✅ 任務 {task_id} 已更新為 {final_status}")
        return True
    else:
        print(f"  ❌ 任務 {task_id} 更新失敗")
        return False

def main():
    print("🔧 TFASC Portal 任務狀態更新工具")
    print("=" * 50)
    
    # 獲取任務列表
    tasks = get_tasks()
    if not tasks:
        print("沒有找到任務")
        return
    
    # 顯示等待中的任務
    pending_tasks = [t for t in tasks if t['status'] == 'pending']
    if not pending_tasks:
        print("沒有等待中的任務")
        return
    
    print(f"找到 {len(pending_tasks)} 個等待中的任務:")
    for i, task in enumerate(pending_tasks, 1):
        url_short = task['url'][:60] + "..." if len(task['url']) > 60 else task['url']
        print(f"{i}. ID: {task['id']} - {url_short}")
        print(f"   建立時間: {task['created_at']}")
    
    # 用戶選擇
    print("\n選項:")
    print("1. 將所有等待中的任務標記為成功完成")
    print("2. 將所有等待中的任務標記為失敗")
    print("3. 選擇特定任務處理")
    print("0. 退出")
    
    choice = input("\n請選擇 (0-3): ").strip()
    
    if choice == "1":
        print("\n正在將所有等待中的任務標記為成功...")
        for task in pending_tasks:
            simulate_task_completion(task['id'], success=True)
    
    elif choice == "2":
        print("\n正在將所有等待中的任務標記為失敗...")
        for task in pending_tasks:
            simulate_task_completion(task['id'], success=False)
    
    elif choice == "3":
        task_id = input("請輸入任務 ID: ").strip()
        try:
            task_id = int(task_id)
            success_choice = input("成功 (y) 還是失敗 (n)? [y/n]: ").strip().lower()
            success = success_choice == 'y'
            
            if success:
                count_input = input("輸入抓取的項目數量 (直接按 Enter 使用預設值 42): ").strip()
                item_count = int(count_input) if count_input else 42
            else:
                item_count = None
            
            simulate_task_completion(task_id, success, item_count)
        except ValueError:
            print("無效的任務 ID")
    
    elif choice == "0":
        print("退出")
    
    else:
        print("無效的選擇")

if __name__ == "__main__":
    main() 