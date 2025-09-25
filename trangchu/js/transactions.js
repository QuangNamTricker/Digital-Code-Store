// Load user transactions
function loadTransactions(userId) {
    const transactionsBody = document.getElementById('transactions-body');
    transactionsBody.innerHTML = '<tr><td colspan="5" class="loading-text">Đang tải dữ liệu...</td></tr>';

    db.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
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
                
                // Format date - Sử dụng trường 'date' thay vì 'createdAt'
                const date = transaction.date ? transaction.date.toDate().toLocaleString('vi-VN') : 'N/A';
                
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
                    
                    // Sort manually by date
                    transactions.sort((a, b) => {
                        const dateA = a.date ? (typeof a.date.toDate === 'function' ? a.date.toDate() : new Date(a.date)) : new Date(0);
                        const dateB = b.date ? (typeof b.date.toDate === 'function' ? b.date.toDate() : new Date(b.date)) : new Date(0);
                        return dateB - dateA;
                    }).slice(0, 5);
                    
                    transactions.forEach(transaction => {
                        const tr = document.createElement('tr');
                        let date = 'N/A';
                        if (transaction.date && typeof transaction.date.toDate === 'function') {
                            date = transaction.date.toDate().toLocaleString('vi-VN');
                        } else if (transaction.date) {
                            date = new Date(transaction.date).toLocaleString('vi-VN');
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
        .orderBy('date', 'desc')
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
                
                // Format date - Sử dụng trường 'date' thay vì 'createdAt'
                const date = transaction.date ? transaction.date.toDate().toLocaleString('vi-VN') : 'N/A';
                
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
                    
                    // Sort manually by date
                    transactions.sort((a, b) => {
                        const dateA = a.date ? (typeof a.date.toDate === 'function' ? a.date.toDate() : new Date(a.date)) : new Date(0);
                        const dateB = b.date ? (typeof b.date.toDate === 'function' ? b.date.toDate() : new Date(b.date)) : new Date(0);
                        return dateB - dateA;
                    });
                    
                    transactions.forEach(transaction => {
                        const tr = document.createElement('tr');
                        let date = 'N/A';
                        if (transaction.date && typeof transaction.date.toDate === 'function') {
                            date = transaction.date.toDate().toLocaleString('vi-VN');
                        } else if (transaction.date) {
                            date = new Date(transaction.date).toLocaleString('vi-VN');
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

// Load orders (lịch sử mua hàng) - ĐÃ SỬA HOÀN TOÀN
function loadOrders(userId) {
    console.log('🚀 Loading orders for user:', userId);
    const ordersContainer = document.getElementById('orders-list');
    ordersContainer.innerHTML = '<p class="loading-text">Đang tải đơn hàng...</p>';

    db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('purchaseDate', 'desc')
        .get()
        .then((querySnapshot) => {
            console.log('✅ Orders query result size:', querySnapshot.size);
            ordersContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                ordersContainer.innerHTML = '<p class="loading-text">Bạn chưa có đơn hàng nào.</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const order = doc.data();
                console.log('📦 Order found:', doc.id, order);
                
                const orderCard = document.createElement('div');
                orderCard.classList.add('order-card');
                
                // Format date - Sử dụng purchaseDate thay vì createdAt
                const date = order.purchaseDate ? 
                    order.purchaseDate.toDate().toLocaleString('vi-VN') : 
                    (order.createdAt ? order.createdAt.toDate().toLocaleString('vi-VN') : 'N/A');
                
                // Kiểm tra downloadUrl có tồn tại và hợp lệ không
                const hasValidDownloadUrl = order.downloadUrl && 
                                          order.downloadUrl.trim() !== '' && 
                                          order.downloadUrl.startsWith('http');
                
                // Sử dụng finalPrice nếu có, nếu không dùng amount
                const displayPrice = order.finalPrice || order.amount || 0;
                
                orderCard.innerHTML = `
                    <div class="order-header">
                        <div class="order-title">${order.productName || 'Sản phẩm không tên'}</div>
                        <div class="order-date">${date}</div>
                    </div>
                    <div class="order-details">
                        <div class="order-price">${formatPrice(displayPrice)}</div>
                        ${hasValidDownloadUrl ? 
                            `<button class="download-btn" data-download-url="${order.downloadUrl}">
                                <i class="fas fa-download"></i> Tải xuống
                            </button>` : 
                            '<span class="no-download">Liên kết tải xuống không khả dụng</span>'
                        }
                    </div>
                    ${order.couponCode ? 
                        `<div class="coupon-info" style="margin-top: 10px; font-size: 0.9em; color: #28a745;">
                            <i class="fas fa-tag"></i> Đã áp dụng mã: ${order.couponCode}
                        </div>` : ''
                    }
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
            console.error("❌ Error loading orders:", error);
            ordersContainer.innerHTML = '<p class="loading-text">Có lỗi xảy ra khi tải đơn hàng.</p>';
            
            // Thử fallback với createdAt nếu purchaseDate không hoạt động
            console.log('🔄 Trying fallback with createdAt...');
            db.collection('orders')
                .where('userId', '==', userId)
                .get()
                .then((querySnapshot) => {
                    ordersContainer.innerHTML = '';
                    if (querySnapshot.empty) {
                        ordersContainer.innerHTML = '<p class="loading-text">Bạn chưa có đơn hàng nào.</p>';
                        return;
                    }
                    
                    const orders = [];
                    querySnapshot.forEach((doc) => {
                        orders.push({id: doc.id, ...doc.data()});
                    });
                    
                    // Sort manually by purchaseDate or createdAt
                    orders.sort((a, b) => {
                        const dateA = a.purchaseDate ? 
                            (typeof a.purchaseDate.toDate === 'function' ? a.purchaseDate.toDate() : new Date(a.purchaseDate)) :
                            (a.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0));
                        
                        const dateB = b.purchaseDate ? 
                            (typeof b.purchaseDate.toDate === 'function' ? b.purchaseDate.toDate() : new Date(b.purchaseDate)) :
                            (b.createdAt ? (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0));
                        
                        return dateB - dateA;
                    });
                    
                    orders.forEach(order => {
                        const orderCard = document.createElement('div');
                        orderCard.classList.add('order-card');
                        
                        let date = 'N/A';
                        if (order.purchaseDate && typeof order.purchaseDate.toDate === 'function') {
                            date = order.purchaseDate.toDate().toLocaleString('vi-VN');
                        } else if (order.createdAt && typeof order.createdAt.toDate === 'function') {
                            date = order.createdAt.toDate().toLocaleString('vi-VN');
                        } else if (order.purchaseDate) {
                            date = new Date(order.purchaseDate).toLocaleString('vi-VN');
                        } else if (order.createdAt) {
                            date = new Date(order.createdAt).toLocaleString('vi-VN');
                        }
                        
                        const hasValidDownloadUrl = order.downloadUrl && 
                                                  order.downloadUrl.trim() !== '' && 
                                                  order.downloadUrl.startsWith('http');
                        
                        const displayPrice = order.finalPrice || order.amount || 0;
                        
                        orderCard.innerHTML = `
                            <div class="order-header">
                                <div class="order-title">${order.productName || 'Sản phẩm không tên'}</div>
                                <div class="order-date">${date}</div>
                            </div>
                            <div class="order-details">
                                <div class="order-price">${formatPrice(displayPrice)}</div>
                                ${hasValidDownloadUrl ? 
                                    `<button class="download-btn" data-download-url="${order.downloadUrl}">
                                        <i class="fas fa-download"></i> Tải xuống
                                    </button>` : 
                                    '<span class="no-download">Liên kết tải xuống không khả dụng</span>'
                                }
                            </div>
                        `;
                        ordersContainer.appendChild(orderCard);

                        if (hasValidDownloadUrl) {
                            const downloadBtn = orderCard.querySelector('.download-btn');
                            downloadBtn.addEventListener('click', () => {
                                downloadProduct(order.downloadUrl, order.productName);
                            });
                        }
                    });
                })
                .catch((fallbackError) => {
                    console.error("Fallback error:", fallbackError);
                    ordersContainer.innerHTML = '<p class="loading-text">Có lỗi xảy ra khi tải đơn hàng.</p>';
                });
        });
}

// Download product function
function downloadProduct(downloadUrl, productName) {
    console.log('📥 Downloading product:', productName, downloadUrl);
    showNotification('Đang chuẩn bị tải xuống...', 'info');
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = productName || 'download';
    
    // Simulate click to trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Đã bắt đầu tải xuống', 'success');
    
    // Log download activity
    if (currentUser) {
        db.collection('download_logs').add({
            userId: currentUser.uid,
            productName: productName,
            downloadUrl: downloadUrl,
            downloadedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.error('Error logging download:', error);
        });
    }
}