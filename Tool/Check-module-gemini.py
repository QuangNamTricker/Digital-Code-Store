# check_gemini_full.py - Phiên bản dùng google.genai (package mới)
import time
import sys
from datetime import datetime

# Cài đặt package mới: pip install google-genai
try:
    from google import genai
    from google.genai import types
    print("✅ Đã tải package google.genai (phiên bản mới)")
except ImportError:
    print("❌ Chưa cài đặt google-genai!")
    print("📌 Chạy lệnh: pip install google-genai")
    sys.exit(1)

# DANH SÁCH MODEL MỚI NHẤT CỦA GEMINI (2026)
MODELS_TO_TEST = {
    # Gemini 2.0 Series (Mới nhất - Khuyến nghị)
    "gemini-2.0-flash": {
        "type": "⚡ Flash (Nhanh, Free)",
        "description": "Tốc độ cao, phù hợp cho email automation"
    },
    "gemini-2.0-flash-lite": {
        "type": "⚡ Flash Lite (Nhẹ, Free)",
        "description": "Nhẹ nhất, tiết kiệm tài nguyên"
    },
    "gemini-2.0-flash-thinking-exp-01-21": {
        "type": "🧠 Thinking (Suy luận sâu)",
        "description": "Có khả năng suy luận logic"
    },
    
    # Gemini 1.5 Series (Ổn định)
    "gemini-1.5-flash": {
        "type": "⚡ Flash 1.5 (Free)",
        "description": "Model ổn định, được dùng phổ biến"
    },
    "gemini-1.5-flash-8b": {
        "type": "⚡ Flash 8B (Nhẹ, Free)",
        "description": "Model nhỏ gọn, phản hồi nhanh"
    },
    "gemini-1.5-pro": {
        "type": "🚀 Pro 1.5 (Trả phí)",
        "description": "Hiệu suất cao, xử lý ngữ cảnh dài"
    },
    
    # Gemini 2.0 Pro Experimental
    "gemini-2.0-pro-exp": {
        "type": "🚀 Pro Experimental (Mạnh nhất)",
        "description": "Chất lượng cao nhất, thường cần trả phí"
    },
    
    # Model embedding
    "text-embedding-004": {
        "type": "📊 Embedding (Vector hóa)",
        "description": "Chuyển text thành vector"
    }
}

