import base64
import bz2
import zlib
import marshal
import sys
import os
import time
import random
from cryptography.fernet import Fernet

class ProfessionalObfuscator:
    def __init__(self):
        self.obfuscation_key = Fernet.generate_key()
        self.fernet = Fernet(self.obfuscation_key)
        
    def _print_banner(self):
        """In banner đẹp với màu sắc"""
        banner = r"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║    ██████╗ ██████╗ ███████╗ ██████╗ ██╗   ██╗███████╗ ██████╗ █████╗ ██████╗ ║
║    ██╔══██╗██╔══██╗██╔════╝██╔═══██╗██║   ██║██╔════╝██╔════╝██╔══██╗██╔══██╗║
║    ██████╔╝██████╔╝█████╗  ██║   ██║██║   ██║█████╗  ██║     ███████║██████╔╝║
║    ██╔═══╝ ██╔══██╗██╔══╝  ██║   ██║╚██╗ ██╔╝██╔══╝  ██║     ██╔══██║██╔══██╗║
║    ██║     ██║  ██║███████╗╚██████╔╝ ╚████╔╝ ███████╗╚██████╗██║  ██║██║  ██║║
║    ╚═╝     ╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═══╝  ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝║
║                                                                              ║
║          ███████╗██╗  ██╗██████╗ ███████╗██████╗ ███████╗██████╗             ║
║          ██╔════╝╚██╗██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗            ║
║          █████╗   ╚███╔╝ ██████╔╝█████╗  ██████╔╝█████╗  ██████╔╝            ║
║          ██╔══╝   ██╔██╗ ██╔═══╝ ██╔══╝  ██╔══██╗██╔══╝  ██╔══██╗            ║
║          ███████╗██╔╝ ██╗██║     ███████╗██║  ██║███████╗██║  ██║            ║
║          ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝            ║
║                                                                              ║
║              🛡️ PYTHON CODE OBFUSCATOR & PROTECTOR v2.0 🛡️                   ║
║                                                                              ║
║  ══════════════════════════════════════════════════════════════════════════  ║
║                                                                              ║
║  📜 Bản quyền © 2024 - TỪ QUANG NAM                                          ║
║  🔒 All Rights Reserved - Bảo hộ độc quyền sáng chế                          ║
║  ⚡ Phiên bản Professional - Dành cho doanh nghiệp                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
        print("\033[96m" + banner + "\033[0m")
    
    def _print_colored(self, text, color_code):
        """In text với màu sắc"""
        colors = {
            'red': '\033[91m',
            'green': '\033[92m',
            'yellow': '\033[93m',
            'blue': '\033[94m',
            'magenta': '\033[95m',
            'cyan': '\033[96m',
            'white': '\033[97m',
            'reset': '\033[0m'
        }
        print(f"{colors.get(color_code, '')}{text}{colors['reset']}")
    
    def _print_progress(self, step, message):
        """Hiển thị progress với animation"""
        animations = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        anim = animations[step % len(animations)]
        self._print_colored(f"{anim} {message}", 'cyan')
    
    def _extract_imports(self, code):
        """Trích xuất imports từ code gốc"""
        import ast
        imports = []
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, (ast.Import, ast.ImportFrom)):
                    imports.append(ast.unparse(node))
        except:
            lines = code.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith(('import ', 'from ')) and ('#' not in line or line.find('#') > line.find('import')):
                    imports.append(line)
        return list(set(imports))
    
    def _obfuscate_code(self, code):
        """Mã hóa code với nhiều lớp"""
        bytecode = compile(code, '<string>', 'exec')
        layer1 = marshal.dumps(bytecode)
        layer2 = zlib.compress(layer1, 9)
        layer3 = bz2.compress(layer2, 9)
        layer4 = self.fernet.encrypt(layer3)
        layer5 = base64.b85encode(layer4)
        return layer5.decode('ascii')
    
    def _create_copyright_header(self):
        """Tạo header bản quyền đẹp"""
        current_year = time.strftime('%Y')
        return f'''"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║             🛡️ FACEBOOK REGISTRATION TOOL - BẢN QUYỀN BẢO VỆ 🛡️              ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   📛 Tác giả:            TỪ QUANG NAM                                       ║
║   📧 Liên hệ:            tuquangnamht2007@gmail.com                         ║
║   📅 Năm phát hành:      {current_year}                                     ║
║   🏢 Bản quyền:          © 2025 TỪ QUANG NAM. All rights reserved.          ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ⚠️  CẢNH BÁO: BẢN QUYỀN VÀ ĐIỀU KHOẢN SỬ DỤNG ⚠️                          ║
║                                                                              ║
║   • NGHIÊM CẤM sao chép, phân phối, chỉnh sửa dưới mọi hình thức             ║
║   • NGHIÊM CẤM reverse engineering, decompile, hoặc phân tích code           ║
║   • NGHIÊM CẤM sử dụng cho mục đích bất hợp pháp                             ║
║   • Chỉ sử dụng cho mục đích học tập và phát triển phần mềm                  ║
║                                                                              ║
║   🚨 VI PHẠM BẢN QUYỀN SẼ BỊ XỬ LÝ THEO QUY ĐỊNH CỦA PHÁP LUẬT               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

🔐 FILE ĐÃ ĐƯỢC BẢO VỆ BỞI PROFESSIONAL OBFUSCATOR BY TỪ QUANG NAM
📅 Thời gian tạo: {time.strftime('%Y-%m-%d %H:%M:%S')}
⚡ Phiên bản: 2.0 | Security Level: MAXIMUM
  * Vui lòng liên hệ tác giả để được hỗ trợ! *
  Zalo: 0888385536

"""
'''
    
    def _create_decoder(self, obfuscated_data, original_imports):
        """Tạo decoder với bảo mật cao"""
        imports_code = '\n'.join(original_imports)
        
        decoder = f'''
# ==================== IMPORTS GỐC ====================
{imports_code}

import base64
import bz2
import zlib
import marshal
import sys
import time
import hashlib
from cryptography.fernet import Fernet

class _SecuritySystem:
    """Hệ thống bảo vệ chống reverse engineering"""
    
    @staticmethod
    def _anti_debug_check():
        """Kiểm tra và chống debug"""
        if hasattr(sys, 'gettrace') and sys.gettrace() is not None:
            print("\\033[91m🚨 PHÁT HIỆN DEBUGGER! Chương trình sẽ thoát.\\033[0m")
            sys.exit(1)
    
    @staticmethod
    def _environment_check():
        """Kiểm tra môi trường thực thi"""
        required_modules = ['os', 'sys', 'time', 'base64']
        for module in required_modules:
            try:
                __import__(module)
            except:
                print(f"\\033[91m🚨 Thiếu module bắt buộc: {{module}}\\033[0m")
                sys.exit(1)
    
    @staticmethod
    def _performance_check():
        """Kiểm tra hiệu năng (chống sandbox)"""
        start_time = time.time()
        # Tính toán phức tạp để kiểm tra
        result = sum(i * i for i in range(1000))
        end_time = time.time()
        
        if end_time - start_time > 0.5:  # Quá chậm - có thể đang trong sandbox
            print("\\033[91m🚨 Phát hiện môi trường bất thường!\\033[0m")
            sys.exit(1)
    
    @staticmethod
    def run_security_checks():
        """Chạy tất cả kiểm tra bảo mật"""
        _SecuritySystem._anti_debug_check()
        _SecuritySystem._environment_check()
        _SecuritySystem._performance_check()
        return True


_PAYLOAD = "{obfuscated_data}"
_KEY = {repr(self.obfuscation_key)}
def _execute_protected_code():
    """Thực thi code đã được bảo vệ"""
    
    if not _SecuritySystem.run_security_checks():
        print("\\033[91m❌ KIỂM TRA BẢO MẬT THẤT BẠI!\\033[0m")
        sys.exit(1)
    
    print("\\033[92m🔒 Đang xác thực bảo mật...\\033[0m")
    time.sleep(0.5)
    
    try:
        print("\\033[93m🔓 Đang giải mã dữ liệu...\\033[0m")
        fernet = Fernet(_KEY)
        step1 = base64.b85decode(_PAYLOAD.encode('ascii'))
        step2 = fernet.decrypt(step1)
        step3 = bz2.decompress(step2)
        step4 = zlib.decompress(step3)
        step5 = marshal.loads(step4)
        
        print("\\033[92m✅ Giải mã thành công! Đang khởi chạy...\\033[0m")
        time.sleep(0.3)
        exec(step5, globals())
        
    except Exception as e:
        print(f"\\033[91m❌ LỖI HỆ THỐNG: {{e}}\\033[0m")
        print("\\033[91m🚨 Vui lòng liên hệ tác giả để được hỗ trợ!\\033[0m")
        sys.exit(15)

if __name__ == "__main__":
    print("\\033[95m" + "╔══════════════════════════════════════════════════════════════╗")
    print("║                   🛡️ HỆ THỐNG BẢO VỆ KÍCH HOẠT 🛡️            ║")  
    print("╚══════════════════════════════════════════════════════════════╝" + "\\033[0m")
    print("Bản Quyền Đã Được Từ QUANG NAM Ký Tên.")
    print("© 2025. All rights reserved.")
    print("Chương trình sẽ tự động chạy sau 2 giây...")
    time.sleep(2)
    
    _execute_protected_code()
'''
        return decoder
    
    def obfuscate_file(self, input_file, output_file=None):
        """Mã hóa file chuyên nghiệp"""
        if not os.path.exists(input_file):
            self._print_colored(f"❌ File không tồn tại: {input_file}", 'red')
            return False
        
        self._print_banner()
        self._print_colored(f"🎯 MỤC TIÊU: {input_file}", 'yellow')
        print()
        
        # Đọc code gốc
        with open(input_file, 'r', encoding='utf-8') as f:
            original_code = f.read()
        
        # Validate code
        try:
            compile(original_code, input_file, 'exec')
        except Exception as e:
            self._print_colored(f"❌ Lỗi code: {e}", 'red')
            return False
        
        # Tiến trình mã hóa
        steps = [
            "Đang trích xuất imports...",
            "Đang biên dịch code...", 
            "Đang mã hóa nhiều lớp...",
            "Đang tạo hệ thống bảo vệ...",
            "Đang ghi file output..."
        ]
        
        for i, step in enumerate(steps):
            self._print_progress(i, step)
            time.sleep(0.3)
        
        # Trích xuất imports
        imports = self._extract_imports(original_code)
        
        # Mã hóa code
        obfuscated_data = self._obfuscate_code(original_code)
        
        # Tạo file output
        if output_file is None:
            output_file = input_file.replace('.py', '_protected.py')
        
        # Tạo file hoàn chỉnh
        copyright_header = self._create_copyright_header()
        decoder = self._create_decoder(obfuscated_data, imports)
        
        final_code = copyright_header + decoder
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(final_code)
        
        # Thông báo hoàn thành
        print()
        self._print_colored("✅ MÃ HÓA THÀNH CÔNG!", 'green')
        print()
        self._print_colored("📊 THÔNG TIN FILE:", 'cyan')
        self._print_colored(f"   📁 File gốc: {input_file}", 'white')
        self._print_colored(f"   📁 File bảo vệ: {output_file}", 'white') 
        self._print_colored(f"   📏 Kích thước: {os.path.getsize(output_file):,} bytes", 'white')
        self._print_colored(f"   🛡️  Bảo mật: CẤP ĐỘ TỐI ĐA", 'yellow')
        print()
        self._print_colored("⚡ File output đã sẵn sàng để sử dụng!", 'green')
        self._print_colored("🔒 Code được bảo vệ chống reverse engineering", 'blue')
        
        return output_file

def main():
    if len(sys.argv) < 2:
        print("Cách dùng: python obfuscator.py <file_input> [file_output]")
        print("Ví dụ: python obfuscator.py my_script.py")
        return
    
    try:
        obfuscator = ProfessionalObfuscator()
        input_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else None
        
        result = obfuscator.obfuscate_file(input_file, output_file)
        
    except Exception as e:
        print(f"\033[91m❌ Lỗi: {e}\033[0m")
        print("\033[93m💡 Kiểm tra file input và thử lại!\033[0m")

if __name__ == "__main__":
    main()