import smtplib
import json
import time
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import sys
import subprocess

# Màu sắc cho console
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    PURPLE = '\033[95m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'
    
    # Background colors
    BG_GREEN = '\033[42m'
    BG_RED = '\033[41m'
    BG_YELLOW = '\033[43m'
    BG_BLUE = '\033[44m'
    BG_PURPLE = '\033[45m'
    BG_CYAN = '\033[46m'

def clear_screen():
    """Xóa màn hình console"""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_banner():
    """In banner đẹp"""
    banner = f"""
{Colors.CYAN}{'='*60}{Colors.END}
{Colors.BOLD}{Colors.PURPLE}   ██████╗ ███╗   ███╗ █████╗ ██╗██╗      {Colors.END}
{Colors.BOLD}{Colors.PURPLE}  ██╔════╝ ████╗ ████║██╔══██╗██║██║      {Colors.END}
{Colors.BOLD}{Colors.PURPLE}  ██║  ███╗██╔████╔██║███████║██║██║      {Colors.END}
{Colors.BOLD}{Colors.PURPLE}  ██║   ██║██║╚██╔╝██║██╔══██║██║██║      {Colors.END}
{Colors.BOLD}{Colors.PURPLE}  ╚██████╔╝██║ ╚═╝ ██║██║  ██║██║███████╗ {Colors.END}
{Colors.BOLD}{Colors.PURPLE}   ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝ {Colors.END}
{Colors.CYAN}{'='*60}{Colors.END}
{Colors.BOLD}{Colors.YELLOW}           TOOL GỬI EMAIL HÀNG LOẠT - GMAIL{Colors.END}
{Colors.CYAN}{'='*60}{Colors.END}
{Colors.WHITE}         Version 2.0 - Digital Code Store{Colors.END}
{Colors.CYAN}{'='*60}{Colors.END}
    """
    print(banner)

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def print_header(msg):
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{msg}{Colors.END}")
    print(f"{Colors.CYAN}{'='*60}{Colors.END}")

