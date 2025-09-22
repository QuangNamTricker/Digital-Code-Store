import smtplib
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import csv
import os
import re
import threading
from PIL import Image, ImageTk
import textwrap

class EmailAutomationTool:
    def __init__(self, root):
        self.root = root
        self.root.title("Công Cụ Gửi Email Tự Động - Digital Code Store")
        self.root.geometry("1100x800")
        self.root.configure(bg='#f5f7fa')
        
        # Thiết lập giá trị mặc định
        self.default_email = "digitalcodestore.dev@gmail.com"
        self.default_password = "eqkk sjof hwqx xphr"
        
        # Biến lưu trữ
        self.email_list = []
        
        # Tạo style
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configure styles
        style.configure('Header.TFrame', background='#3498db')
        style.configure('Header.TLabel', background='#3498db', foreground='white', font=('Segoe UI', 14, 'bold'))
        style.configure('Card.TFrame', background='white', relief='solid', borderwidth=1)
        style.configure('Title.TLabel', font=('Segoe UI', 16, 'bold'), foreground='#2c3e50')
        style.configure('Subtitle.TLabel', font=('Segoe UI', 11), foreground='#7f8c8d')
        style.configure('Accent.TButton', background='#1abc9c', foreground='white', font=('Segoe UI', 10, 'bold'))
        style.configure('Primary.TButton', background='#3498db', foreground='white', font=('Segoe UI', 10, 'bold'))
        
        # Header
        header_frame = ttk.Frame(self.root, style='Header.TFrame', height=70)
        header_frame.pack(fill='x', pady=(0, 15))
        header_frame.pack_propagate(False)
        
        ttk.Label(header_frame, text="DIGITAL CODE STORE - CÔNG CỤ GỬI EMAIL TỰ ĐỘNG", 
                 style='Header.TLabel').pack(side='left', padx=25, pady=20)
        
        # Main container
        main_container = ttk.Frame(self.root)
        main_container.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        # Left panel - Email configuration
        left_panel = ttk.Frame(main_container)
        left_panel.pack(side='left', fill='both', expand=True, padx=(0, 15))
        
        # Login card
        login_card = ttk.Frame(left_panel, style='Card.TFrame', padding=20)
        login_card.pack(fill='x', pady=(0, 15))
        
        ttk.Label(login_card, text="THÔNG TIN ĐĂNG NHẬP EMAIL", style='Title.TLabel').pack(anchor='w', pady=(0, 15))
        
        # Email field
        email_frame = ttk.Frame(login_card)
        email_frame.pack(fill='x', pady=(0, 12))
        ttk.Label(email_frame, text="Email gửi:", style='Subtitle.TLabel', width=20).pack(side='left')
        self.sender_email = ttk.Entry(email_frame, font=('Segoe UI', 10))
        self.sender_email.pack(side='left', fill='x', expand=True, padx=(10, 0))
        self.sender_email.insert(0, self.default_email)
        
        # Password field
        password_frame = ttk.Frame(login_card)
        password_frame.pack(fill='x', pady=(0, 12))
        ttk.Label(password_frame, text="Mật khẩu ứng dụng:", style='Subtitle.TLabel', width=20).pack(side='left')
        self.sender_password = ttk.Entry(password_frame, show="*", font=('Segoe UI', 10))
        self.sender_password.pack(side='left', fill='x', expand=True, padx=(10, 0))
        self.sender_password.insert(0, self.default_password)
        
        # SMTP Server field
        smtp_frame = ttk.Frame(login_card)
        smtp_frame.pack(fill='x', pady=(0, 12))
        ttk.Label(smtp_frame, text="SMTP Server:", style='Subtitle.TLabel', width=20).pack(side='left')
        self.smtp_server = ttk.Entry(smtp_frame, font=('Segoe UI', 10))
        self.smtp_server.pack(side='left', fill='x', expand=True, padx=(10, 0))
        self.smtp_server.insert(0, "smtp.gmail.com")
        
        # SMTP Port field
        port_frame = ttk.Frame(login_card)
        port_frame.pack(fill='x', pady=(0, 15))
        ttk.Label(port_frame, text="SMTP Port:", style='Subtitle.TLabel', width=20).pack(side='left')
        self.smtp_port = ttk.Entry(port_frame, font=('Segoe UI', 10))
        self.smtp_port.pack(side='left', fill='x', expand=True, padx=(10, 0))
        self.smtp_port.insert(0, "587")
        
        # Email list card
        email_card = ttk.Frame(left_panel, style='Card.TFrame', padding=20)
        email_card.pack(fill='both', expand=True)
        
        ttk.Label(email_card, text="DANH SÁCH EMAIL NGƯỜI NHẬN", style='Title.TLabel').pack(anchor='w', pady=(0, 15))
        
        # Listbox with scrollbar
        listbox_frame = ttk.Frame(email_card)
        listbox_frame.pack(fill='both', expand=True, pady=(0, 15))
        
        self.email_listbox = tk.Listbox(listbox_frame, font=('Segoe UI', 10), 
                                       selectbackground='#3498db', selectforeground='white',
                                       highlightthickness=0, bd=2, relief='solid')
        self.email_listbox.pack(side='left', fill='both', expand=True)
        
        scrollbar = ttk.Scrollbar(listbox_frame, orient='vertical', command=self.email_listbox.yview)
        scrollbar.pack(side='right', fill='y')
        self.email_listbox.config(yscrollcommand=scrollbar.set)
        
        # Button frame
        btn_frame = ttk.Frame(email_card)
        btn_frame.pack(fill='x')
        
        ttk.Button(btn_frame, text="Chọn File Email", command=self.load_emails, style='Primary.TButton').pack(side='left', padx=(0, 10))
        ttk.Button(btn_frame, text="Xóa Danh Sách", command=self.clear_emails).pack(side='left')
        
        # Right panel - Email content
        right_panel = ttk.Frame(main_container)
        right_panel.pack(side='right', fill='both', expand=True)
        
        # Content card
        content_card = ttk.Frame(right_panel, style='Card.TFrame', padding=20)
        content_card.pack(fill='both', expand=True)
        
        ttk.Label(content_card, text="NỘI DUNG EMAIL", style='Title.TLabel').pack(anchor='w', pady=(0, 15))
        
        # Subject field
        subject_frame = ttk.Frame(content_card)
        subject_frame.pack(fill='x', pady=(0, 12))
        ttk.Label(subject_frame, text="Tiêu đề:", style='Subtitle.TLabel', width=15).pack(side='left')
        self.email_subject = ttk.Entry(subject_frame, font=('Segoe UI', 10))
        self.email_subject.pack(side='left', fill='x', expand=True, padx=(10, 0))
        self.email_subject.insert(0, "Digital Code Store - Thông tin mới nhất!")
        
        # Content field
        content_label_frame = ttk.Frame(content_card)
        content_label_frame.pack(fill='x', pady=(0, 5))
        ttk.Label(content_label_frame, text="Nội dung:", style='Subtitle.TLabel').pack(side='left')
        ttk.Label(content_label_frame, text="(Mỗi dòng là một đoạn văn, dòng trống để tạo khoảng cách)", 
                 style='Subtitle.TLabel', foreground='#95a5a6').pack(side='left', padx=(10, 0))
        
        self.email_content = scrolledtext.ScrolledText(content_card, font=('Segoe UI', 10), 
                                                      wrap=tk.WORD, height=12, padx=10, pady=10,
                                                      highlightthickness=1, relief='solid')
        self.email_content.pack(fill='both', expand=True, pady=(0, 15))
        
        default_content = """Chúng tôi gửi bạn thông tin mới nhất từ Digital Code Store.

Ưu đãi đặc biệt trong tuần:
- Giảm 20% cho tất cả các sản phẩm code
- Tặng kèm tài liệu hướng dẫn chi tiết
- Hỗ trợ kỹ thuật 24/7

Mã khuyến mãi: DCS20
Áp dụng đến hết ngày: 31/12/2023

Trân trọng,
Đội ngũ Digital Code Store"""
        
        self.email_content.insert('1.0', default_content)
        
        # Banner frame
        banner_frame = ttk.Frame(content_card)
        banner_frame.pack(fill='x', pady=(0, 20))
        
        ttk.Label(banner_frame, text="Banner Image:", style='Subtitle.TLabel', width=15).pack(side='left')
        
        banner_select_frame = ttk.Frame(banner_frame)
        banner_select_frame.pack(side='left', fill='x', expand=True, padx=(10, 0))
        
        self.banner_path = tk.StringVar()
        ttk.Entry(banner_select_frame, textvariable=self.banner_path, font=('Segoe UI', 10)).pack(side='left', fill='x', expand=True, padx=(0, 10))
        ttk.Button(banner_select_frame, text="Chọn Ảnh", command=self.select_banner, style='Primary.TButton').pack(side='left')
        
        # Action buttons
        action_frame = ttk.Frame(right_panel)
        action_frame.pack(fill='x', pady=(15, 0))
        
        ttk.Button(action_frame, text="Xem Trước Email", command=self.preview_email, style='Primary.TButton').pack(side='left', padx=(0, 10))
        ttk.Button(action_frame, text="GỬI EMAIL", command=self.start_sending_emails, style='Accent.TButton').pack(side='left')
        
        # Progress bar
        self.progress = ttk.Progressbar(right_panel, orient='horizontal', mode='determinate')
        self.progress.pack(fill='x', pady=(15, 5))
        
        # Status label
        self.status_label = ttk.Label(right_panel, text="Sẵn sàng", style='Subtitle.TLabel')
        self.status_label.pack(anchor='w', pady=(0, 5))
    
    def convert_text_to_html(self, plain_text):
        """Chuyển đổi văn bản thuần thành HTML đẹp mắt"""
        lines = plain_text.split('\n')
        html_lines = []
        
        for line in lines:
            if not line.strip():  # Dòng trống
                html_lines.append('<p>&nbsp;</p>')
            elif line.strip().endswith(':'):  # Tiêu đề
                html_lines.append(f'<h3 style="color: #2c3e50; margin-top: 20px; margin-bottom: 10px;">{line.strip()}</h3>')
            elif line.strip().startswith('- '):  # Danh sách
                html_lines.append(f'<li style="margin-bottom: 5px;">{line.strip()[2:]}</li>')
            elif any(keyword in line.lower() for keyword in ['mã khuyến mãi', 'áp dụng']):  # Thông tin đặc biệt
                if 'mã khuyến mãi' in line.lower():
                    parts = line.split(':')
                    if len(parts) > 1:
                        code = parts[1].strip()
                        html_lines.append(f'<div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 15px 0; border-radius: 0 5px 5px 0;">')
                        html_lines.append(f'<p style="margin: 0; font-family: Courier New, monospace;">Mã khuyến mãi: <span style="color: #e74c3c; font-weight: 600;">{code}</span></p>')
                elif 'áp dụng' in line.lower():
                    html_lines.append(f'<p style="margin: 10px 0 0; font-family: Courier New, monospace;">{line}</p>')
                    html_lines.append('</div>')
            else:  # Đoạn văn thông thường
                html_lines.append(f'<p style="margin-bottom: 15px; line-height: 1.6;">{line}</p>')
        
        # Tạo HTML hoàn chỉnh
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Email từ Digital Code Store</title>
            <style>
                body {{ 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }}
                .container {{ 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background-color: #ffffff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }}
                .header {{ 
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white; 
                    padding: 25px; 
                    text-align: center; 
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                }}
                .header p {{
                    margin: 10px 0 0;
                    opacity: 0.9;
                }}
                .content {{ 
                    padding: 30px; 
                    background-color: #ffffff;
                }}
                .footer {{ 
                    background-color: #2c3e50; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    font-size: 14px;
                }}
                .banner {{ 
                    width: 100%; 
                    max-height: 200px; 
                    object-fit: cover;
                    display: block;
                }}
                .button {{ 
                    background: linear-gradient(135deg, #1abc9c, #16a085);
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    display: inline-block; 
                    margin: 15px 0; 
                    font-weight: 600;
                }}
                ul {{
                    padding-left: 20px;
                    margin-bottom: 15px;
                }}
                li {{
                    margin-bottom: 8px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>DIGITAL CODE STORE</h1>
                    <p>Đem lại giải pháp công nghệ tốt nhất cho bạn</p>
                </div>
                <img src="cid:banner_image" class="banner" alt="Banner">
                <div class="content">
                    {content}
                    <center>
                        <a href="https://digital-code-store.pages.dev/" class="button">Xem sản phẩm ngay</a>
                    </center>
                </div>
                <div class="footer">
                    <p>© 2023 Digital Code Store. All rights reserved.</p>
                    <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                    <p>Email: digitalcodestore.dev@gmail.com | Điện thoại: 0123 456 789</p>
                </div>
            </div>
        </body>
        </html>
        """.format(content='\n'.join(html_lines))
        
        return html_content
    
    def load_emails(self):
        file_path = filedialog.askopenfilename(
            title="Chọn file danh sách email",
            filetypes=[("Text files", "*.txt"), ("CSV files", "*.csv"), ("All files", "*.*")]
        )
        
        if file_path:
            self.email_list = []
            try:
                if file_path.endswith('.csv'):
                    with open(file_path, 'r', encoding='utf-8') as file:
                        reader = csv.reader(file)
                        for row in reader:
                            if row and self.is_valid_email(row[0]):
                                self.email_list.append(row[0].strip())
                else:
                    with open(file_path, 'r', encoding='utf-8') as file:
                        for line in file:
                            if self.is_valid_email(line.strip()):
                                self.email_list.append(line.strip())
                
                self.update_email_listbox()
                self.status_label.config(text=f"Đã tải {len(self.email_list)} email từ file.")
            except Exception as e:
                messagebox.showerror("Lỗi", f"Không thể đọc file: {str(e)}")
    
    def is_valid_email(self, email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def update_email_listbox(self):
        self.email_listbox.delete(0, tk.END)
        for email in self.email_list:
            self.email_listbox.insert(tk.END, email)
    
    def clear_emails(self):
        self.email_list = []
        self.update_email_listbox()
        self.status_label.config(text="Đã xóa danh sách email")
    
    def select_banner(self):
        file_path = filedialog.askopenfilename(
            title="Chọn ảnh banner",
            filetypes=[("Image files", "*.png;*.jpg;*.jpeg;*.gif"), ("All files", "*.*")]
        )
        
        if file_path:
            self.banner_path.set(file_path)
            self.status_label.config(text=f"Đã chọn ảnh banner: {os.path.basename(file_path)}")
    
    def preview_email(self):
        # Tạo cửa sổ xem trước
        preview_window = tk.Toplevel(self.root)
        preview_window.title("Xem Trước Email")
        preview_window.geometry("700x700")
        preview_window.configure(bg='white')
        
        # Lấy nội dung và chuyển đổi sang HTML
        content = self.email_content.get('1.0', tk.END)
        html_content = self.convert_text_to_html(content)
        
        # Hiển thị trong text widget
        preview_text = scrolledtext.ScrolledText(preview_window, wrap=tk.WORD, font=('Segoe UI', 10))
        preview_text.pack(fill='both', expand=True, padx=10, pady=10)
        preview_text.insert('1.0', html_content)
        preview_text.config(state='disabled')
    
    def start_sending_emails(self):
        # Kiểm tra thông tin
        if not self.sender_email.get():
            messagebox.showerror("Lỗi", "Vui lòng nhập email gửi!")
            return
        
        if not self.sender_password.get():
            messagebox.showerror("Lỗi", "Vui lòng nhập mật khẩu ứng dụng!")
            return
        
        if not self.email_list:
            messagebox.showerror("Lỗi", "Danh sách email trống!")
            return
        
        if not self.email_subject.get():
            messagebox.showerror("Lỗi", "Vui lòng nhập tiêu đề email!")
            return
        
        # Xác nhận gửi email
        confirm = messagebox.askyesno(
            "Xác nhận", 
            f"Bạn có chắc chắn muốn gửi email đến {len(self.email_list)} người nhận?"
        )
        
        if not confirm:
            return
        
        # Chạy trong thread riêng để không làm đơ UI
        thread = threading.Thread(target=self.send_emails)
        thread.daemon = True
        thread.start()
    
    def send_emails(self):
        # Thiết lập progress bar
        self.progress['maximum'] = len(self.email_list)
        self.progress['value'] = 0
        
        try:
            # Kết nối SMTP
            server = smtplib.SMTP(self.smtp_server.get(), int(self.smtp_port.get()))
            server.starttls()
            server.login(self.sender_email.get(), self.sender_password.get())
            
            # Lấy nội dung email và chuyển đổi sang HTML
            content = self.email_content.get('1.0', tk.END)
            html_content = self.convert_text_to_html(content)
            
            # Gửi email đến từng người nhận
            success_count = 0
            for i, recipient in enumerate(self.email_list):
                try:
                    # Tạo message
                    msg = MIMEMultipart('related')
                    msg['From'] = self.sender_email.get()
                    msg['To'] = recipient
                    msg['Subject'] = self.email_subject.get()
                    
                    # Tạo phần alternative
                    alt = MIMEMultipart('alternative')
                    msg.attach(alt)
                    
                    # Thêm phần HTML
                    html_part = MIMEText(html_content, 'html', 'utf-8')
                    alt.attach(html_part)
                    
                    # Thêm banner nếu có
                    if self.banner_path.get() and os.path.exists(self.banner_path.get()):
                        try:
                            with open(self.banner_path.get(), 'rb') as img_file:
                                img_data = img_file.read()
                            image = MIMEImage(img_data)
                            image.add_header('Content-ID', '<banner_image>')
                            image.add_header('Content-Disposition', 'inline', filename='banner.jpg')
                            msg.attach(image)
                        except Exception as e:
                            print(f"Lỗi khi đính kèm ảnh: {e}")
                    
                    # Gửi email
                    server.sendmail(self.sender_email.get(), recipient, msg.as_string())
                    success_count += 1
                    
                except Exception as e:
                    print(f"Lỗi khi gửi email đến {recipient}: {str(e)}")
                
                # Cập nhật progress bar
                self.progress['value'] = i + 1
                self.status_label.config(text=f"Đang gửi... {i+1}/{len(self.email_list)}")
                self.root.update_idletasks()
            
            server.quit()
            self.status_label.config(text=f"Hoàn thành! Đã gửi {success_count}/{len(self.email_list)} email.")
            messagebox.showinfo("Hoàn thành", f"Đã gửi {success_count}/{len(self.email_list)} email thành công!")
            
        except Exception as e:
            self.status_label.config(text="Lỗi khi gửi email!")
            messagebox.showerror("Lỗi", f"Không thể gửi email: {str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = EmailAutomationTool(root)
    root.mainloop()