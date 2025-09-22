// Load user transactions
function loadTransactions(userId) {
    const transactionsBody = document.getElementById('transactions-body');
    transactionsBody.innerHTML = '<tr><td colspan="5" class="loading-text">Đang tải dữ liệu...</td></tr>';

    db.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get()
        .then((querySnapshot) => {
            transactionsBody.innerHTML = '';
            if (querySnapshot.empty) {
                transactionsBody.innerHTML = '<tr><td colspan="5" class="loading-text">Không có giao dịch nào.</td></tr>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const transaction = doc.data();
                const tr = document.createElement('tr');
                
                // Format date
                const date = transaction.createdAt ? transaction.createdAt.toDate().toLocaleString('vi-VN') : 'N/A';
                
                tr.innerHTML = `
                    <td>${doc.id.substring(0, 8)}</td>
                    <td>${transaction.description || 'Giao dịch'}</td>
                    <td>${date}</td>
                    <td>${formatPrice(transaction.amount)}</td>
                    <td><span class="status ${transaction.status}">${getStatusText(transaction.status)}</span></td>
                `;
                transactionsBody.appendChild(tr);
            });
        })
        .catch((error) => {
            console.error("Error loading transactions:", error);
            // Fallback without ordering
            db.collection('transactions')
                .where('userId', '==', userId)
                .get()
                .then((querySnapshot) => {
                    transactionsBody.innerHTML = '';
                    if (querySnapshot.empty) {
                        transactionsBody.innerHTML = '<tr><td colspan="5" class="loading-text">Không có giao dịch nào.</td></tr>';
                        return;
                    }
                    
                    const transactions = [];
                    querySnapshot.forEach((doc) => {
                        transactions.push({id: doc.id, ...doc.data()});
                    });
                    
                    // Sort manually by createdAt
                    transactions.sort((a, b) => {
                        const dateA = a.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
                        const dateB = b.createdAt ? (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
                        return dateB - dateA;
                    }).slice(0, 5);
                    
                    transactions.forEach(transaction => {
                        const tr = document.createElement('tr');
                        let date = 'N/A';
                        if (transaction.createdAt && typeof transaction.createdAt.toDate === 'function') {
                            date = transaction.createdAt.toDate().toLocaleString('vi-VN');
                        } else if (transaction.createdAt) {
                            date = new Date(transaction.createdAt).toLocaleString('vi-VN');
                        }
                        
                        tr.innerHTML = `
                            <td>${transaction.id.substring(0, 8)}</td>
                            <td>${transaction.description || 'Giao dịch'}</td>
                            <td>${date}</td>
                            <td>${formatPrice(transaction.amount || 0)}</td>
                            <td><span class="status ${transaction.status || 'pending'}">${getStatusText(transaction.status || 'pending')}</span></td>
                        `;
                        transactionsBody.appendChild(tr);
                    });
                })
                .catch((fallbackError) => {
                    console.error("Fallback error:", fallbackError);
                    transactionsBody.innerHTML = '<tr><td colspan="5" class="loading-text">Có lỗi xảy ra khi tải lịch sử giao dịch</td></tr>';
                });
        });
}

