// DOM Elements
const editUserModal = document.getElementById('edit-user-modal');
const addFundsModal = document.getElementById('add-funds-modal');
const productModal = document.getElementById('product-modal');
const serviceModal = document.getElementById('service-modal');
const editUserForm = document.getElementById('edit-user-form');
const addFundsForm = document.getElementById('add-funds-form');
const productForm = document.getElementById('product-form');
const serviceForm = document.getElementById('service-form');

// Edit user
function editUser(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const user = doc.data();
                document.getElementById('edit-user-id').value = userId;
                document.getElementById('edit-user-name').value = user.displayName || '';
                document.getElementById('edit-user-email').value = user.email || '';
                document.getElementById('edit-user-balance').value = user.balance || 0;
                document.getElementById('edit-user-role').value = user.role || 'user';
                document.getElementById('edit-user-status').value = user.status || 'active';
                
                editUserModal.style.display = 'flex';
            }
        })
        .catch((error) => {
            console.error("Error loading user:", error);
            showNotification('Lỗi', 'Không thể tải thông tin người dùng', 'error');
        });
}

// Add funds to user
function addFunds(userId, userName) {
    document.getElementById('add-funds-user-id').value = userId;
    document.getElementById('add-funds-user-name').value = userName;
    document.getElementById('add-funds-amount').value = '';
    
    addFundsModal.style.display = 'flex';
}

// Edit product
function editProduct(productId) {
    db.collection('products').doc(productId).get()
        .then((doc) => {
            if (doc.exists) {
                const product = doc.data();
                document.getElementById('product-modal-title').textContent = 'Sửa sản phẩm';
                document.getElementById('product-id').value = productId;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-description').value = product.description || '';
                document.getElementById('product-price').value = product.price;
                document.getElementById('product-image').value = product.imageUrl || '';
                document.getElementById('product-downloadUrl').value = product.downloadUrl || '';
                document.getElementById('product-isFeatured').value = product.isFeatured ? 'true' : 'false';
                document.getElementById('product-status').value = product.status || 'active';
                
                productModal.style.display = 'flex';
            }
        })
        .catch((error) => {
            console.error("Error loading product:", error);
            showNotification('Lỗi', 'Không thể tải thông tin sản phẩm', 'error');
        });
}

// Edit service
function editService(serviceId) {
    db.collection('free_services').doc(serviceId).get()
        .then((doc) => {
            if (doc.exists) {
                const service = doc.data();
                document.getElementById('service-modal-title').textContent = 'Sửa dịch vụ';
                document.getElementById('service-id').value = serviceId;
                document.getElementById('service-name').value = service.name;
                document.getElementById('service-description').value = service.description || '';
                document.getElementById('service-image').value = service.imageUrl || '';
                document.getElementById('service-externalUrl').value = service.externalUrl || '';
                document.getElementById('service-isFeatured').value = service.isFeatured ? 'true' : 'false';
                document.getElementById('service-status').value = service.status || 'active';
                
                serviceModal.style.display = 'flex';
            }
        })
        .catch((error) => {
            console.error("Error loading service:", error);
            showNotification('Lỗi', 'Không thể tải thông tin dịch vụ', 'error');
        });
}

// Event listeners for forms
editUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('edit-user-id').value;
    const name = document.getElementById('edit-user-name').value;
    const email = document.getElementById('edit-user-email').value;
    const balance = parseInt(document.getElementById('edit-user-balance').value);
    const role = document.getElementById('edit-user-role').value;
    const status = document.getElementById('edit-user-status').value;
    
    db.collection('users').doc(userId).update({
        displayName: name,
        email: email,
        balance: balance,
        role: role,
        status: status
    })
    .then(() => {
        showNotification('Thành công', 'Đã cập nhật thông tin người dùng', 'success');
        editUserModal.style.display = 'none';
        loadUsers(document.getElementById('user-search').value);
    })
    .catch((error) => {
        console.error("Error updating user:", error);
        showNotification('Lỗi', 'Không thể cập nhật thông tin người dùng', 'error');
    });
});

addFundsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('add-funds-user-id').value;
    const amount = parseInt(document.getElementById('add-funds-amount').value);
    const description = document.getElementById('add-funds-description').value;
    
    const batch = db.batch();
    
    // Update user balance
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
        balance: firebase.firestore.FieldValue.increment(amount)
    });
    
    // Create transaction record
    const transactionRef = db.collection('transactions').doc();
    batch.set(transactionRef, {
        userId: userId,
        type: 'admin_add',
        amount: amount,
        description: description,
        status: 'completed',
        createdAt: new Date()
    });
    
    // Commit batch
    batch.commit()
        .then(() => {
            showNotification('Thành công', `Đã cộng ${formatPrice(amount)} vào tài khoản người dùng`, 'success');
            addFundsModal.style.display = 'none';
            loadUsers(document.getElementById('user-search').value);
            loadStats();
        })
        .catch((error) => {
            console.error("Error adding funds:", error);
            showNotification('Lỗi', 'Không thể cộng tiền cho người dùng', 'error');
        });
});

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = parseInt(document.getElementById('product-price').value);
    const imageUrl = document.getElementById('product-image').value;
    const downloadUrl = document.getElementById('product-downloadUrl').value;
    const isFeatured = document.getElementById('product-isFeatured').value === 'true';
    const status = document.getElementById('product-status').value;
    
    const productData = {
        name: name,
        description: description,
        price: price,
        imageUrl: imageUrl,
        downloadUrl: downloadUrl,
        isFeatured: isFeatured,
        status: status,
        updatedAt: new Date()
    };
    
    if (productId) {
        // Update existing product
        db.collection('products').doc(productId).update(productData)
            .then(() => {
                showNotification('Thành công', 'Cập nhật sản phẩm thành công', 'success');
                productModal.style.display = 'none';
                loadProductsManagement();
            })
            .catch((error) => {
                console.error("Error updating product:", error);
                showNotification('Lỗi', 'Không thể cập nhật sản phẩm', 'error');
            });
    } else {
        // Add new product
        productData.createdAt = new Date();
        
        db.collection('products').add(productData)
            .then(() => {
                showNotification('Thành công', 'Thêm sản phẩm thành công', 'success');
                productModal.style.display = 'none';
                loadProductsManagement();
            })
            .catch((error) => {
                console.error("Error adding product:", error);
                showNotification('Lỗi', 'Không thể thêm sản phẩm', 'error');
            });
    }
});

serviceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const serviceId = document.getElementById('service-id').value;
    const name = document.getElementById('service-name').value;
    const description = document.getElementById('service-description').value;
    const imageUrl = document.getElementById('service-image').value;
    const externalUrl = document.getElementById('service-externalUrl').value;
    const isFeatured = document.getElementById('service-isFeatured').value === 'true';
    const status = document.getElementById('service-status').value;
    
    const serviceData = {
        name: name,
        description: description,
        imageUrl: imageUrl,
        externalUrl: externalUrl,
        isFeatured: isFeatured,
        status: status,
        updatedAt: new Date()
    };
    
    if (serviceId) {
        // Update existing service
        db.collection('free_services').doc(serviceId).update(serviceData)
            .then(() => {
                showNotification('Thành công', 'Cập nhật dịch vụ thành công', 'success');
                serviceModal.style.display = 'none';
                loadServicesManagement();
            })
            .catch((error) => {
                console.error("Error updating service:", error);
                showNotification('Lỗi', 'Không thể cập nhật dịch vụ', 'error');
            });
    } else {
        // Add new service
        serviceData.createdAt = new Date();
        
        db.collection('free_services').add(serviceData)
            .then(() => {
                showNotification('Thành công', 'Thêm dịch vụ thành công', 'success');
                serviceModal.style.display = 'none';
                loadServicesManagement();
            })
            .catch((error) => {
                console.error("Error adding service:", error);
                showNotification('Lỗi', 'Không thể thêm dịch vụ', 'error');
            });
    }
});

// Close modals
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
        editUserModal.style.display = 'none';
        addFundsModal.style.display = 'none';
        productModal.style.display = 'none';
        serviceModal.style.display = 'none';
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editUserModal) {
        editUserModal.style.display = 'none';
    }
    if (e.target === addFundsModal) {
        addFundsModal.style.display = 'none';
    }
    if (e.target === productModal) {
        productModal.style.display = 'none';
    }
    if (e.target === serviceModal) {
        serviceModal.style.display = 'none';
    }
});

// Make functions global for onclick attributes
window.editUser = editUser;
window.addFunds = addFunds;
window.editProduct = editProduct;
window.editService = editService;