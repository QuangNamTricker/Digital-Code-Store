
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyA7kY_xl-B1r6pfRlUCVcI8OcLe7rOh11g",
            authDomain: "digitalcodestore-tuquangnam.firebaseapp.com",
            projectId: "digitalcodestore-tuquangnam",
            storageBucket: "digitalcodestore-tuquangnam.firebasestorage.app",
            messagingSenderId: "226534281162",
            appId: "1:226534281162:web:9e734c1b07378efb280933",
            measurementId: "G-9V4G42XSZS"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Tab functionality
        document.querySelectorAll('.tab-link').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all tab panes
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                // Show the corresponding tab pane
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });
        
        // Switch between login and register
        document.getElementById('go-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('[data-tab="register"]').click();
        });
        
        document.getElementById('go-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('[data-tab="login"]').click();
        });
        
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
        
        // Refresh CAPTCHA
        document.getElementById('refresh-captcha').addEventListener('click', () => {
            currentCaptcha = generateCaptcha();
        });
        
        // Forgot password modal
        const forgotPasswordModal = document.getElementById('forgot-password-modal');
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        const closeModal = document.querySelector('.close-modal');
        
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordModal.style.display = 'flex';
        });
        
        closeModal.addEventListener('click', () => {
            forgotPasswordModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.style.display = 'none';
            }
        });
        
        // Show notification
        function showNotification(message, type = 'success') {
            const notificationContainer = document.getElementById('notification-container');
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
            
            notification.innerHTML = `
                <i class="fas ${icon} notification-icon"></i>
                <div class="notification-content">
                    <div class="notification-title">${type === 'success' ? 'Thành công' : 'Lỗi'}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="close-notification">&times;</button>
            `;
            
            notificationContainer.appendChild(notification);
            
            // Close notification on button click
            notification.querySelector('.close-notification').addEventListener('click', () => {
                notification.style.animation = 'fadeOut 0.5s ease forwards';
                setTimeout(() => {
                    notification.remove();
                }, 500);
            });
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'fadeOut 0.5s ease forwards';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 500);
                }
            }, 5000);
        }
        
        // Login form submission
        document.getElementById('login-form').addEventListener('submit', (e) => {
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
        });
        
        // Register form submission
        document.getElementById('register-form').addEventListener('submit', (e) => {
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
        });
        
        // Forgot password form submission
        document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('forgot-email').value;
            
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    showNotification('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.', 'success');
                    // Close modal after 3 seconds
                    setTimeout(() => {
                        forgotPasswordModal.style.display = 'none';
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
        });
        
        // Check if URL has #register hash and switch to register tab
        if (window.location.hash === '#register') {
            document.querySelector('[data-tab="register"]').click();
        }