    // Load admin statistics
function loadAdminStats() {
    // Load total users
    db.collection('users').get()
        .then((querySnapshot) => {
            document.getElementById('total-users').textContent = querySnapshot.size;
        })
        .catch((error) => {
            console.error("Error loading total users:", error);
        });

    // Load total orders
    db.collection('orders').get()
        .then((querySnapshot) => {
            document.getElementById('total-orders').textContent = querySnapshot.size;
        })
        .catch((error) => {
            console.error("Error loading total orders:", error);
        });

    // Load total revenue
    db.collection('transactions')
        .where('type', 'in', ['purchase', 'deposit'])
        .where('status', '==', 'completed')
        .get()
        .then((querySnapshot) => {
            let totalRevenue = 0;
            querySnapshot.forEach((doc) => {
                const transaction = doc.data();
                if (transaction.type === 'purchase') {
                    totalRevenue += transaction.amount;
                }
            });
            document.getElementById('total-revenue').textContent = formatPrice(totalRevenue);
        })
        .catch((error) => {
            console.error("Error loading total revenue:", error);
        });

    // Load pending deposits
    db.collection('deposit_requests')
        .where('status', '==', 'pending')
        .get()
        .then((querySnapshot) => {
            document.getElementById('pending-deposits').textContent = querySnapshot.size;
        })
        .catch((error) => {
            console.error("Error loading pending deposits:", error);
        });
}