// Check authentication and admin role
auth.onAuthStateChanged((user) => {
    if (user) {
        // Check if user is admin
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.role !== 'admin') {
                        window.location.href = '../trangchu/index.html';
                    } else {
                        // User is admin, load data
                        document.getElementById('admin-name').textContent = userData.displayName || 'Administrator';
                        document.getElementById('admin-email').textContent = userData.email;
                        
                        loadStats();
                        loadUsers();
                        loadTransactions();
                        loadDepositRequests();
                        loadProductsManagement();
                        loadServicesManagement();
                        loadRecentActivities();
                        loadStatistics();
                    }
                }
            })
            .catch((error) => {
                console.error("Error checking admin status:", error);
                window.location.href = '../login/index.html';
            });
    } else {
        window.location.href = '../login/index.html';
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = '../login/index.html';
    });
});