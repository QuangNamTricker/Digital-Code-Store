
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyA7kY_xl-B1r6pfRlUCVcI8OcLe7rOh11g",
            authDomain: "digitalcodestore-tuquangnam.firebaseapp.com",
            projectId: "digitalcodestore-tuquangnam",
            storageBucket: "digitalcodestore-tuquangnam.firebasestorage.app",
            messagingSenderId: "226534281162",
            appId: "1:226534281162:web:9e734c1b07378efb280933",
            measurementId: "G-9V4G42XSZS"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Check authentication state
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                console.log("User is signed in:", user.email);
                // You can update UI here if needed
            } else {
                // User is signed out
                console.log("User is signed out");
            }
        });

        // Hàm tải sản phẩm từ Firestore
        function loadProducts() {
            const productsGrid = document.getElementById('products-container');
            if (!productsGrid) return;
            
            productsGrid.innerHTML = '<p class="loading-text">Đang tải sản phẩm...</p>';
            
            db.collection('products')
                .where('status', '==', 'active')
                .get()
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
                            <div class="product-card">
                                <div class="product-image" style="background-image: url('${product.imageUrl || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}')"></div>
                                <div class="product-info">
                                    <h3>${product.name}</h3>
                                    <p>${product.description}</p>
                                    <div class="product-price">${formatPrice(product.price)}</div>
                                    <button class="product-button" onclick="addToCart('${productId}')">Thêm vào giỏ</button>
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

        // Hàm thêm vào giỏ hàng (tạm thời chỉ hiển thị thông báo)
        function addToCart(productId) {
            alert('Sản phẩm đã được thêm vào giỏ hàng!');
            // Có thể phát triển thêm chức năng giỏ hàng sau này
        }

        // Gọi hàm khi trang load
        document.addEventListener('DOMContentLoaded', function() {
            // Tải sản phẩm
            loadProducts();
        });
    