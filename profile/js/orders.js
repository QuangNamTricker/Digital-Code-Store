// Load user orders
function loadUserOrders(userId) {
    const ordersContainer = document.getElementById('orders-container');
    
    db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            ordersContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                ordersContainer.innerHTML = '<p>Bạn chưa có đơn hàng nào.</p>';
                document.getElementById('orders-count').textContent = '0';
                return;
            }
            
            let ordersCount = 0;
            let ordersHTML = `
                <table class="orders-table">
                    <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Sản phẩm</th>
                            <th>Ngày mua</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            querySnapshot.forEach((doc) => {
                ordersCount++;
                const order = doc.data();
                const orderId = doc.id;
                
                // Format date
                const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleDateString('vi-VN') : 'N/A';
                
                // Format price
                const totalPrice = order.totalPrice ? formatPrice(order.totalPrice) : 'N/A';
                
                // Determine status
                let statusClass = 'status-pending';
                let statusText = 'Đang xử lý';
                
                if (order.status === 'completed') {
                    statusClass = 'status-completed';
                    statusText = 'Hoàn thành';
                } else if (order.status === 'cancelled') {
                    statusClass = 'status-cancelled';
                    statusText = 'Đã hủy';
                }
                
                ordersHTML += `
                    <tr>
                        <td>#${orderId.substring(0, 8)}</td>
                        <td>${order.productName || 'N/A'}</td>
                        <td>${orderDate}</td>
                        <td>${totalPrice}</td>
                        <td><span class="status ${statusClass}">${statusText}</span></td>
                    </tr>
                `;
            });
            
            ordersHTML += `
                    </tbody>
                </table>
            `;
            
            ordersContainer.innerHTML = ordersHTML;
            document.getElementById('orders-count').textContent = ordersCount;
        })
        .catch((error) => {
            console.error("Error loading orders:", error);
            ordersContainer.innerHTML = '<p class="error-text">Có lỗi xảy ra khi tải đơn hàng.</p>';
        });
}

// Format price
function formatPrice(price) {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}