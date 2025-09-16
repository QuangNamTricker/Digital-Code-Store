
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

        // DOM Elements
        const logoutBtn = document.getElementById('logout-btn');
        const menuItems = document.querySelectorAll('.menu-item');
        const pageContents = document.querySelectorAll('.content-section');
        const usersTable = document.getElementById('users-table');
        const transactionsTable = document.getElementById('transactions-table');
        const depositsTable = document.getElementById('deposits-table');
        const productsTable = document.getElementById('products-table');
        const editUserModal = document.getElementById('edit-user-modal');
        const addFundsModal = document.getElementById('add-funds-modal');
        const productModal = document.getElementById('product-modal');
        const editUserForm = document.getElementById('edit-user-form');
        const addFundsForm = document.getElementById('add-funds-form');
        const productForm = document.getElementById('product-form');
        const userSearch = document.getElementById('user-search');
        const depositUserSearch = document.getElementById('deposit-user-search');
        const transactionUserSearch = document.getElementById('transaction-user-search');
        const addProductBtn = document.getElementById('add-product-btn');

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

        // Menu navigation
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                
                // Update active menu item
                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Show corresponding page
                pageContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${page}-page`).classList.add('active');
                
                // Load specific data for the page
                if (page === 'users') {
                    loadUsers(userSearch.value);
                } else if (page === 'transactions') {
                    loadTransactions(transactionUserSearch.value);
                } else if (page === 'deposits') {
                    loadDepositRequests(depositUserSearch.value);
                } else if (page === 'stats') {
                    loadStatistics();
                } else if (page === 'products') {
                    loadProductsManagement();
                }
            });
        });

        // Logout
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = '../login/index.html';
            });
        });

        // Load stats
        function loadStats() {
            // Total users
            db.collection('users').get().then((snapshot) => {
                document.getElementById('total-users').textContent = snapshot.size;
            });

            // Total orders
            db.collection('orders').get().then((snapshot) => {
                document.getElementById('total-orders').textContent = snapshot.size;
            });

            // Total revenue
            db.collection('transactions')
                .where('type', '==', 'purchase')
                .where('status', '==', 'completed')
                .get()
                .then((snapshot) => {
                    let total = 0;
                    snapshot.forEach(doc => {
                        total += doc.data().amount;
                    });
                    document.getElementById('total-revenue').textContent = formatPrice(total);
                });

            // Pending deposits
            db.collection('deposit_requests')
                .where('status', '==', 'pending')
                .get()
                .then((snapshot) => {
                    document.getElementById('pending-deposits').textContent = snapshot.size;
                });
        }

        // Load users
        function loadUsers(searchTerm = '') {
            let query = db.collection('users');
            
            query.get().then((querySnapshot) => {
                const tbody = usersTable.querySelector('tbody');
                tbody.innerHTML = '';
                
                if (querySnapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="6">Không có người dùng nào</td></tr>';
                    return;
                }
                
                let usersFound = false;
                
                querySnapshot.forEach((doc) => {
                    const user = doc.data();
                    const userId = doc.id;
                    
                    // Filter by search term (email or user ID)
                    if (searchTerm && 
                        !user.email.toLowerCase().includes(searchTerm.toLowerCase()) && 
                        !userId.toLowerCase().includes(searchTerm.toLowerCase())) {
                        return;
                    }
                    
                    usersFound = true;
                    
                    const userRow = `
                        <tr>
                            <td>${userId.substring(0, 8)}</td>
                            <td>${user.displayName || 'N/A'}</td>
                            <td>${user.email}</td>
                            <td>${formatPrice(user.balance || 0)}</td>
                            <td><span class="status ${user.status || 'active'}">${user.status === 'banned' ? 'Bị khóa' : 'Hoạt động'}</span></td>
                            <td>
                                <button class="action-btn btn-edit" onclick="editUser('${userId}')">Sửa</button>
                                <button class="action-btn btn-add-funds" onclick="addFunds('${userId}', '${user.displayName || user.email}')">Cộng tiền</button>
                                <button class="action-btn btn-ban" onclick="toggleUserStatus('${userId}', '${user.status || 'active'}')">
                                    ${user.status === 'banned' ? 'Mở khóa' : 'Khóa'}
                                </button>
                            </td>
                        </tr>
                    `;
                    
                    tbody.innerHTML += userRow;
                });
                
                if (!usersFound) {
                    tbody.innerHTML = '<tr><td colspan="6">Không tìm thấy người dùng nào phù hợp</td></tr>';
                }
            }).catch((error) => {
                console.error("Error loading users:", error);
            });
        }

        // Load transactions
        function loadTransactions(userIdFilter = '') {
            let query = db.collection('transactions').orderBy('createdAt', 'desc');
            
            query.get().then((querySnapshot) => {
                const tbody = transactionsTable.querySelector('tbody');
                tbody.innerHTML = '';
                
                if (querySnapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="6">Không có giao dịch nào</td></tr>';
                    return;
                }
                
                let transactionsFound = false;
                
                querySnapshot.forEach((doc) => {
                    const transaction = doc.data();
                    const transactionId = doc.id;
                    
                    // Filter by user ID
                    if (userIdFilter && transaction.userId && 
                        !transaction.userId.toLowerCase().includes(userIdFilter.toLowerCase())) {
                        return;
                    }
                    
                    transactionsFound = true;
                    
                    const transactionRow = `
                        <tr>
                            <td>${transactionId.substring(0, 8)}</td>
                            <td>${transaction.userId ? transaction.userId.substring(0, 8) : 'N/A'}</td>
                            <td>${transaction.description || 'N/A'}</td>
                            <td>${formatPrice(transaction.amount || 0)}</td>
                            <td>${transaction.createdAt ? transaction.createdAt.toDate().toLocaleString('vi-VN') : 'N/A'}</td>
                            <td><span class="status ${transaction.status || 'completed'}">${transaction.status === 'pending' ? 'Chờ xử lý' : 'Hoàn thành'}</span></td>
                        </tr>
                    `;
                    
                    tbody.innerHTML += transactionRow;
                });
                
                if (!transactionsFound) {
                    tbody.innerHTML = '<tr><td colspan="6">Không tìm thấy giao dịch nào phù hợp</td></tr>';
                }
            }).catch((error) => {
                console.error("Error loading transactions:", error);
            });
        }

        // Load deposit requests
        function loadDepositRequests(userIdFilter = '') {
            let query = db.collection('deposit_requests').orderBy('createdAt', 'desc');
            
            query.get().then((querySnapshot) => {
                const tbody = depositsTable.querySelector('tbody');
                tbody.innerHTML = '';
                
                if (querySnapshot.empty) {
                    tbody.innerHTML = '<tr><td colspan="7">Không có yêu cầu nộp tiền nào</td></tr>';
                    return;
                }
                
                let requestsFound = false;
                
                querySnapshot.forEach((doc) => {
                    const request = doc.data();
                    const requestId = doc.id;
                    
                    // Filter by user ID
                    if (userIdFilter && request.userId && 
                        !request.userId.toLowerCase().includes(userIdFilter.toLowerCase())) {
                        return;
                    }
                    
                    requestsFound = true;
                    
                    const requestRow = `
                        <tr>
                            <td>${requestId.substring(0, 8)}</td>
                            <td>${request.userId ? request.userId.substring(0, 8) : 'N/A'}</td>
                            <td>${formatPrice(request.amount || 0)}</td>
                            <td>${request.description || 'N/A'}</td>
                            <td>${request.createdAt ? request.createdAt.toDate().toLocaleString('vi-VN') : 'N/A'}</td>
                            <td><span class="status ${request.status || 'pending'}">${request.status === 'pending' ? 'Chờ xử lý' : request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}</span></td>
                            <td>
                                ${request.status === 'pending' ? `
                                    <button class="action-btn btn-approve" onclick="approveDeposit('${requestId}', '${request.userId}', ${request.amount})">Duyệt</button>
                                    <button class="action-btn btn-reject" onclick="rejectDeposit('${requestId}')">Từ chối</button>
                                ` : 'Đã xử lý'}
                            </td>
                        </tr>
                    `;
                    
                    tbody.innerHTML += requestRow;
                });
                
                if (!requestsFound) {
                    tbody.innerHTML = '<tr><td colspan="7">Không tìm thấy yêu cầu nào phù hợp</td></tr>';
                }
            }).catch((error) => {
                console.error("Error loading deposit requests:", error);
            });
        }

        // Load recent activities
        function loadRecentActivities() {
            db.collection('transactions')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get()
                .then((querySnapshot) => {
                    const tbody = document.querySelector('#recent-activities tbody');
                    tbody.innerHTML = '';
                    
                    if (querySnapshot.empty) {
                        tbody.innerHTML = '<tr><td colspan="4">Không có hoạt động nào gần đây</td></tr>';
                        return;
                    }
                    
                    querySnapshot.forEach((doc) => {
                        const transaction = doc.data();
                        const transactionId = doc.id;
                        
                        const activityRow = `
                            <tr>
                                <td>${transaction.createdAt ? transaction.createdAt.toDate().toLocaleString('vi-VN') : 'N/A'}</td>
                                <td>${transaction.userId ? transaction.userId.substring(0, 8) : 'N/A'}</td>
                                <td>${transaction.type === 'deposit' ? 'Nộp tiền' : 'Mua hàng'}</td>
                                <td>${transaction.description || 'N/A'}</td>
                            </tr>
                        `;
                        
                        tbody.innerHTML += activityRow;
                    });
                }).catch((error) => {
                    console.error("Error loading recent activities:", error);
                });
        }

        // Load statistics
        function loadStatistics() {
            // Daily revenue
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            db.collection('transactions')
                .where('type', '==', 'purchase')
                .where('status', '==', 'completed')
                .where('createdAt', '>=', today)
                .get()
                .then((snapshot) => {
                    let total = 0;
                    snapshot.forEach(doc => {
                        total += doc.data().amount;
                    });
                    document.getElementById('daily-revenue').textContent = formatPrice(total);
                });

            // Weekly orders
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            db.collection('orders')
                .where('createdAt', '>=', weekAgo)
                .get()
                .then((snapshot) => {
                    document.getElementById('weekly-orders').textContent = snapshot.size;
                });

            // New users (7 days)
            db.collection('users')
                .where('createdAt', '>=', weekAgo)
                .get()
                .then((snapshot) => {
                    document.getElementById('new-users').textContent = snapshot.size;
                });

            // Top products
            db.collection('orders')
                .get()
                .then((snapshot) => {
                    const productSales = {};
                    
                    snapshot.forEach(doc => {
                        const order = doc.data();
                        if (order.productId) {
                            if (productSales[order.productId]) {
                                productSales[order.productId].quantity += 1;
                                productSales[order.productId].revenue += order.amount;
                            } else {
                                productSales[order.productId] = {
                                    name: order.productName || 'Sản phẩm',
                                    quantity: 1,
                                    revenue: order.amount
                                };
                            }
                        }
                    });
                    
                    // Sort by revenue
                    const sortedProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
                    
                    const tbody = document.querySelector('#top-products tbody');
                    tbody.innerHTML = '';
                    
                    if (sortedProducts.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="3">Không có dữ liệu bán hàng</td></tr>';
                        return;
                    }
                    
                    sortedProducts.slice(0, 5).forEach(product => {
                        const productRow = `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.quantity}</td>
                                <td>${formatPrice(product.revenue)}</td>
                            </tr>
                        `;
                        
                        tbody.innerHTML += productRow;
                    });
                });
        }

        // Load products management
        function loadProductsManagement() {
            const tbody = productsTable.querySelector('tbody');
            tbody.innerHTML = '<tr><td colspan="7">Đang tải dữ liệu...</td></tr>';

            db.collection('products').orderBy('createdAt', 'desc').get()
                .then((querySnapshot) => {
                    tbody.innerHTML = '';
                    if (querySnapshot.empty) {
                        tbody.innerHTML = '<tr><td colspan="7">Không có sản phẩm nào.</td></tr>';
                        return;
                    }

                    querySnapshot.forEach((doc) => {
                        const product = doc.data();
                        const productId = doc.id;
                        
                        const productRow = `
                            <tr>
                                <td><img src="${product.imageUrl || 'https://via.placeholder.com/50x50?text=No+Image'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                                <td>${product.name}</td>
                                <td>${product.description || 'N/A'}</td>
                                <td>${formatPrice(product.price)}</td>
                                <td>${product.isFeatured ? 'Có' : 'Không'}</td>
                                <td><span class="status ${product.status}">${product.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}</span></td>
                                <td>
                                    <button class="action-btn btn-edit" onclick="editProduct('${productId}')">Sửa</button>
                                    <button class="action-btn btn-ban" onclick="toggleProductStatus('${productId}', '${product.status}')">
                                        ${product.status === 'active' ? 'Ẩn' : 'Hiện'}
                                    </button>
                                    <button class="action-btn btn-delete" onclick="deleteProduct('${productId}', '${product.name}')">
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        `;
                        
                        tbody.innerHTML += productRow;
                    });
                })
                .catch((error) => {
                    console.error("Error loading products:", error);
                    tbody.innerHTML = '<tr><td colspan="7">Có lỗi xảy ra khi tải danh sách sản phẩm.</td></tr>';
                });
        }

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

        // Toggle user status
        function toggleUserStatus(userId, currentStatus) {
            const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
            
            db.collection('users').doc(userId).update({
                status: newStatus
            })
            .then(() => {
                showNotification('Thành công', `Đã ${newStatus === 'banned' ? 'khóa' : 'mở khóa'} người dùng`, 'success');
                loadUsers(userSearch.value);
            })
            .catch((error) => {
                console.error("Error updating user status:", error);
                showNotification('Lỗi', 'Không thể cập nhật trạng thái người dùng', 'error');
            });
        }

        // Approve deposit
        function approveDeposit(requestId, userId, amount) {
            const batch = db.batch();
            
            // Update deposit request status
            const requestRef = db.collection('deposit_requests').doc(requestId);
            batch.update(requestRef, { status: 'approved' });
            
            // Update user balance
            const userRef = db.collection('users').doc(userId);
            batch.update(userRef, {
                balance: firebase.firestore.FieldValue.increment(amount)
            });
            
            // Create transaction record
            const transactionRef = db.collection('transactions').doc();
            batch.set(transactionRef, {
                userId: userId,
                type: 'deposit',
                amount: amount,
                description: 'Nạp tiền thành công',
                status: 'completed',
                createdAt: new Date()
            });
            
            // Commit batch
            batch.commit()
                .then(() => {
                    showNotification('Thành công', 'Đã duyệt yêu cầu nộp tiền', 'success');
                    loadDepositRequests(depositUserSearch.value);
                    loadStats();
                })
                .catch((error) => {
                    console.error("Error approving deposit:", error);
                    showNotification('Lỗi', 'Không thể duyệt yêu cầu nộp tiền', 'error');
                });
        }

        // Reject deposit
        function rejectDeposit(requestId) {
            db.collection('deposit_requests').doc(requestId).update({
                status: 'rejected'
            })
            .then(() => {
                showNotification('Thành công', 'Đã từ chối yêu cầu nộp tiền', 'success');
                loadDepositRequests(depositUserSearch.value);
            })
            .catch((error) => {
                console.error("Error rejecting deposit:", error);
                showNotification('Lỗi', 'Không thể từ chối yêu cầu nộp tiền', 'error');
            });
        }

        // Add product
        function addProduct() {
            document.getElementById('product-modal-title').textContent = 'Thêm sản phẩm mới';
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
            document.getElementById('product-status').value = 'active';
            document.getElementById('product-isFeatured').value = 'false';
            productModal.style.display = 'flex';
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

        // Toggle product status
        function toggleProductStatus(productId, currentStatus) {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            
            db.collection('products').doc(productId).update({
                status: newStatus
            })
            .then(() => {
                showNotification('Thành công', `Đã ${newStatus === 'active' ? 'kích hoạt' : 'ẩn'} sản phẩm thành công`, 'success');
                loadProductsManagement();
            })
            .catch((error) => {
                console.error("Error updating product status:", error);
                showNotification('Lỗi', 'Không thể cập nhật trạng thái sản phẩm', 'error');
            });
        }

        // Delete product
        function deleteProduct(productId, productName) {
            if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
                db.collection('products').doc(productId).delete()
                .then(() => {
                    showNotification('Thành công', 'Đã xóa sản phẩm thành công', 'success');
                    loadProductsManagement();
                })
                .catch((error) => {
                    console.error("Error deleting product:", error);
                    showNotification('Lỗi', 'Không thể xóa sản phẩm', 'error');
                });
            }
        }

        // Event listeners for forms
        editUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('edit-user-id').value;
            const name = document.getElementById('edit-user-name').value;
            const email = document.getElementById('edit-user-email').value;
            const balance = parseInt(document.getElementById('edit-user-balance').value);
            const status = document.getElementById('edit-user-status').value;
            
            db.collection('users').doc(userId).update({
                displayName: name,
                email: email,
                balance: balance,
                status: status
            })
            .then(() => {
                showNotification('Thành công', 'Đã cập nhật thông tin người dùng', 'success');
                editUserModal.style.display = 'none';
                loadUsers(userSearch.value);
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
                    loadUsers(userSearch.value);
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

        // User search
        userSearch.addEventListener('input', () => {
            loadUsers(userSearch.value);
        });

        // Deposit search
        depositUserSearch.addEventListener('input', () => {
            loadDepositRequests(depositUserSearch.value);
        });

        // Transaction search
        transactionUserSearch.addEventListener('input', () => {
            loadTransactions(transactionUserSearch.value);
        });

        // Add product button
        addProductBtn.addEventListener('click', addProduct);

        // Close modals
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                editUserModal.style.display = 'none';
                addFundsModal.style.display = 'none';
                productModal.style.display = 'none';
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === editUserModal) editUserModal.style.display = 'none';
            if (e.target === addFundsModal) addFundsModal.style.display = 'none';
            if (e.target === productModal) productModal.style.display = 'none';
        });

        // Utility functions
        function formatPrice(price) {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        }

        function showNotification(title, message, type = 'info') {
            const notificationContainer = document.getElementById('notification-container');
            
            const notification = document.createElement('div');
            notification.className = 'notification';
            
            let icon = 'fa-info-circle';
            if (type === 'success') icon = 'fa-check-circle';
            if (type === 'error') icon = 'fa-exclamation-circle';
            if (type === 'warning') icon = 'fa-exclamation-triangle';
            
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="close-notification">&times;</button>
            `;
            
            notificationContainer.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
            
            // Manual close
            notification.querySelector('.close-notification').addEventListener('click', () => {
                notification.remove();
            });
        }

        // Make functions global for onclick attributes
        window.editUser = editUser;
        window.addFunds = addFunds;
        window.toggleUserStatus = toggleUserStatus;
        window.approveDeposit = approveDeposit;
        window.rejectDeposit = rejectDeposit;
        window.editProduct = editProduct;
        window.toggleProductStatus = toggleProductStatus;
        window.deleteProduct = deleteProduct;
    