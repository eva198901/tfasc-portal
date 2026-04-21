#!/usr/bin/env python3
"""
簡單的後端 API 測試腳本
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_health():
    """測試健康檢查"""
    print("🔍 測試健康檢查...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"狀態碼: {response.status_code}")
    print(f"回應: {response.json()}")
    return response.status_code == 200

def test_create_task():
    """測試建立任務"""
    print("\n🔍 測試建立任務...")
    data = {"url": "https://www.tfasc.gov.tw"}
    response = requests.post(f"{BASE_URL}/api/v1/crawl-tasks", json=data)
    print(f"狀態碼: {response.status_code}")
    if response.status_code == 200:
        task = response.json()
        print(f"任務ID: {task['id']}")
        print(f"URL: {task['url']}")
        print(f"狀態: {task['status']}")
        return task['id']
    else:
        print(f"錯誤: {response.text}")
        return None

def test_get_tasks():
    """測試取得任務列表"""
    print("\n🔍 測試取得任務列表...")
    response = requests.get(f"{BASE_URL}/api/v1/crawl-tasks")
    print(f"狀態碼: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"總任務數: {data['total']}")
        print(f"當前頁面: {data['page']}")
        print(f"頁面大小: {data['pageSize']}")
        print(f"統計: {data['stats']}")
        return True
    else:
        print(f"錯誤: {response.text}")
        return False

def test_update_task(task_id):
    """測試更新任務"""
    if not task_id:
        return False
    
    print(f"\n🔍 測試更新任務 {task_id}...")
    data = {"status": "running"}
    response = requests.put(f"{BASE_URL}/api/v1/crawl-tasks/{task_id}", json=data)
    print(f"狀態碼: {response.status_code}")
    if response.status_code == 200:
        task = response.json()
        print(f"新狀態: {task['status']}")
        return True
    else:
        print(f"錯誤: {response.text}")
        return False

def main():
    """主測試函數"""
    print("🚀 開始測試 TFASC Portal 後端 API")
    print("=" * 50)
    
    # 測試健康檢查
    if not test_health():
        print("❌ 健康檢查失敗，請確認伺服器是否運行")
        return
    
    # 測試建立任務
    task_id = test_create_task()
    
    # 測試取得任務列表
    test_get_tasks()
    
    # 測試更新任務
    test_update_task(task_id)
    
    print("\n" + "=" * 50)
    print("✅ 測試完成！")
    print("💡 提示: 訪問 http://localhost:8000/docs 查看完整 API 文件")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("❌ 無法連接到伺服器")
        print("💡 請先啟動後端伺服器: python server/start.py")
    except Exception as e:
        print(f"❌ 測試過程中發生錯誤: {e}") 