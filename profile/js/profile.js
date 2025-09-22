// Load user data from Firestore
function loadUserData(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                document.getElementById('fullname').value = userData.fullname || '';
                document.getElementById('phone').value = userData.phone || '';
                document.getElementById('email').value = userData.email || '';
                document.getElementById('birthday').value = userData.birthday || '';
                document.getElementById('address').value = userData.address || '';
                
                // Update profile name if available
                if (userData.fullname) {
                    document.getElementById('profile-name').textContent = userData.fullname;
                }
            } else {
                // Create user document if it doesn't exist
                const user = auth.currentUser;
                if (user) {
                    db.collection('users').doc(userId).set({
                        email: user.email,
                        createdAt: new Date()
                    });
                }
            }
        })
        .catch((error) => {
            console.error("Error loading user data:", error);
        });
}

// Tab switching functionality
document.querySelectorAll('.profile-menu a').forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs
        document.querySelectorAll('.profile-menu a').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show corresponding content
        const tabId = this.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Update profile title
        const tabTitles = {
            'profile': 'Hồ Sơ Cá Nhân',
            'orders': 'Lịch Sử Đơn Hàng',
            'products': 'Sản Phẩm Của Tôi',
            'security': 'Cài Đặt Bảo Mật'
        };
        document.querySelector('.profile-title').textContent = tabTitles[tabId];
        
        // Load content based on tab
        if (tabId === 'orders') {
            loadUserOrders(auth.currentUser.uid);
        } else if (tabId === 'products') {
            loadUserProducts(auth.currentUser.uid);
        }
    });
});

// Edit profile functionality
document.getElementById('edit-profile-btn').addEventListener('click', function() {
    const formControls = document.querySelectorAll('#profile-form input, #profile-form textarea');
    const saveButton = document.getElementById('save-profile-btn');
    
    formControls.forEach(control => {
        control.disabled = !control.disabled;
    });
    
    if (formControls[0].disabled) {
        this.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa';
        saveButton.style.display = 'none';
    } else {
        this.innerHTML = '<i class="fas fa-times"></i> Hủy';
        saveButton.style.display = 'block';
    }
});

// Save profile functionality
document.getElementById('save-profile-btn').addEventListener('click', function() {
    const user = auth.currentUser;
    if (!user) return;
    
    const userData = {
        fullname: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        birthday: document.getElementById('birthday').value,
        address: document.getElementById('address').value,
        updatedAt: new Date()
    };
    
    // Update in Firestore
    db.collection('users').doc(user.uid).set(userData, { merge: true })
        .then(() => {
            alert('Cập nhật thông tin thành công!');
            document.getElementById('profile-name').textContent = userData.fullname;
            
            // Disable form and hide save button
            const formControls = document.querySelectorAll('#profile-form input, #profile-form textarea');
            formControls.forEach(control => {
                control.disabled = true;
            });
            this.style.display = 'none';
            document.getElementById('edit-profile-btn').innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa';
        })
        .catch((error) => {
            console.error("Error updating user data:", error);
            alert('Có lỗi xảy ra khi cập nhật thông tin.');
        });
});