class GmailSenderTool:
    def __init__(self):
        # File cấu hình
        self.account_file = "account_send.json"
        self.receive_file = "gmail_receive.txt"
        self.html_template_file = "email_content.html"
        
        # Cấu hình SMTP
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        
        # Thống kê
        self.stats = {
            "total_sent": 0,
            "total_failed": 0,
            "accounts_used": 0,
            "details": []
        }
        
        # Đọc dữ liệu
        self.accounts = self.load_accounts()
        self.receivers = self.load_receivers()
        self.html_content = self.load_html_template()
    
    def load_accounts(self):
        """Đọc danh sách tài khoản gửi từ JSON"""
        try:
            with open(self.account_file, 'r', encoding='utf-8') as f:
                accounts = json.load(f)
            print_success(f"Đã tải {len(accounts)} tài khoản gửi")
            return accounts
        except FileNotFoundError:
            print_error(f"Không tìm thấy file {self.account_file}")
            return []
        except json.JSONDecodeError:
            print_error(f"File {self.account_file} không đúng định dạng JSON")
            return []
    
    def load_receivers(self):
        """Đọc danh sách email nhận từ file txt"""
        receivers = []
        try:
            with open(self.receive_file, 'r', encoding='utf-8') as f:
                for line in f:
                    email = line.strip()
                    if email and '@' in email:
                        receivers.append(email)
            print_success(f"Đã tải {len(receivers)} email nhận")
            return receivers
        except FileNotFoundError:
            print_error(f"Không tìm thấy file {self.receive_file}")
            return []
    
    def load_html_template(self):
        """Đọc nội dung HTML mặc định và thay thế biến"""
        try:
            with open(self.html_template_file, 'r', encoding='utf-8') as f:
                content = f.read()
            print_success(f"Đã tải nội dung HTML từ {self.html_template_file}")
            return content
        except FileNotFoundError:
            print_error(f"Không tìm thấy file {self.html_template_file}, sử dụng nội dung mặc định")
            return """
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Xin chào {name}!</h2>
                <p>Đây là email tự động được gửi từ tool nuôi Gmail.</p>
                <p>Mã tham chiếu: {ref_id}</p>
            </body>
            </html>
            """
    
    def personalize_html(self, html_content, email):
        """Cá nhân hóa nội dung HTML"""
        name = email.split('@')[0]
        ref_id = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{random.randint(1000, 9999)}"
        
        personalized = html_content.replace('{name}', name)
        personalized = personalized.replace('{ref_id}', ref_id)
        personalized = personalized.replace('{email}', email)
        
        return personalized
    
    def send_email_with_account(self, account, to_email, subject, html_content):
        """Gửi email bằng một tài khoản cụ thể"""
        try:
            # Cá nhân hóa nội dung
            personalized_html = self.personalize_html(html_content, to_email)
            
            # Kết nối SMTP
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            
            # Đăng nhập (xóa khoảng trắng nếu có)
            app_password = account['app_password'].replace(" ", "")
            server.login(account['email'], app_password)
            
            # Tạo email
            msg = MIMEMultipart('alternative')
            msg['From'] = account['email']
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Thêm nội dung HTML
            html_part = MIMEText(personalized_html, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Gửi email
            server.send_message(msg)
            server.quit()
            
            return True, "Thành công"
            
        except smtplib.SMTPAuthenticationError:
            return False, "Sai mật khẩu hoặc app password"
        except smtplib.SMTPRecipientsRefused:
            return False, "Email nhận không hợp lệ"
        except Exception as e:
            return False, str(e)[:100]
    
    def send_bulk_with_rotation(self, subject=None, delay_between=3, delay_between_accounts=15):
        """Gửi email hàng loạt với rotation tài khoản"""
        if not self.accounts:
            print_error("Không có tài khoản để gửi!")
            return
        
        if not self.receivers:
            print_error("Không có email nhận!")
            return
        
        # Xác nhận gửi
        print_header("THÔNG TIN GỬI EMAIL")
        print(f"{Colors.BOLD}Số tài khoản gửi:{Colors.END} {len(self.accounts)}")
        print(f"{Colors.BOLD}Số email nhận:{Colors.END} {len(self.receivers)}")
        print(f"{Colors.BOLD}Tổng số email sẽ gửi:{Colors.END} {len(self.receivers)}")
        print(f"{Colors.BOLD}Delay giữa các email:{Colors.END} {delay_between} giây")
        print(f"{Colors.BOLD}Delay khi chuyển tài khoản:{Colors.END} {delay_between_accounts} giây")
        
        if subject:
            print(f"{Colors.BOLD}Tiêu đề:{Colors.END} {subject}")
        else:
            subject = f"Thông báo từ hệ thống - {datetime.now().strftime('%d/%m/%Y')}"
            print(f"{Colors.BOLD}Tiêu đề (tự động):{Colors.END} {subject}")
        
        confirm = input(f"\n{Colors.YELLOW}Bắt đầu gửi? (yes/no): {Colors.END}").strip().lower()
        if confirm != 'yes':
            print_warning("Đã hủy gửi email.")
            return
        
        print_header("BẮT ĐẦU GỬI EMAIL")
        
        # Thống kê
        account_index = 0
        sent_count = 0
        fail_count = 0
        
        # Gửi từng email đến từng người nhận
        for i, receiver in enumerate(self.receivers, 1):
            # Chọn tài khoản theo round-robin
            account = self.accounts[account_index % len(self.accounts)]
            
            print(f"\n{Colors.CYAN}[{i}/{len(self.receivers)}]{Colors.END} Đang gửi đến: {Colors.BOLD}{receiver}{Colors.END}")
            print(f"  {Colors.WHITE}Tài khoản:{Colors.END} {account['email']}")
            
            # Gửi email
            success, message = self.send_email_with_account(
                account, receiver, subject, self.html_content
            )
            
            if success:
                print_success(f"  {message}")
                sent_count += 1
                self.stats["total_sent"] += 1
                self.stats["details"].append({
                    "to": receiver,
                    "from": account['email'],
                    "status": "success",
                    "time": datetime.now().isoformat()
                })
            else:
                print_error(f"  {message}")
                fail_count += 1
                self.stats["total_failed"] += 1
                self.stats["details"].append({
                    "to": receiver,
                    "from": account['email'],
                    "status": "failed",
                    "error": message,
                    "time": datetime.now().isoformat()
                })
            
            # Chuyển sang tài khoản tiếp theo
            account_index += 1
            
            # Delay giữa các email
            if i < len(self.receivers):
                # Hiển thị countdown
                for remaining in range(delay_between, 0, -1):
                    print(f"  {Colors.YELLOW}Chờ {remaining} giây...{Colors.END}", end='\r')
                    time.sleep(1)
                print("  " + " " * 20, end='\r')
            
            # Delay khi chuyển tài khoản
            if account_index % 2 == 0 and i < len(self.receivers):
                print_warning(f"  Nghỉ {delay_between_accounts} giây để tránh bị spam...")
                for remaining in range(delay_between_accounts, 0, -1):
                    print(f"  {Colors.YELLOW}Còn {remaining} giây{Colors.END}", end='\r')
                    time.sleep(1)
                print("  " + " " * 20, end='\r')
        
        # Tổng kết
        self.show_summary()
        self.save_report()
    
    def send_to_single_receiver(self, receiver_email, subject=None, times=1):
        """Gửi nhiều lần đến một email nhận duy nhất (luân phiên tài khoản)"""
        if not self.accounts:
            print_error("Không có tài khoản để gửi!")
            return
        
        print_header(f"GỬI {times} LẦN ĐẾN {receiver_email}")
        
        if not subject:
            subject = f"Thư tự động - {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}"
        
        sent = 0
        failed = 0
        
        for i in range(times):
            account = self.accounts[i % len(self.accounts)]
            
            print(f"\n{Colors.CYAN}Lần {i+1}/{times}:{Colors.END}")
            print(f"  {Colors.WHITE}Tài khoản:{Colors.END} {account['email']}")
            
            success, message = self.send_email_with_account(
                account, receiver_email, subject, self.html_content
            )
            
            if success:
                print_success("  Đã gửi thành công")
                sent += 1
            else:
                print_error(f"  {message}")
                failed += 1
            
            if i < times - 1:
                for remaining in range(5, 0, -1):
                    print(f"  {Colors.YELLOW}Chờ {remaining} giây...{Colors.END}", end='\r')
                    time.sleep(1)
                print("  " + " " * 20, end='\r')
        
        print_header("KẾT QUẢ")
        print(f"{Colors.GREEN}Thành công: {sent}{Colors.END}")
        print(f"{Colors.RED}Thất bại: {failed}{Colors.END}")
    
    def show_summary(self):
        """Hiển thị tổng kết"""
        print_header("TỔNG KẾT")
        print(f"{Colors.GREEN}✓ Tổng số email đã gửi: {self.stats['total_sent']}{Colors.END}")
        print(f"{Colors.RED}✗ Tổng số email thất bại: {self.stats['total_failed']}{Colors.END}")
        if self.stats['details']:
            accounts_used = len(set([d['from'] for d in self.stats['details']]))
            print(f"{Colors.BLUE}ℹ Số tài khoản đã dùng: {accounts_used}{Colors.END}")
    
    def save_report(self):
        """Lưu báo cáo ra file"""
        report_file = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.stats, f, ensure_ascii=False, indent=2)
        print_success(f"Đã lưu báo cáo tại: {report_file}")
    
    def test_connection(self, account_index=0):
        """Kiểm tra kết nối với một tài khoản"""
        if not self.accounts:
            print_error("Không có tài khoản để test")
            return
        
        account = self.accounts[account_index]
        print_header(f"KIỂM TRA TÀI KHOẢN: {account['email']}")
        
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            app_password = account['app_password'].replace(" ", "")
            server.login(account['email'], app_password)
            server.quit()
            print_success("Đăng nhập thành công!")
            return True
        except Exception as e:
            print_error(f"Lỗi: {e}")
            return False

