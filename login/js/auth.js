// Generate CAPTCHA
function generateCaptcha() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for (let i = 0; i < 4; i++) {
        captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    document.getElementById('captcha').textContent = captcha;
    return captcha;
}

let currentCaptcha = generateCaptcha();

// Initialize auth event listeners
function initAuthHandlers() {
    // Refresh CAPTCHA
    document.getElementById('refresh-captcha').addEventListener('click', () => {
        currentCaptcha = generateCaptcha();
    });
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form submission
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Forgot password form submission
    document.getElementById('forgot-password-form').addEventListener('submit', handleForgotPassword);
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            
            // Kiểm tra trạng thái tài khoản trong Firestore
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        
                        // Kiểm tra nếu tài khoản bị khóa
                        if (userData.status === 'banned') {
                            showNotification('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 'error');
                            auth.signOut();
                            return;
                        }
                        
                        // Kiểm tra xác thực email
                        if (user.emailVerified) {
                            showNotification('Đăng nhập thành công!', 'success');
                            setTimeout(() => {
                                window.location.href = '../trangchu/index.html';
                            }, 1500);
                        } else {
                            showNotification('Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn để tìm liên kết xác minh.', 'error');
                            auth.signOut();
                        }
                    }
                });
        })
        .catch((error) => {
            let errorMessage = 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Email không tồn tại trong hệ thống.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Mật khẩu không chính xác.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email không hợp lệ.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
        });
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    
    // Validate CAPTCHA
    const enteredCaptcha = document.getElementById('register-captcha').value.toUpperCase();
    if (enteredCaptcha !== currentCaptcha) {
        showNotification('Mã xác nhận không đúng!', 'error');
        currentCaptcha = generateCaptcha();
        return;
    }
    
    // Validate password confirmation
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    
    // Sau khi tạo user thành công, thêm vào Firestore
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Update profile với display name
            return user.updateProfile({
                displayName: name
            }).then(() => {
                // Tạo document user trong Firestore
                return db.collection('users').doc(user.uid).set({
                    displayName: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    balance: 0,
                    role: 'user',
                    status: 'active'
                });
            }).then(() => {
                // Gửi email xác thực
                return user.sendEmailVerification();
            }).then(() => {
                showNotification('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.', 'success');
                document.getElementById('register-form').reset();
                currentCaptcha = generateCaptcha();
                
                // Chuyển sang tab đăng nhập sau 3 giây
                setTimeout(() => {
                    document.querySelector('[data-tab="login"]').click();
                }, 3000);
            });
        })
        .catch((error) => {
            let errorMessage = 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email này đã được sử dụng cho tài khoản khác.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email không hợp lệ.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
        });
}

// Handle forgot password
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            showNotification('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.', 'success');
            // Close modal after 3 seconds
            setTimeout(() => {
                document.getElementById('forgot-password-modal').style.display = 'none';
            }, 3000);
        })
        .catch((error) => {
            let errorMessage = 'Đã xảy ra lỗi khi gửi email đặt lại mật khẩu. Vui lòng thử lại.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Email không tồn tại trong hệ thống.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email không hợp lệ.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
        });
}

// Initialize auth handlers when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuthHandlers);