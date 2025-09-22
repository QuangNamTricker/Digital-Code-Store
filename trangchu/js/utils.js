// Utility functions
function formatPrice(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function getStatusText(status) {
    switch(status) {
        case 'completed': return 'Hoàn thành';
        case 'pending': return 'Chờ xử lý';
        case 'failed': return 'Thất bại';
        case 'approved': return 'Đã duyệt';
        case 'rejected': return 'Từ chối';
        default: return status;
    }
}

function getTransactionTypeText(type) {
    switch(type) {
        case 'purchase': return 'Mua hàng';
        case 'deposit': return 'Nạp tiền';
        case 'admin_add': return 'Admin cộng tiền';
        default: return type;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="close-notification">&times;</button>
    `;

    // Close button event
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });

    notificationContainer.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}