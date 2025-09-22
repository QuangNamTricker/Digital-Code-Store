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
                        <td>${getTransactionTypeText(transaction.type)}</td>
                        <td>${transaction.description || 'N/A'}</td>
                    </tr>
                `;
                
                tbody.innerHTML += activityRow;
            });
        }).catch((error) => {
            console.error("Error loading recent activities:", error);
        });
}