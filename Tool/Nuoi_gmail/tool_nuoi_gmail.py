import smtplib
import json
import time
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import sys

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
            print(f"[+] Đã tải {len(accounts)} tài khoản gửi")
            return accounts
        except FileNotFoundError:
            print(f"[-] Không tìm thấy file {self.account_file}")
            return []
        except json.JSONDecodeError:
            print(f"[-] File {self.account_file} không đúng định dạng JSON")
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
            print(f"[+] Đã tải {len(receivers)} email nhận")
            return receivers
        except FileNotFoundError:
            print(f"[-] Không tìm thấy file {self.receive_file}")
            return []
    
    def load_html_template(self):
        """Đọc nội dung HTML mặc định"""
        try:
            with open(self.html_template_file, 'r', encoding='utf-8') as f:
                content = f.read()
            print(f"[+] Đã tải nội dung HTML từ {self.html_template_file}")
            return content
        except FileNotFoundError:
            print(f"[-] Không tìm thấy file {self.html_template_file}, sử dụng nội dung mặc định")
            return """
            <html>
            <body>
                <h2>Xin chao!</h2>
                <p>Day la email tu dong duoc gui tu tool nuoi Gmail.</p>
            </body>
            </html>
            """
    
    def send_email_with_account(self, account, to_email, subject, html_content):
        """Gửi email bằng một tài khoản cụ thể"""
        try:
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
            html_part = MIMEText(html_content, 'html', 'utf-8')
            msg.attach(html_part)
            
            # Gửi email
            server.send_message(msg)
            server.quit()
            
            return True, "Thanh cong"
            
        except smtplib.SMTPAuthenticationError:
            return False, "Sai mat khau hoac app password"
        except smtplib.SMTPRecipientsRefused:
            return False, "Email nhan khong hop le"
        except Exception as e:
            return False, str(e)[:100]
    
    def send_bulk_with_rotation(self, subject=None, delay_between=5, delay_between_accounts=30):
        """
        Gửi email hàng loạt với rotation tài khoản
        
        Args:
            subject: Tiêu đề email (None = tự động tạo)
            delay_between: Delay giữa các email (giây)
            delay_between_accounts: Delay khi chuyển tài khoản (giây)
        """
        if not self.accounts:
            print("[-] Khong co tai khoan de gui!")
            return
        
        if not self.receivers:
            print("[-] Khong co email nhan!")
            return
        
        # Xác nhận gửi
        print("\n" + "="*60)
        print("THONG TIN GUI EMAIL")
        print("="*60)
        print(f"So tai khoan gui: {len(self.accounts)}")
        print(f"So email nhan: {len(self.receivers)}")
        print(f"Tong so email se gui: {len(self.receivers)}")
        print(f"Delay giua cac email: {delay_between} giay")
        print(f"Delay khi chuyen tai khoan: {delay_between_accounts} giay")
        
        if subject:
            print(f"Tieu de: {subject}")
        else:
            subject = f"Thong bao tu he thong - {datetime.now().strftime('%d/%m/%Y')}"
            print(f"Tieu de (tu dong): {subject}")
        
        confirm = input("\nBat dau gui? (yes/no): ").strip().lower()
        if confirm != 'yes':
            print("Da huy gui email.")
            return
        
        print("\n" + "="*60)
        print("BAT DAU GUI EMAIL")
        print("="*60)
        
        # Thống kê
        account_index = 0
        sent_count = 0
        fail_count = 0
        
        # Gửi từng email đến từng người nhận
        for i, receiver in enumerate(self.receivers, 1):
            # Chọn tài khoản theo round-robin
            account = self.accounts[account_index % len(self.accounts)]
            
            print(f"\n[{i}/{len(self.receivers)}] Gui den: {receiver}")
            print(f"  Tai khoan: {account['email']}")
            
            # Gửi email
            success, message = self.send_email_with_account(
                account, receiver, subject, self.html_content
            )
            
            if success:
                print(f"  [OK] {message}")
                sent_count += 1
                self.stats["total_sent"] += 1
                self.stats["details"].append({
                    "to": receiver,
                    "from": account['email'],
                    "status": "success",
                    "time": datetime.now().isoformat()
                })
            else:
                print(f"  [FAIL] {message}")
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
                time.sleep(delay_between)
            
            # Delay khi chuyển tài khoản (sau mỗi 1-2 tài khoản)
            if account_index % 2 == 0 and i < len(self.receivers):
                print(f"  Nghi {delay_between_accounts} giay de tranh bi spam...")
                time.sleep(delay_between_accounts)
        
        # Tổng kết
        self.show_summary()
        self.save_report()
    
    def send_to_single_receiver(self, receiver_email, subject=None, times=1):
        """
        Gửi nhiều lần đến một email nhận duy nhất (luân phiên tài khoản)
        
        Args:
            receiver_email: Email nhận
            subject: Tiêu đề email
            times: Số lần gửi
        """
        if not self.accounts:
            print("[-] Khong co tai khoan de gui!")
            return
        
        print("\n" + "="*60)
        print(f"GUI {times} LAN DEN {receiver_email}")
        print("="*60)
        
        if not subject:
            subject = f"Thu tu dong - {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}"
        
        sent = 0
        failed = 0
        
        for i in range(times):
            account = self.accounts[i % len(self.accounts)]
            
            print(f"\nLan {i+1}/{times}:")
            print(f"  Tai khoan: {account['email']}")
            
            success, message = self.send_email_with_account(
                account, receiver_email, subject, self.html_content
            )
            
            if success:
                print(f"  [OK] Da gui thanh cong")
                sent += 1
            else:
                print(f"  [FAIL] {message}")
                failed += 1
            
            if i < times - 1:
                time.sleep(5)  # Delay 5 giây giữa các lần
        
        print("\n" + "="*60)
        print("KET QUA")
        print("="*60)
        print(f"Thanh cong: {sent}")
        print(f"That bai: {failed}")
    
    def show_summary(self):
        """Hiển thị tổng kết"""
        print("\n" + "="*60)
        print("TONG KET")
        print("="*60)
        print(f"Tong so email da gui: {self.stats['total_sent']}")
        print(f"Tong so email that bai: {self.stats['total_failed']}")
        print(f"So tai khoan da dung: {len(set([d['from'] for d in self.stats['details']]))}")
    
    def save_report(self):
        """Lưu báo cáo ra file"""
        report_file = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.stats, f, ensure_ascii=False, indent=2)
        print(f"\n[+] Da luu bao cao tai: {report_file}")
    
    def test_connection(self, account_index=0):
        """Kiểm tra kết nối với một tài khoản"""
        if not self.accounts:
            print("[-] Khong co tai khoan de test")
            return
        
        account = self.accounts[account_index]
        print(f"\nTest tai khoan: {account['email']}")
        
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            app_password = account['app_password'].replace(" ", "")
            server.login(account['email'], app_password)
            server.quit()
            print("[OK] Dang nhap thanh cong!")
            return True
        except Exception as e:
            print(f"[FAIL] Loi: {e}")
            return False

