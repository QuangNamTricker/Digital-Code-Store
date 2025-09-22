// Tìm kiếm sản phẩm
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    const performSearch = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm) {
            const productsGrid = document.getElementById('products-container');
            productsGrid.innerHTML = '<p class="loading-text">Đang tìm kiếm...</p>';
            
            db.collection('products')
                .where('status', '==', 'active')
                .get()
                .then((querySnapshot) => {
                    productsGrid.innerHTML = '';
                    let foundProducts = false;
                    
                    querySnapshot.forEach((doc) => {
                        const product = doc.data();
                        const productId = doc.id;
                        
                        // Tìm kiếm theo tên và mô tả
                        if (product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm)) {
                            foundProducts = true;
                            
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
                        }
                    });
                    
                    if (!foundProducts) {
                        productsGrid.innerHTML = '<p class="no-products">Không tìm thấy sản phẩm phù hợp.</p>';
                    }
                })
                .catch((error) => {
                    productsGrid.innerHTML = '<p class="error-text">Có lỗi xảy ra khi tìm kiếm.</p>';
                    console.error("Error searching products: ", error);
                });
        }
    };
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Đăng ký nhận tin
function setupNewsletter() {
    const newsletterButton = document.getElementById('newsletter-button');
    
    if (newsletterButton) {
        newsletterButton.addEventListener('click', function() {
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput.value.trim();
            
            if (email) {
                // Lưu email vào Firestore
                db.collection('newsletter').add({
                    email: email,
                    subscribedAt: new Date()
                })
                .then(() => {
                    alert('Cảm ơn bạn đã đăng ký nhận tin!');
                    emailInput.value = '';
                })
                .catch((error) => {
                    console.error("Error saving email: ", error);
                    alert('Có lỗi xảy ra, vui lòng thử lại sau.');
                });
            } else {
                alert('Vui lòng nhập địa chỉ email.');
            }
        });
    }
}