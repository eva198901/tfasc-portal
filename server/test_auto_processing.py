#!/usr/bin/env python3
"""
測試自動任務處理功能的腳本
"""

import requests
import json
import time

API_BASE = "http://localhost:8002/api/v1"

def print_json(data):
    """美化JSON輸出"""
    print(json.dumps(data, indent=2, ensure_ascii=False))

def test_create_task():
    """測試創建新任務"""
    print("🚀 測試創建新任務...")
    
    task_data = {
        "url": "https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/2520"
    }
    
    response = requests.post(f"{API_BASE}/crawl-tasks", json=task_data)
    
    if response.status_code == 201:
        task = response.json()
        print("✅ 任務已成功創建！")
        print_json(task)
        return task["id"]
    else:
        print(f"❌ 創建任務失敗: {response.status_code}")
        print(response.text)
        return None

def check_task_status(task_id):
    """檢查任務狀態"""
    response = requests.get(f"{API_BASE}/crawl-tasks/{task_id}")
    
    if response.status_code == 200:
        task = response.json()
        status = task["status"]
        print(f"📊 任務 #{task_id} 狀態: {status}")
        
        if status == "done":
            print(f"🎉 任務已完成！獲得 {task.get('item_count', 0)} 個項目")
        elif status == "failed":
            print("❌ 任務處理失敗")
        elif status == "running":
            print("⏳ 任務正在處理中...")
        elif status == "pending":
            print("⏸️ 任務等待中...")
            
        return task
    else:
        print(f"❌ 查詢任務失敗: {response.status_code}")
        return None

def get_system_status():
    """取得系統狀態"""
    print("\n📈 系統狀態:")
    response = requests.get(f"{API_BASE}/system/status")
    
    if response.status_code == 200:
        status = response.json()
        print_json(status)
        return status
    else:
        print(f"❌ 查詢系統狀態失敗: {response.status_code}")
        return None

def main():
    print("🔧 TFASC Portal 自動任務處理測試")
    print("=" * 50)
    
    # 1. 檢查系統狀態
    get_system_status()
    
    # 2. 創建新任務
    task_id = test_create_task()
    
    if not task_id:
        return
    
    # 3. 監控任務狀態變化
    print(f"\n⏱️ 監控任務 #{task_id} 狀態變化...")
    
    for i in range(20):  # 最多監控2分鐘
        print(f"\n--- 檢查 #{i+1} ---")
        task = check_task_status(task_id)
        
        if not task:
            break
            
        status = task["status"]
        
        if status in ["done", "failed"]:
            print(f"\n✅ 任務 #{task_id} 已完成處理！")
            print("最終狀態:")
            print_json(task)
            break
        
        print("等待6秒後再次檢查...")
        time.sleep(6)
    
    # 4. 最終系統狀態
    print("\n" + "=" * 50)
    get_system_status()

if __name__ == "__main__":
    main() 