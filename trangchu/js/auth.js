// Current user data
let currentUser = null;
let userData = null;

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loadUserData(user.uid);
        setupEventListeners();
    } else {
        window.location.href = '../login/index.html';
    }
});

// Load user data from Firestore
function loadUserData(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                userData = doc.data();
                
                // Update UI with user data
                document.getElementById('user-name').textContent = userData.displayName || userData.email;
                document.getElementById('greeting-name').textContent = userData.displayName || userData.email;
                document.getElementById('user-email').textContent = userData.email;
                document.getElementById('balance-amount').textContent = formatPrice(userData.balance || 0);
                document.getElementById('deposit-balance').textContent = formatPrice(userData.balance || 0);
                document.getElementById('profile-name').value = userData.displayName || '';
                document.getElementById('profile-email').value = userData.email;
                
                // Update user role display
                const userRoleElement = document.getElementById('user-role');
                if (userData.role === 'admin') {
                    userRoleElement.textContent = 'Quản trị viên';
                    userRoleElement.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
                    
                    // Show admin menu items
                    document.querySelectorAll('.admin-only').forEach(item => {
                        item.style.display = 'flex';
                    });
                } else {
                    userRoleElement.textContent = 'Thành viên';
                }
                
                // Load additional data
                loadFeaturedProducts();
                loadFeaturedServices();
                loadTransactions(userId);
                loadDepositHistory(userId);
                loadAllProducts();
                loadAllServices();
                loadAllTransactions(userId);
                loadOrdersCount(userId);
                loadOrders(userId);
            }
        })
        .catch((error) => {
            showNotification('Có lỗi xảy ra khi tải dữ liệu người dùng', 'error');
            console.error("Error loading user data:", error);
        });
}