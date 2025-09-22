// Hàm thêm vào giỏ hàng
function addToCart(productId) {
    // Hiển thị thông báo
    const notification = document.getElementById('cart-notification');
    notification.classList.add('show');
    
    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
    
    // Lưu vào localStorage (tạm thời)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1,
            addedAt: new Date().getTime()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
}