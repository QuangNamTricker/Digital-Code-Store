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