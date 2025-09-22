// Hàm tải sản phẩm từ Firestore
function loadProducts(category = 'all') {
    const productsGrid = document.getElementById('products-container');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '<p class="loading-text">Đang tải sản phẩm...</p>';
    
    let productsQuery = db.collection('products').where('status', '==', 'active');
    
    if (category !== 'all') {
        productsQuery = productsQuery.where('category', '==', category);
    }
    
    productsQuery.get()
        .then((querySnapshot) => {
            productsGrid.innerHTML = '';
            
            if (querySnapshot.empty) {
                productsGrid.innerHTML = '<p class="no-products">Chưa có sản phẩm nào.</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const productId = doc.id;
                
                const productCard = `
                    <div class="product-card" data-category="${product.category || 'tool'}">
                        <div class="product-image" style="background-image: url('${product.imageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}')"></div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <div class="product-price">${formatPrice(product.price)}</div>
                            <button class="product-button" onclick="addToCart('${productId}')">
                                <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                `;
                
                productsGrid.innerHTML += productCard;
            });
        })
        .catch((error) => {
            productsGrid.innerHTML = '<p class="error-text">Có lỗi xảy ra khi tải sản phẩm.</p>';
            console.error("Error loading products: ", error);
        });
}

// Hàm định dạng giá tiền
function formatPrice(price) {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Lọc sản phẩm theo danh mục
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xóa class active từ tất cả các nút
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Thêm class active cho nút được click
            this.classList.add('active');
            
            // Lọc sản phẩm theo danh mục
            const category = this.getAttribute('data-category');
            loadProducts(category);
        });
    });
}