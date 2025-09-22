// Show notification
function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon} notification-icon"></i>
        <div class="notification-content">
            <div class="notification-title">${type === 'success' ? 'Thành công' : 'Lỗi'}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="close-notification">&times;</button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Close notification on button click
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 500);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, 5000);
}