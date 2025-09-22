// DOM Elements
const logoutBtn = document.getElementById('logout-btn');
const notificationContainer = document.getElementById('notification-container');
const depositRequestForm = document.getElementById('deposit-request-form');
const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const menuItems = document.querySelectorAll('.menu-item');
const pageContents = document.querySelectorAll('.page-content');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const productSearch = document.getElementById('product-search');
const serviceSearch = document.getElementById('service-search');
const refreshIndicator = document.getElementById('refresh-indicator');
const adminMenuItems = document.querySelectorAll('.admin-only');

// Setup event listeners
function setupEventListeners() {
    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    });

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    mainContent.addEventListener('click', () => {
        if (window.innerWidth < 992 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // Menu navigation
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            
            // Skip if it's an external link
            if (!page) return;
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding page
            pageContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${page}-page`).classList.add('active');
            
            // Close sidebar on mobile after selection
            if (window.innerWidth < 992) {
                sidebar.classList.remove('active');
            }
            
            // Reload data when switching to specific pages
            if (page === 'transactions') {
                loadAllTransactions(currentUser.uid);
            } else if (page === 'deposit') {
                loadDepositHistory(currentUser.uid);
            } else if (page === 'products') {
                loadAllProducts();
            } else if (page === 'free-services') {
                loadAllServices();
            } else if (page === 'orders') {
                loadOrders(currentUser.uid);
            }
        });
    });

    // Product search functionality
    productSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterProducts(searchTerm);
    });

    // Service search functionality
    serviceSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterServices(searchTerm);
    });

    // Pull to refresh functionality
    let touchStartY = 0;
    const productsContainer = document.getElementById('all-products');
    
    productsContainer.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    productsContainer.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const scrollTop = productsContainer.scrollTop;
        
        // If at top of container and pulling down
        if (scrollTop === 0 && touchY > touchStartY + 50) {
            refreshIndicator.classList.add('active');
            loadAllProducts();
            
            // Hide refresh indicator after 2 seconds
            setTimeout(() => {
                refreshIndicator.classList.remove('active');
            }, 2000);
        }
    });

    // Deposit form
    depositRequestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseInt(document.getElementById('deposit-request-amount').value);
        const description = document.getElementById('deposit-request-description').value;
        
        if (amount < 1000) {
            showNotification('Số tiền nộp tối thiểu là 1,000 VNĐ', 'error');
            return;
        }
        
        // Create deposit request
        db.collection('deposit_requests').add({
            userId: currentUser.uid,
            amount: amount,
            description: description,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            showNotification('Đã gửi yêu cầu nộp tiền thành công. Vui lòng chờ quản trị viên xác nhận.', 'success');
            depositRequestForm.reset();
            loadDepositHistory(currentUser.uid);
        }).catch((error) => {
            showNotification('Có lỗi xảy ra khi gửi yêu cầu nộp tiền', 'error');
            console.error("Error creating deposit request:", error);
        });
    });

    // Profile form
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const displayName = document.getElementById('profile-name').value;
        
        // Update user profile
        currentUser.updateProfile({
            displayName: displayName
        }).then(() => {
            // Update Firestore
            return db.collection('users').doc(currentUser.uid).update({
                displayName: displayName
            });
        }).then(() => {
            showNotification('Cập nhật thông tin thành công', 'success');
            // Reload user data
            loadUserData(currentUser.uid);
        }).catch((error) => {
            showNotification('Có lỗi xảy ra khi cập nhật thông tin', 'error');
            console.error("Error updating profile:", error);
        });
    });

    // Password form
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            showNotification('Mật khẩu mới và xác nhận mật khẩu không khớp', 'error');
            return;
        }

        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );

        currentUser.reauthenticateWithCredential(credential)
            .then(() => {
                // Update password
                return currentUser.updatePassword(newPassword);
            })
            .then(() => {
                showNotification('Đổi mật khẩu thành công', 'success');
                passwordForm.reset();
            })
            .catch((error) => {
                showNotification('Có lỗi xảy ra khi đổi mật khẩu: ' + error.message, 'error');
                console.error("Error changing password:", error);
            });
    });

    // Show notification button (for demo)
    document.getElementById('show-notification').addEventListener('click', () => {
        showNotification('Đây là thông báo mẫu!', 'info');
    });
}