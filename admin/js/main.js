// main.js
// Global variables
let currentUser = null;
let db = null;

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Panel initializing...');
    
    // Initialize Firebase
    initializeFirebase();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize modals
    initModals();
    
    // Check authentication state
    checkAuthState();
    
    console.log('Admin Panel initialized successfully');
});

// Initialize Firebase
function initializeFirebase() {
    try {
        db = firebase.firestore();
        console.log('Firebase Firestore initialized');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        showNotification('Lỗi khởi tạo hệ thống', 'error');
    }
}

// Check authentication state
function checkAuthState() {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            console.log('User authenticated:', user.email);
            
            // Verify admin role
            await verifyAdminRole(user.uid);
            
            // Load admin info
            await loadAdminInfo(user.uid);
            
            // Load initial data for current page
            loadCurrentPageData();
            
        } else {
            console.log('User not authenticated, redirecting to login...');
            window.location.href = 'auth.html';
        }
    });
}

// Verify admin role
async function verifyAdminRole(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.role !== 'admin') {
                showNotification('Bạn không có quyền truy cập trang quản trị', 'error');
                await firebase.auth().signOut();
                window.location.href = '../trangchu/index.html';
                return false;
            }
            return true;
        } else {
            throw new Error('User document not found');
        }
    } catch (error) {
        console.error('Error verifying admin role:', error);
        showNotification('Lỗi xác thực quyền truy cập', 'error');
        await firebase.auth().signOut();
        return false;
    }
}

// Load admin info
async function loadAdminInfo(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Update UI with admin info
            const adminNameElement = document.getElementById('admin-name');
            const adminEmailElement = document.getElementById('admin-email');
            
            if (adminNameElement) {
                adminNameElement.textContent = userData.name || 'Administrator';
            }
            if (adminEmailElement) {
                adminEmailElement.textContent = userData.email || currentUser.email;
            }
        }
    } catch (error) {
        console.error('Error loading admin info:', error);
    }
}

// Load data for current active page
function loadCurrentPageData() {
    const activePage = document.querySelector('.content-section.active');
    if (!activePage) return;
    
    const pageId = activePage.id;
    
    switch (pageId) {
        case 'dashboard-page':
            loadDashboard();
            break;
        case 'users-page':
            loadUsers();
            break;
        case 'products-page':
            loadProductsManagement();
            break;
        case 'services-page':
            loadServicesManagement();
            break;
        case 'deposits-page':
            loadDepositRequests();
            break;
        case 'transactions-page':
            loadTransactions();
            break;
        case 'stats-page':
            loadStatistics();
            break;
        case 'coupons-page':
            loadCouponsPage();
            break;
    }
}

// Initialize modals
function initModals() {
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals with close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// Global logout function
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                await firebase.auth().signOut();
                showNotification('Đã đăng xuất thành công', 'success');
                window.location.href = '../trangchu/index.html';
            } catch (error) {
                console.error('Error signing out:', error);
                showNotification('Lỗi khi đăng xuất', 'error');
            }
        });
    }
}

// Initialize logout button
document.addEventListener('DOMContentLoaded', setupLogout);

// Export global variables and functions for other modules
window.db = db;
window.currentUser = currentUser;
window.showSection = showSection;