def main():
    tool = GmailSenderTool()
    
    while True:
        print("\n" + "="*50)
        print("TOOL GUI EMAIL HANG LOAT - GMAIL")
        print("="*50)
        print("1. Gui den nhieu email (doc tu file)")
        print("2. Gui den 1 email nhieu lan")
        print("3. Test ket noi tai khoan")
        print("4. Thoat")
        
        choice = input("\nChon chuc nang (1-4): ").strip()
        
        if choice == '1':
            subject = input("Nhap tieu de email (Enter de bo qua): ").strip()
            subject = subject if subject else None
            tool.send_bulk_with_rotation(subject=subject)
            
        elif choice == '2':
            receiver = input("Nhap email nhan: ").strip()
            if not receiver or '@' not in receiver:
                print("Email khong hop le!")
                continue
            
            try:
                times = int(input("So lan gui: ").strip())
            except:
                times = 1
            
            subject = input("Nhap tieu de (Enter de bo qua): ").strip()
            subject = subject if subject else None
            
            tool.send_to_single_receiver(receiver, subject, times)
            
        elif choice == '3':
            for i, acc in enumerate(tool.accounts):
                print(f"{i+1}. {acc['email']}")
            try:
                idx = int(input("Chon tai khoan (so): ")) - 1
                tool.test_connection(idx)
            except:
                tool.test_connection(0)
                
        elif choice == '4':
            print("Tam biet!")
            break
        else:
            print("Lua chon khong hop le!")

if __name__ == "__main__":
    # Fix lỗi Unicode trên Windows
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    main()