class GeminiFullChecker:
    def __init__(self, api_key):
        self.api_key = api_key
        self.client = genai.Client(api_key=api_key)
        self.results = []
        
    def test_model(self, model_name, model_info):
        """Kiểm tra một model cụ thể"""
        result = {
            "model": model_name,
            "type": model_info["type"],
            "description": model_info["description"],
            "status": "❌ LỖI",
            "message": "",
            "latency": 0
        }
        
        try:
            # Gửi yêu cầu test đơn giản
            start = time.time()
            response = self.client.models.generate_content(
                model=model_name,
                contents="Nói 'OK' nếu bạn hoạt động tốt"
            )
            latency = time.time() - start
            
            if response and hasattr(response, 'text') and response.text:
                result["status"] = "✅ HOẠT ĐỘNG"
                result["message"] = f"Phản hồi: {response.text[:50]}"
                result["latency"] = latency
            else:
                result["status"] = "⚠️ GIỚI HẠN"
                result["message"] = "Truy cập được nhưng không sinh text"
                
        except Exception as e:
            error_msg = str(e).lower()
            
            if "403" in error_msg or "permission" in error_msg:
                result["status"] = "🔒 CẦN TRẢ PHÍ"
                result["message"] = "Model yêu cầu gói trả phí hoặc quyền đặc biệt"
            elif "429" in error_msg:
                result["status"] = "⏳ HẾT LƯỢT"
                result["message"] = "Đã đạt giới hạn sử dụng trong ngày"
            elif "404" in error_msg or "not found" in error_msg:
                result["status"] = "❌ KHÔNG TỒN TẠI"
                result["message"] = "Model không khả dụng với tài khoản này"
            elif "quota" in error_msg:
                result["status"] = "💰 HẾT QUOTA"
                result["message"] = "Đã hết hạn mức miễn phí"
            elif "api key" in error_msg:
                result["status"] = "🔑 SAI API KEY"
                result["message"] = "API Key không hợp lệ"
            else:
                result["status"] = "⚠️ LỖI KHÁC"
                result["message"] = error_msg[:80]
                
        return result
    
    def run_full_check(self):
        """Chạy kiểm tra tất cả model"""
        print("\n" + "="*80)
        print("🤖 GEMINI FULL MODEL CHECKER - BẢN QUYỀN 2026")
        print("="*80)
        print(f"📅 Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🔑 API Key: {self.api_key[:10]}...{self.api_key[-4:]}")
        print("\n🚀 Đang quét toàn bộ model Gemini...")
        print("-"*80)
        
        for model_name, model_info in MODELS_TO_TEST.items():
            print(f"\n🔍 Đang kiểm tra: {model_name}")
            print(f"   📝 Loại: {model_info['type']}")
            
            result = self.test_model(model_name, model_info)
            self.results.append(result)
            
            # Hiển thị kết quả
            print(f"   {result['status']} | {result['message']}")
            if result['latency'] > 0:
                print(f"   ⏱️  Thời gian: {result['latency']:.2f} giây")
            
            time.sleep(0.5)  # Tránh rate limit
            
        return self.results
    
    def print_summary(self):
        """In báo cáo tổng kết"""
        print("\n" + "="*80)
        print("📊 BÁO CÁO TỔNG KẾT")
        print("="*80)
        
        # Phân loại kết quả
        working = [r for r in self.results if "✅" in r['status']]
        paid_only = [r for r in self.results if "🔒" in r['status']]
        limited = [r for r in self.results if "⏳" in r['status'] or "💰" in r['status']]
        not_found = [r for r in self.results if "❌" in r['status']]
        
        print(f"\n📈 Thống kê:")
        print(f"   ✅ Model hoạt động: {len(working)}/{len(self.results)}")
        print(f"   🔒 Model cần trả phí: {len(paid_only)}")
        print(f"   ⏳ Model hết quota: {len(limited)}")
        print(f"   ❌ Model không khả dụng: {len(not_found)}")
        
        if working:
            print("\n" + "="*80)
            print("🎯 KHUYẾN NGHỊ CHO TOOL GỬI EMAIL CỦA BẠN:")
            print("="*80)
            
            # Ưu tiên model flash
            flash_models = [r for r in working if "Flash" in r['type']]
            if flash_models:
                best = flash_models[0]
                print(f"\n✅ Dùng model: {best['model']}")
                print(f"   📝 Loại: {best['type']}")
                print(f"   💡 Lý do: Tốc độ nhanh, phù hợp với gửi email hàng loạt")
                print(f"\n📝 Code mẫu tích hợp vào tool email của bạn:")
                print(f"   ```python")
                print(f"   from google import genai")
                print(f"   client = genai.Client(api_key='{self.api_key[:10]}...')")
                print(f"   response = client.models.generate_content(")
                print(f"       model='{best['model']}',")
                print(f"       contents='Nội dung email của bạn'")
                print(f"   )")
                print(f"   ```")
            
            # Liệt kê tất cả model hoạt động
            print(f"\n📋 Danh sách model có thể dùng:")
            for r in working:
                print(f"   • {r['model']:35} - {r['type']}")
                if r['latency'] > 0:
                    print(f"     ⚡ Tốc độ: {r['latency']:.2f}s")
        else:
            print("\n" + "="*80)
            print("⚠️ KHÔNG TÌM THẤY MODEL HOẠT ĐỘNG")
            print("="*80)
            print("\n🔧 CÁCH KHẮC PHỤC:")
            print("   1. Kiểm tra lại API Key: https://aistudio.google.com/app/apikey")
            print("   2. Tạo API Key mới và thử lại")
            print("   3. Đăng ký tài khoản Google khác để được quota mới")
            print("   4. Nâng cấp lên gói trả phí để dùng model Pro")
        
        # Hiển thị chi tiết từng model
        print("\n" + "="*80)
        print("📋 CHI TIẾT TỪNG MODEL:")
        print("="*80)
        for r in self.results:
            print(f"\n🔹 {r['model']}")
            print(f"   🏷️  {r['type']}")
            print(f"   📊 Status: {r['status']}")
            print(f"   💬 Message: {r['message']}")
            if r['latency'] > 0:
                print(f"   ⏱️  Latency: {r['latency']:.2f}s")

def main():
    print("\n" + "="*80)
    print("🤖 GEMINI FULL MODEL CHECKER TOOL")
    print("="*80)
    
    # Kiểm tra thư viện đã cài
    try:
        from google import genai
        print("✅ Đã tìm thấy thư viện google-genai")
    except ImportError:
        print("❌ Chưa cài đặt thư viện!")
        print("\n📌 Cài đặt bằng lệnh:")
        print("   pip install google-genai")
        return
    
    # Nhập API Key
    print("\n📌 Lấy API Key tại: https://aistudio.google.com/app/apikey")
    api_key = input("\n🔑 Nhập API Key của bạn: ").strip()
    
    if not api_key:
        print("❌ Bạn chưa nhập API Key!")
        return
    
    # Chạy kiểm tra
    checker = GeminiFullChecker(api_key)
    checker.run_full_check()
    checker.print_summary()
    
    # Hỏi lưu kết quả
    save = input("\n\n💾 Bạn có muốn lưu kết quả ra file? (y/n): ").lower()
    if save == 'y':
        filename = f"gemini_check_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("KẾT QUẢ KIỂM TRA GEMINI MODELS\n")
            f.write("="*50 + "\n")
            for r in checker.results:
                f.write(f"\nModel: {r['model']}\n")
                f.write(f"Status: {r['status']}\n")
                f.write(f"Message: {r['message']}\n")
        print(f"✅ Đã lưu kết quả vào file: {filename}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Đã dừng chương trình.")
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")