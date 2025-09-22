// Load user products
function loadUserProducts(userId) {
    const productsContainer = document.getElementById('products-container');
    
    // In a real app, you would query the products that the user has purchased
    // For now, we'll simulate it by showing some products
    db.collection('products')
        .where('status', '==', 'active')
        .limit(3)
        .get()
        .then((querySnapshot) => {
            productsContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                productsContainer.innerHTML = '<p>Bạn chưa mua sản phẩm nào.</p>';
                document.getElementById('products-count').textContent = '0';
                return;
            }
            
            let productsCount = 0;
            let productsHTML = '<div class="products-grid">';
            
            querySnapshot.forEach((doc) => {
                productsCount++;
                const product = doc.data();
                const productId = doc.id;
                
                productsHTML += `
                    <div class="product-card">
                        <div class="product-image" style="background-image: url('${product.imageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}')"></div>
                        <div class="product-info">
                            <h4 class="product-name">${product.name}</h4>
                            <div class="product-price">${formatPrice(product.price)}</div>
                            <button class="btn btn-primary" style="width: 100%;" onclick="downloadProduct('${productId}')">
                                <i class="fas fa-download"></i> Tải xuống
                            </button>
                        </div>
                    </div>
                `;
            });
            
            productsHTML += '</div>';
            productsContainer.innerHTML = productsHTML;
            document.getElementById('products-count').textContent = productsCount;
        })
        .catch((error) => {
            console.error("Error loading products:", error);
            productsContainer.innerHTML = '<p class="error-text">Có lỗi xảy ra khi tải sản phẩm.</p>';
        });
}

// Download product
function downloadProduct(productId) {
    const user = auth.currentUser;
    if (!user) return;
    
    // Check if user has purchased this product
    db.collection('orders')
        .where('userId', '==', user.uid)
        .where('productId', '==', productId)
        .where('status', '==', 'completed')
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                // User has purchased this product, get download URL
                db.collection('products').doc(productId).get()
                    .then((doc) => {
                        if (doc.exists) {
                            const product = doc.data();
                            if (product.downloadUrl) {
                                window.open(product.downloadUrl, '_blank');
                            } else {
                                alert('Sản phẩm không có liên kết tải xuống.');
                            }
                        }
                    })
                    .catch((error) => {
                        console.error("Error getting product:", error);
                        alert('Có lỗi xảy ra khi tải sản phẩm.');
                    });
            } else {
                alert('Bạn cần mua sản phẩm này trước khi tải xuống.');
            }
        })
        .catch((error) => {
            console.error("Error checking purchase:", error);
            alert('Có lỗi xảy ra khi kiểm tra quyền tải xuống.');
        });
}