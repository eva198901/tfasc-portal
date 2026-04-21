#!/usr/bin/env python3
"""
診斷失敗任務的具體原因
"""

import aiohttp
import asyncio
from bs4 import BeautifulSoup
import re
import ssl

async def diagnose_url(url: str):
    """
    詳細診斷URL失敗的原因
    """
    print(f"\n🔍 診斷URL: {url}")
    print("=" * 80)
    
    try:
        # 創建不驗證SSL的連接器
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        async with aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            connector=connector
        ) as session:
            print("⏳ 發送HTTP請求...")
            
            async with session.get(url) as response:
                print(f"📊 HTTP狀態碼: {response.status}")
                
                if response.status != 200:
                    print(f"❌ 失敗原因: HTTP狀態碼不是200 (實際: {response.status})")
                    print(f"   狀態文字: {response.reason}")
                    return
                
                print("✅ HTTP請求成功")
                
                print("⏳ 解析HTML內容...")
                html = await response.text()
                print(f"📄 HTML內容長度: {len(html)} 字符")
                
                soup = BeautifulSoup(html, 'html.parser')
                
                # 檢查是否包含標案相關內容
                keywords = ["標案", "招標", "投標", "tender", "bid", "採購", "公告"]
                keyword_count = 0
                keyword_details = {}
                
                print("\n🔍 分析標案關鍵字...")
                for keyword in keywords:
                    matches = soup.find_all(text=re.compile(keyword, re.IGNORECASE))
                    count = len(matches)
                    keyword_count += count
                    keyword_details[keyword] = count
                    print(f"   '{keyword}': {count} 次")
                
                print(f"\n📈 總關鍵字數量: {keyword_count}")
                
                # 判斷閾值
                threshold = 10
                if keyword_count > threshold:
                    item_count = min(keyword_count // 10, 100)
                    print(f"✅ 超過閾值 ({threshold})，應該判定為成功")
                    print(f"🎯 計算項目數量: {max(item_count, 1)}")
                else:
                    print(f"❌ 未達閾值 ({threshold})，判定為失敗")
                
                # 檢查頁面標題和內容特徵
                title = soup.find('title')
                if title:
                    print(f"📋 頁面標題: {title.get_text()}")
                
                # 檢查是否是錯誤頁面或重定向頁面
                meta_refresh = soup.find('meta', attrs={'http-equiv': 'refresh'})
                if meta_refresh:
                    print(f"🔄 發現頁面重定向: {meta_refresh.get('content')}")
                
                # 檢查是否有錯誤信息
                error_indicators = soup.find_all(text=re.compile("錯誤|找不到|不存在|error|not found", re.IGNORECASE))
                if error_indicators:
                    print(f"⚠️ 發現錯誤指示詞: {len(error_indicators)} 個")
                    for indicator in error_indicators[:3]:  # 只顯示前3個
                        print(f"   - {indicator.strip()}")
                
    except aiohttp.ClientError as e:
        print(f"❌ 網路錯誤: {e}")
    except Exception as e:
        print(f"❌ 其他錯誤: {e}")

async def main():
    print("🔧 TFASC Portal 失敗任務診斷工具")
    print("=" * 80)
    
    urls_to_check = [
        "https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/2530",  # 任務#4
        "https://www.tfasc.com.tw/FnpArea/BuzFnp/BidTender/2487",  # 任務#5
    ]
    
    for url in urls_to_check:
        await diagnose_url(url)
    
    print("\n" + "=" * 80)
    print("🏁 診斷完成")

if __name__ == "__main__":
    asyncio.run(main()) 