// Load deposit history
function loadDepositHistory(userId) {
    const depositHistoryBody = document.getElementById('deposit-history-body');
    depositHistoryBody.innerHTML = '<tr><td colspan="5" class="loading-text">Đang tải dữ liệu...</td></tr>';

    db.collection('deposit_requests')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            depositHistoryBody.innerHTML = '';
            if (querySnapshot.empty) {
                depositHistoryBody.innerHTML = '<tr><td colspan="5" class="loading-text">Không có lịch sử nộp tiền nào.</td></tr>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const request = doc.data();
                const tr = document.createElement('tr');
                
                // Format date
                const date = request.createdAt ? request.createdAt.toDate().toLocaleString('vi-VN') : 'N/A';
                
                tr.innerHTML = `
                    <td>${doc.id.substring(0, 8)}</td>
                    <td>${formatPrice(request.amount)}</td>
                    <td>${request.description || 'N/A'}</td>
                    <td>${date}</td>
                    <td><span class="status ${request.status}">${getStatusText(request.status)}</span></td>
                `;
                depositHistoryBody.appendChild(tr);
            });
        })
        .catch((error) => {
            console.error("Error loading deposit history:", error);
            // Fallback without ordering
            db.collection('deposit_requests')
                .where('userId', '==', userId)
                .get()
                .then((querySnapshot) => {
                    depositHistoryBody.innerHTML = '';
                    if (querySnapshot.empty) {
                        depositHistoryBody.innerHTML = '<tr><td colspan="5" class="loading-text">Không có lịch sử nộp tiền nào.</td></tr>';
                        return;
                    }
                    
                    const requests = [];
                    querySnapshot.forEach((doc) => {
                        requests.push({id: doc.id, ...doc.data()});
                    });
                    
                    // Sort manually by createdAt
                    requests.sort((a, b) => {
                        const dateA = a.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
                        const dateB = b.createdAt ? (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
                        return dateB - dateA;
                    });
                    
                    requests.forEach(request => {
                        const tr = document.createElement('tr');
                        let date = 'N/A';
                        if (request.createdAt && typeof request.createdAt.toDate === 'function') {
                            date = request.createdAt.toDate().toLocaleString('vi-VN');
                        } else if (request.createdAt) {
                            date = new Date(request.createdAt).toLocaleString('vi-VN');
                        }
                        
                        tr.innerHTML = `
                            <td>${request.id.substring(0, 8)}</td>
                            <td>${formatPrice(request.amount || 0)}</td>
                            <td>${request.description || 'N/A'}</td>
                            <td>${date}</td>
                            <td><span class="status ${request.status || 'pending'}">${getStatusText(request.status || 'pending')}</span></td>
                        `;
                        depositHistoryBody.appendChild(tr);
                    });
                })
                .catch((fallbackError) => {
                    console.error("Fallback error:", fallbackError);
                    depositHistoryBody.innerHTML = '<tr><td colspan="5" class="loading-text">Có lỗi xảy ra khi tải lịch sử nộp tiền</td></tr>';
                });
        });
}

// Load all transactions
function loadAllTransactions(userId) {
    const allTransactionsBody = document.getElementById('all-transactions-body');
    allTransactionsBody.innerHTML = '<tr><td colspan="6" class="loading-text">Đang tải dữ liệu...</td></tr>';

    db.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            allTransactionsBody.innerHTML = '';
            if (querySnapshot.empty) {
                allTransactionsBody.innerHTML = '<tr><td colspan="6" class="loading-text">Không có giao dịch nào.</td></tr>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const transaction = doc.data();
                const tr = document.createElement('tr');
                
                // Format date
                const date = transaction.createdAt ? transaction.createdAt.toDate().toLocaleString('vi-VN') : 'N/A';
                
                tr.innerHTML = `
                    <td>${doc.id.substring(0, 8)}</td>
                    <td>${getTransactionTypeText(transaction.type)}</td>
                    <td>${transaction.description || 'Giao dịch'}</td>
                    <td>${date}</td>
                    <td>${formatPrice(transaction.amount)}</td>
                    <td><span class="status ${transaction.status}">${getStatusText(transaction.status)}</span></td>
                `;
                allTransactionsBody.appendChild(tr);
            });
        })
        .catch((error) => {
            console.error("Error loading all transactions:", error);
            // Fallback without ordering
            db.collection('transactions')
                .where('userId', '==', userId)
                .get()
                .then((querySnapshot) => {
                    allTransactionsBody.innerHTML = '';
                    if (querySnapshot.empty) {
                        allTransactionsBody.innerHTML = '<tr><td colspan="6" class="loading-text">Không có giao dịch nào.</td></tr>';
                        return;
                    }
                    
                    const transactions = [];
                    querySnapshot.forEach((doc) => {
                        transactions.push({id: doc.id, ...doc.data()});
                    });
                    
                    // Sort manually by createdAt
                    transactions.sort((a, b) => {
                        const dateA = a.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
                        const dateB = b.createdAt ? (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
                        return dateB - dateA;
                    });
                    
                    transactions.forEach(transaction => {
                        const tr = document.createElement('tr');
                        let date = 'N/A';
                        if (transaction.createdAt && typeof transaction.createdAt.toDate === 'function') {
                            date = transaction.createdAt.toDate().toLocaleString('vi-VN');
                        } else if (transaction.createdAt) {
                            date = new Date(transaction.createdAt).toLocaleString('vi-VN');
                        }
                        
                        tr.innerHTML = `
                            <td>${transaction.id.substring(0, 8)}</td>
                            <td>${getTransactionTypeText(transaction.type)}</td>
                            <td>${transaction.description || 'Giao dịch'}</td>
                            <td>${date}</td>
                            <td>${formatPrice(transaction.amount || 0)}</td>
                            <td><span class="status ${transaction.status || 'pending'}">${getStatusText(transaction.status || 'pending')}</span></td>
                        `;
                        allTransactionsBody.appendChild(tr);
                    });
                })
                .catch((fallbackError) => {
                    console.error("Fallback error:", fallbackError);
                    allTransactionsBody.innerHTML = '<tr><td colspan="6" class="loading-text">Có lỗi xảy ra khi tải lịch sử giao dịch</td></tr>';
                });
        });
}

