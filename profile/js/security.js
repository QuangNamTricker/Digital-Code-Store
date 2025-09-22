// Change password functionality
document.getElementById('change-password-btn').addEventListener('click', function() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Mật khẩu mới và xác nhận mật khẩu không khớp.');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
    }
    
    const user = auth.currentUser;
    const email = user.email;
    
    // Reauthenticate user
    const credential = firebase.auth.EmailAuthProvider.credential(email, currentPassword);
    
    user.reauthenticateWithCredential(credential)
        .then(() => {
            // Change password
            user.updatePassword(newPassword)
                .then(() => {
                    alert('Đổi mật khẩu thành công!');
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('confirm-password').value = '';
                })
                .catch((error) => {
                    console.error("Error changing password:", error);
                    alert('Có lỗi xảy ra khi đổi mật khẩu: ' + error.message);
                });
        })
        .catch((error) => {
            console.error("Error reauthenticating:", error);
            alert('Mật khẩu hiện tại không đúng.');
        });
});

// Initialize login activity
document.addEventListener('DOMContentLoaded', function() {
    // Load login activity
    const loginActivity = document.getElementById('login-activity');
    loginActivity.innerHTML = `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="font-weight: 500;">Đăng nhập từ trình duyệt ${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Firefox'}</p>
                    <p style="color: var(--gray-color); font-size: 0.9rem;">${new Date().toLocaleString('vi-VN')}</p>
                </div>
                <span class="status status-completed">Hiện tại</span>
            </div>
        </div>
    `;
});