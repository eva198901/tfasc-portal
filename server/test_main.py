"""
TFASC Portal 後端 API 測試
"""

import pytest
import httpx
from fastapi.testclient import TestClient
from main import app
from datetime import datetime

client = TestClient(app)

class TestCrawlTasksAPI:
    """爬蟲任務 API 測試"""
    
    def test_health_check(self):
        """測試健康檢查端點"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
    
    def test_root_endpoint(self):
        """測試根路徑"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "TFASC Portal API"
        assert data["version"] == "1.0.0"
    
    def test_create_crawl_task(self):
        """測試建立爬蟲任務"""
        task_data = {
            "url": "https://www.tfasc.gov.tw"
        }
        response = client.post("/api/v1/crawl-tasks", json=task_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["url"] == task_data["url"]
        assert data["status"] == "pending"
        assert "id" in data
        assert "created_at" in data
        
        # 保存任務ID供後續測試使用
        self.task_id = data["id"]
        return data["id"]
    
    def test_get_crawl_tasks(self):
        """測試取得任務列表"""
        # 先建立一個任務
        self.test_create_crawl_task()
        
        response = client.get("/api/v1/crawl-tasks")
        assert response.status_code == 200
        
        data = response.json()
        assert "tasks" in data
        assert "total" in data
        assert "page" in data
        assert "pageSize" in data
        assert "stats" in data
        
        # 檢查統計資料
        stats = data["stats"]
        assert "pending" in stats
        assert "running" in stats
        assert "done" in stats
        assert "failed" in stats
    
    def test_get_crawl_tasks_with_pagination(self):
        """測試分頁查詢"""
        response = client.get("/api/v1/crawl-tasks?page=1&pageSize=5")
        assert response.status_code == 200
        
        data = response.json()
        assert data["page"] == 1
        assert data["pageSize"] == 5
    
    def test_get_single_crawl_task(self):
        """測試取得單一任務"""
        # 先建立一個任務
        task_id = self.test_create_crawl_task()
        
        response = client.get(f"/api/v1/crawl-tasks/{task_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == task_id
        assert data["status"] == "pending"
    
    def test_update_crawl_task_status(self):
        """測試更新任務狀態"""
        # 先建立一個任務
        task_id = self.test_create_crawl_task()
        
        # 更新為運行狀態
        update_data = {
            "status": "running"
        }
        response = client.put(f"/api/v1/crawl-tasks/{task_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "running"
        
        # 更新為完成狀態
        update_data = {
            "status": "done",
            "item_count": 100
        }
        response = client.put(f"/api/v1/crawl-tasks/{task_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "done"
        assert data["item_count"] == 100
        assert data["finished_at"] is not None
    
    def test_update_crawl_task_invalid_status(self):
        """測試更新無效狀態"""
        task_id = self.test_create_crawl_task()
        
        update_data = {
            "status": "invalid_status"
        }
        response = client.put(f"/api/v1/crawl-tasks/{task_id}", json=update_data)
        assert response.status_code == 400
    
    def test_delete_crawl_task(self):
        """測試刪除任務"""
        # 先建立一個任務
        task_id = self.test_create_crawl_task()
        
        # 刪除任務
        response = client.delete(f"/api/v1/crawl-tasks/{task_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        
        # 確認任務已被刪除
        response = client.get(f"/api/v1/crawl-tasks/{task_id}")
        assert response.status_code == 404
    
    def test_delete_running_task_should_fail(self):
        """測試刪除運行中的任務應該失敗"""
        # 建立任務並設為運行狀態
        task_id = self.test_create_crawl_task()
        
        update_data = {"status": "running"}
        client.put(f"/api/v1/crawl-tasks/{task_id}", json=update_data)
        
        # 嘗試刪除運行中的任務
        response = client.delete(f"/api/v1/crawl-tasks/{task_id}")
        assert response.status_code == 400
    
    def test_batch_delete_tasks(self):
        """測試批次刪除任務"""
        # 建立多個任務
        task_ids = []
        for i in range(3):
            task_data = {"url": f"https://example{i}.com"}
            response = client.post("/api/v1/crawl-tasks", json=task_data)
            task_ids.append(response.json()["id"])
        
        # 批次刪除
        delete_data = {"taskIds": task_ids}
        response = client.post("/api/v1/crawl-tasks/batch-delete", json=delete_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["deletedCount"] == 3
    
    def test_retry_failed_task(self):
        """測試重試失敗的任務"""
        # 建立任務並設為失敗狀態
        task_id = self.test_create_crawl_task()
        
        update_data = {"status": "failed"}
        client.put(f"/api/v1/crawl-tasks/{task_id}", json=update_data)
        
        # 重試任務
        response = client.post(f"/api/v1/crawl-tasks/{task_id}/retry")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "pending"
        assert data["finished_at"] is None
    
    def test_retry_non_failed_task_should_fail(self):
        """測試重試非失敗任務應該失敗"""
        task_id = self.test_create_crawl_task()
        
        # 嘗試重試 pending 狀態的任務
        response = client.post(f"/api/v1/crawl-tasks/{task_id}/retry")
        assert response.status_code == 400
    
    def test_duplicate_url_should_fail(self):
        """測試重複URL應該失敗"""
        task_data = {"url": "https://duplicate.com"}
        
        # 建立第一個任務
        response1 = client.post("/api/v1/crawl-tasks", json=task_data)
        assert response1.status_code == 200
        
        # 嘗試建立相同URL的任務
        response2 = client.post("/api/v1/crawl-tasks", json=task_data)
        assert response2.status_code == 409
    
    def test_nonexistent_task_operations(self):
        """測試對不存在任務的操作"""
        nonexistent_id = 99999
        
        # 取得不存在的任務
        response = client.get(f"/api/v1/crawl-tasks/{nonexistent_id}")
        assert response.status_code == 404
        
        # 更新不存在的任務
        update_data = {"status": "running"}
        response = client.put(f"/api/v1/crawl-tasks/{nonexistent_id}", json=update_data)
        assert response.status_code == 404
        
        # 刪除不存在的任務
        response = client.delete(f"/api/v1/crawl-tasks/{nonexistent_id}")
        assert response.status_code == 404
        
        # 重試不存在的任務
        response = client.post(f"/api/v1/crawl-tasks/{nonexistent_id}/retry")
        assert response.status_code == 404

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 