// Load orders count
function loadOrdersCount(userId) {
    db.collection('orders').where('userId', '==', userId).get()
        .then((querySnapshot) => {
            document.getElementById('orders-count').textContent = querySnapshot.size;
            
            // Also update products count
            const productCount = new Set();
            querySnapshot.forEach(doc => {
                const order = doc.data();
                if (order.productId) {
                    productCount.add(order.productId);
                }
            });
            document.getElementById('products-count').textContent = productCount.size;
        })
        .catch((error) => {
            console.error("Error loading orders count:", error);
        });
}

// Load orders (lịch sử mua hàng) - FIXED
function loadOrders(userId) {
    const ordersContainer = document.getElementById('orders-list');
    ordersContainer.innerHTML = '<p class="loading-text">Đang tải đơn hàng...</p>';

    db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            ordersContainer.innerHTML = '';
            if (querySnapshot.empty) {
                ordersContainer.innerHTML = '<p class="loading-text">Bạn chưa có đơn hàng nào.</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const order = doc.data();
                const orderCard = document.createElement('div');
                orderCard.classList.add('order-card');
                
                // Format date
                const date = order.createdAt ? order.createdAt.toDate().toLocaleString('vi-VN') : 'N/A';
                
                // Kiểm tra downloadUrl có tồn tại và hợp lệ không
                const hasValidDownloadUrl = order.downloadUrl && 
                                          order.downloadUrl.trim() !== '' && 
                                          order.downloadUrl.startsWith('http');
                
                orderCard.innerHTML = `
                    <div class="order-header">
                        <div class="order-title">${order.productName}</div>
                        <div class="order-date">${date}</div>
                    </div>
                    <div class="order-details">
                        <div class="order-price">${formatPrice(order.amount)}</div>
                        ${hasValidDownloadUrl ? 
                            `<button class="download-btn" data-download-url="${order.downloadUrl}">
                                <i class="fas fa-download"></i> Tải xuống
                            </button>` : 
                            '<span class="no-download">Liên kết tải xuống không khả dụng</span>'
                        }
                    </div>
                `;
                ordersContainer.appendChild(orderCard);

                // Add event listener to download button
                if (hasValidDownloadUrl) {
                    const downloadBtn = orderCard.querySelector('.download-btn');
                    downloadBtn.addEventListener('click', () => {
                        downloadProduct(order.downloadUrl, order.productName);
                    });
                }
            });
        })
        .catch((error) => {
            console.error("Error loading orders:", error);
            ordersContainer.innerHTML = '<p class="loading-text">Có lỗi xảy ra khi tải đơn hàng.</p>';
        });
}