def main():
    while True:
        clear_screen()
        print_banner()
        
        tool = GmailSenderTool()
        
        print(f"\n{Colors.BOLD}{Colors.CYAN}╔{'═'*58}╗{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}║{Colors.END}  {Colors.BOLD}1.{Colors.END} Gửi đến nhiều email (đọc từ file)                    {Colors.CYAN}║{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}║{Colors.END}  {Colors.BOLD}2.{Colors.END} Gửi đến 1 email nhiều lần                            {Colors.CYAN}║{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}║{Colors.END}  {Colors.BOLD}3.{Colors.END} Test kết nối tài khoản                               {Colors.CYAN}║{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}║{Colors.END}  {Colors.BOLD}4.{Colors.END} Thoát                                                {Colors.CYAN}║{Colors.END}")
        print(f"{Colors.BOLD}{Colors.CYAN}╚{'═'*58}╝{Colors.END}")
        
        choice = input(f"\n{Colors.BOLD}{Colors.YELLOW}➤ Chọn chức năng (1-4): {Colors.END}").strip()
        
        if choice == '1':
            clear_screen()
            print_banner()
            subject = input(f"{Colors.BOLD}Nhập tiêu đề email (Enter để bỏ qua): {Colors.END}").strip()
            subject = subject if subject else None
            tool.send_bulk_with_rotation(subject=subject)
            input(f"\n{Colors.YELLOW}Nhấn Enter để tiếp tục...{Colors.END}")
            
        elif choice == '2':
            clear_screen()
            print_banner()
            receiver = input(f"{Colors.BOLD}Nhập email nhận: {Colors.END}").strip()
            if not receiver or '@' not in receiver:
                print_error("Email không hợp lệ!")
                input(f"\n{Colors.YELLOW}Nhấn Enter để tiếp tục...{Colors.END}")
                continue
            
            try:
                times = int(input(f"{Colors.BOLD}Số lần gửi: {Colors.END}").strip())
            except:
                times = 1
            
            subject = input(f"{Colors.BOLD}Nhập tiêu đề (Enter để bỏ qua): {Colors.END}").strip()
            subject = subject if subject else None
            
            tool.send_to_single_receiver(receiver, subject, times)
            input(f"\n{Colors.YELLOW}Nhấn Enter để tiếp tục...{Colors.END}")
            
        elif choice == '3':
            clear_screen()
            print_banner()
            for i, acc in enumerate(tool.accounts):
                print(f"{Colors.CYAN}{i+1}.{Colors.END} {acc['email']}")
            try:
                idx = int(input(f"\n{Colors.BOLD}Chọn tài khoản (số): {Colors.END}")) - 1
                tool.test_connection(idx)
            except:
                tool.test_connection(0)
            input(f"\n{Colors.YELLOW}Nhấn Enter để tiếp tục...{Colors.END}")
                
        elif choice == '4':
            clear_screen()
            print(f"\n{Colors.GREEN}{Colors.BOLD}Cảm ơn bạn đã sử dụng tool!{Colors.END}")
            print(f"{Colors.PURPLE}Digital Code Store - Phát triển bởi Tu Quang Nam{Colors.END}\n")
            sys.exit(0)
        else:
            print_error("Lựa chọn không hợp lệ!")
            time.sleep(1)

if __name__ == "__main__":
    # Fix lỗi Unicode trên Windows
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    try:
        main()
    except KeyboardInterrupt:
        clear_screen()
        print(f"\n{Colors.YELLOW}Đã dừng chương trình!{Colors.END}\n")
        sys.exit(0)