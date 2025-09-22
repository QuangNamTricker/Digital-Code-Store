// products.js
let allProducts = [];
let allServices = [];
let couponManager = null;

// Khởi tạo coupon manager khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    couponManager = new CouponManager();
});

// Coupon Manager Class
class CouponManager {
    constructor() {
        this.db = firebase.firestore();
        this.currentCoupon = null;
    }

    // Kiểm tra mã giảm giá
    async validateCoupon(code, productId = null) {
        try {
            const couponDoc = await this.db.collection('coupons')
                .where('code', '==', code.toUpperCase())
                .where('isActive', '==', true)
                .get();

            if (couponDoc.empty) {
                throw new Error('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa');
            }

            const coupon = couponDoc.docs[0].data();
            const couponId = couponDoc.docs[0].id;

            // Kiểm tra ngày hết hạn
            if (coupon.expiryDate && coupon.expiryDate.toDate() < new Date()) {
                throw new Error('Mã giảm giá đã hết hạn');
            }

            // Kiểm tra số lần sử dụng
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                throw new Error('Mã giảm giá đã hết lượt sử dụng');
            }

            // Kiểm tra sản phẩm áp dụng (nếu có)
            if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
                if (!productId || !coupon.applicableProducts.includes(productId)) {
                    throw new Error('Mã giảm giá không áp dụng cho sản phẩm này');
                }
            }

            // Kiểm tra giá trị đơn hàng tối thiểu
            if (coupon.minOrderValue && coupon.minOrderValue > 0) {
                // Sẽ được kiểm tra khi áp dụng vào giá cụ thể
            }

            // Kiểm tra người dùng đã sử dụng chưa
            const usedCoupon = await this.db.collection('used_coupons')
                .where('userId', '==', auth.currentUser.uid)
                .where('couponId', '==', couponId)
                .get();

            if (!usedCoupon.empty && coupon.oneTimeUse) {
                throw new Error('Bạn đã sử dụng mã giảm giá này rồi');
            }

            this.currentCoupon = {
                id: couponId,
                ...coupon
            };

            return this.currentCoupon;

        } catch (error) {
            throw error;
        }
    }

    // Áp dụng mã giảm giá vào giá
    applyDiscount(originalPrice, minOrderValue = 0) {
        if (!this.currentCoupon) return originalPrice;

        // Kiểm tra giá trị đơn hàng tối thiểu
        if (this.currentCoupon.minOrderValue && originalPrice < this.currentCoupon.minOrderValue) {
            throw new Error(`Mã giảm giá yêu cầu đơn hàng tối thiểu ${formatPrice(this.currentCoupon.minOrderValue)}`);
        }

        let discountedPrice = originalPrice;

        if (this.currentCoupon.discountType === 'percentage') {
            // Giảm giá theo phần trăm
            discountedPrice = originalPrice * (1 - this.currentCoupon.discountValue / 100);
        } else if (this.currentCoupon.discountType === 'fixed') {
            // Giảm giá cố định
            discountedPrice = originalPrice - this.currentCoupon.discountValue;
        }

        // Đảm bảo giá không âm
        return Math.max(0, discountedPrice);
    }

    // Tính số tiền giảm
    calculateDiscountAmount(originalPrice) {
        if (!this.currentCoupon) return 0;

        let discountAmount = 0;

        if (this.currentCoupon.discountType === 'percentage') {
            discountAmount = originalPrice * (this.currentCoupon.discountValue / 100);
        } else if (this.currentCoupon.discountType === 'fixed') {
            discountAmount = this.currentCoupon.discountValue;
        }

        return Math.min(discountAmount, originalPrice);
    }

    // Đánh dấu mã đã sử dụng
    async markCouponAsUsed(orderId) {
        if (!this.currentCoupon) return;

        try {
            // Thêm vào used_coupons
            await this.db.collection('used_coupons').add({
                couponId: this.currentCoupon.id,
                userId: auth.currentUser.uid,
                orderId: orderId,
                usedAt: firebase.firestore.FieldValue.serverTimestamp(),
                discountAmount: this.calculateDiscountAmount(0),
                couponCode: this.currentCoupon.code
            });

            // Cập nhật số lần sử dụng
            await this.db.collection('coupons').doc(this.currentCoupon.id).update({
                usedCount: firebase.firestore.FieldValue.increment(1),
                lastUsedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.currentCoupon = null;

        } catch (error) {
            console.error('Lỗi khi đánh dấu mã đã sử dụng:', error);
            throw error;
        }
    }

    // Xóa mã hiện tại
    clearCoupon() {
        this.currentCoupon = null;
    }

    // Lấy thông tin mã hiện tại
    getCurrentCoupon() {
        return this.currentCoupon;
    }
}

// Load featured products
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products');
    featuredProductsContainer.innerHTML = '<p class="loading-text">Đang tải sản phẩm...</p>';

    db.collection('products').where('status', '==', 'active').where('isFeatured', '==', true).limit(4).get()
        .then((querySnapshot) => {
            featuredProductsContainer.innerHTML = '';
            if (querySnapshot.empty) {
                featuredProductsContainer.innerHTML = '<p class="loading-text">Không có sản phẩm nổi bật.</p>';
                return;
            }
            querySnapshot.forEach((doc) => {
                const product = { id: doc.id, ...doc.data() };
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.innerHTML = `
                    <div class="product-image" style="background-image: url('${product.imageUrl || 'https://via.placeholder.com/250x160?text=No+Image'}');"></div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description || ''}</p>
                        <div class="product-price">${formatPrice(product.price)}</div>
                        <button class="product-button" data-product-id="${doc.id}">Mua ngay</button>
                    </div>
                `;
                featuredProductsContainer.appendChild(productCard);

                // Add event listener to buy button
                productCard.querySelector('.product-button').addEventListener('click', () => {
                    showProductModal(product);
                });
            });
        })
        .catch((error) => {
            showNotification('Có lỗi xảy ra khi tải sản phẩm nổi bật', 'error');
            console.error("Error loading featured products:", error);
        });
}

// Load featured services
function loadFeaturedServices() {
    const featuredServicesContainer = document.getElementById('featured-services');
    featuredServicesContainer.innerHTML = '<p class="loading-text">Đang tải dịch vụ...</p>';

    db.collection('free_services').where('status', '==', 'active').where('isFeatured', '==', true).limit(4).get()
        .then((querySnapshot) => {
            featuredServicesContainer.innerHTML = '';
            if (querySnapshot.empty) {
                featuredServicesContainer.innerHTML = '<p class="loading-text">Không có dịch vụ nổi bật.</p>';
                return;
            }
            querySnapshot.forEach((doc) => {
                const service = { id: doc.id, ...doc.data() };
                const serviceCard = document.createElement('div');
                serviceCard.classList.add('product-card');
                serviceCard.innerHTML = `
                    <div class="product-image" style="background-image: url('${service.imageUrl || 'https://via.placeholder.com/250x160?text=No+Image'}');"></div>
                    <div class="product-info">
                        <h3>${service.name}</h3>
                        <p>${service.description || ''}</p>
                        <button class="service-button" data-service-url="${service.externalUrl}">Truy cập ngay</button>
                    </div>
                `;
                featuredServicesContainer.appendChild(serviceCard);

                // Add event listener to access button
                serviceCard.querySelector('.service-button').addEventListener('click', () => {
                    window.open(service.externalUrl, '_blank');
                });
            });
        })
        .catch((error) => {
            showNotification('Có lỗi xảy ra khi tải dịch vụ nổi bật', 'error');
            console.error("Error loading featured services:", error);
        });
}

// Load all products
function loadAllProducts() {
    const allProductsContainer = document.getElementById('all-products');
    allProductsContainer.innerHTML = '<p class="loading-text">Đang tải sản phẩm...</p>';

    db.collection('products').where('status', '==', 'active').get()
        .then((querySnapshot) => {
            allProductsContainer.innerHTML = '';
            if (querySnapshot.empty) {
                allProductsContainer.innerHTML = '<p class="loading-text">Không có sản phẩm nào.</p>';
                return;
            }
            
            allProducts = [];
            querySnapshot.forEach((doc) => {
                allProducts.push({ id: doc.id, ...doc.data() });
            });
            
            renderProducts(allProducts);
        })
        .catch((error) => {
            showNotification('Có lỗi xảy ra khi tải sản phẩm', 'error');
            console.error("Error loading all products:", error);
        });
}

// Load all services
function loadAllServices() {
    const allServicesContainer = document.getElementById('all-services');
    allServicesContainer.innerHTML = '<p class="loading-text">Đang tải dịch vụ...</p>';

    db.collection('free_services').where('status', '==', 'active').get()
        .then((querySnapshot) => {
            allServicesContainer.innerHTML = '';
            if (querySnapshot.empty) {
                allServicesContainer.innerHTML = '<p class="loading-text">Không có dịch vụ nào.</p>';
                return;
            }
            
            allServices = [];
            querySnapshot.forEach((doc) => {
                allServices.push({ id: doc.id, ...doc.data() });
            });
            
            renderServices(allServices);
        })
        .catch((error) => {
            showNotification('Có lỗi xảy ra khi tải dịch vụ', 'error');
            console.error("Error loading all services:", error);
        });
}

// Filter products based on search term
function filterProducts(searchTerm) {
    const allProductsContainer = document.getElementById('all-products');
    
    if (!allProducts.length) return;
    
    if (!searchTerm) {
        renderProducts(allProducts);
        return;
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    
    renderProducts(filteredProducts);
}

// Filter services based on search term
function filterServices(searchTerm) {
    const allServicesContainer = document.getElementById('all-services');
    
    if (!allServices.length) return;
    
    if (!searchTerm) {
        renderServices(allServices);
        return;
    }
    
    const filteredServices = allServices.filter(service => 
        service.name.toLowerCase().includes(searchTerm) || 
        (service.description && service.description.toLowerCase().includes(searchTerm))
    );
    
    renderServices(filteredServices);
}

// Render products to the container
function renderProducts(products) {
    const allProductsContainer = document.getElementById('all-products');
    
    if (products.length === 0) {
        allProductsContainer.innerHTML = '<p class="loading-text">Không tìm thấy sản phẩm nào.</p>';
        return;
    }
    
    allProductsContainer.innerHTML = '';
    
    products.forEach((product) => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <div class="product-image" style="background-image: url('${product.imageUrl || 'https://via.placeholder.com/250x160?text=No+Image'}');"></div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description || ''}</p>
                <div class="product-price">${formatPrice(product.price)}</div>
                <button class="product-button" data-product-id="${product.id}">Mua ngay</button>
            </div>
        `;
        allProductsContainer.appendChild(productCard);

        // Add event listener to buy button
        productCard.querySelector('.product-button').addEventListener('click', () => {
            showProductModal(product);
        });
    });
}

// Render services to the container
function renderServices(services) {
    const allServicesContainer = document.getElementById('all-services');
    
    if (services.length === 0) {
        allServicesContainer.innerHTML = '<p class="loading-text">Không tìm thấy dịch vụ nào.</p>';
        return;
    }
    
    allServicesContainer.innerHTML = '';
    
    services.forEach((service) => {
        const serviceCard = document.createElement('div');
        serviceCard.classList.add('product-card');
        serviceCard.innerHTML = `
            <div class="product-image" style="background-image: url('${service.imageUrl || 'https://via.placeholder.com/250x160?text=No+Image'}');"></div>
            <div class="product-info">
                <h3>${service.name}</h3>
                <p>${service.description || ''}</p>
                <button class="service-button" data-service-url="${service.externalUrl}">Truy cập ngay</button>
            </div>
        `;
        allServicesContainer.appendChild(serviceCard);

        // Add event listener to access button
        serviceCard.querySelector('.service-button').addEventListener('click', () => {
            window.open(service.externalUrl, '_blank');
        });
    });
}

// Show product modal with coupon functionality
function showProductModal(product) {
    // Tạo modal nếu chưa tồn tại
    let modal = document.getElementById('product-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const originalPrice = product.discountPrice || product.price;
    let finalPrice = originalPrice;
    let currentCoupon = null;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Mua sản phẩm</h3>
                <span class="close" onclick="closeProductModal()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="product-info-modal">
                    <h4>${product.name}</h4>
                    <p class="product-description">${product.description || ''}</p>
                    
                    <div class="price-section">
                        <span class="original-price">${formatPrice(product.price)}</span>
                        ${product.discountPrice ? 
                            `<span class="discount-price">${formatPrice(product.discountPrice)}</span>` : 
                            ''
                        }
                    </div>
                    
                    <!-- Phần mã giảm giá -->
                    <div class="coupon-section">
                        <div class="form-group">
                            <label for="coupon-code">Mã giảm giá (nếu có)</label>
                            <div class="coupon-input-group">
                                <input type="text" class="form-control" id="coupon-code" placeholder="Nhập mã giảm giá">
                                <button type="button" class="btn btn-secondary" id="apply-coupon">Áp dụng</button>
                            </div>
                            <div id="coupon-message" class="coupon-message"></div>
                        </div>
                    </div>

                    <div class="final-price-section">
                        <strong>Thành tiền: <span id="final-price">${formatPrice(originalPrice)}</span></strong>
                        <div id="discount-info" class="discount-info"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeProductModal()">Hủy</button>
                <button class="btn btn-primary" id="confirm-purchase">Xác nhận mua</button>
            </div>
        </div>
    `;

    modal.style.display = 'block';

    // Xử lý áp dụng mã giảm giá
    const couponCodeInput = document.getElementById('coupon-code');
    const applyCouponBtn = document.getElementById('apply-coupon');
    const couponMessage = document.getElementById('coupon-message');
    const finalPriceElement = document.getElementById('final-price');
    const discountInfoElement = document.getElementById('discount-info');
    const confirmPurchaseBtn = document.getElementById('confirm-purchase');

    applyCouponBtn.addEventListener('click', async () => {
        const code = couponCodeInput.value.trim();
        if (!code) {
            couponMessage.textContent = 'Vui lòng nhập mã giảm giá';
            couponMessage.className = 'coupon-message error';
            return;
        }

        try {
            currentCoupon = await couponManager.validateCoupon(code, product.id);
            finalPrice = couponManager.applyDiscount(originalPrice);
            const discountAmount = couponManager.calculateDiscountAmount(originalPrice);
            
            finalPriceElement.textContent = formatPrice(finalPrice);
            discountInfoElement.innerHTML = `
                <span class="discount-applied">✓ Đã áp dụng mã giảm giá: -${formatPrice(discountAmount)}</span>
            `;
            couponMessage.textContent = 'Áp dụng mã giảm giá thành công!';
            couponMessage.className = 'coupon-message success';
            
            // Cập nhật coupon manager
            couponManager.currentCoupon = currentCoupon;
            
        } catch (error) {
            couponMessage.textContent = error.message;
            couponMessage.className = 'coupon-message error';
            currentCoupon = null;
            finalPrice = originalPrice;
            finalPriceElement.textContent = formatPrice(finalPrice);
            discountInfoElement.innerHTML = '';
            couponManager.clearCoupon();
        }
    });

    // Xử lý xác nhận mua hàng
    confirmPurchaseBtn.addEventListener('click', () => {
        purchaseProduct(product, finalPrice, currentCoupon);
    });
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
        couponManager.clearCoupon();
    }
}

// Purchase product with coupon support
async function purchaseProduct(product, finalPrice, coupon = null) {
    try {
        if (!auth.currentUser) {
            showNotification('Vui lòng đăng nhập để mua hàng', 'error');
            closeProductModal();
            return;
        }

        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        const userData = userDoc.data();

        if (userData.balance < finalPrice) {
            showNotification('Số dư không đủ để mua sản phẩm này', 'error');
            return;
        }

        // Tạo đơn hàng
        const orderData = {
            productId: product.id,
            productName: product.name,
            userId: auth.currentUser.uid,
            userName: userData.name || userData.email,
            originalPrice: product.price,
            finalPrice: finalPrice,
            purchaseDate: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'completed',
            downloadUrl: product.downloadUrl || ''
        };

        // Thêm thông tin coupon nếu có
        if (coupon) {
            orderData.couponCode = coupon.code;
            orderData.couponId = coupon.id;
            orderData.discountAmount = (product.discountPrice || product.price) - finalPrice;
        }

        const orderRef = await db.collection('orders').add(orderData);

        // Tạo giao dịch
        const transactionData = {
            userId: auth.currentUser.uid,
            type: 'purchase',
            amount: -finalPrice,
            description: `Mua sản phẩm: ${product.name}`,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'completed',
            orderId: orderRef.id
        };

        if (coupon) {
            transactionData.couponCode = coupon.code;
            transactionData.discountAmount = orderData.discountAmount;
        }

        await db.collection('transactions').add(transactionData);

        // Cập nhật số dư user
        await db.collection('users').doc(auth.currentUser.uid).update({
            balance: firebase.firestore.FieldValue.increment(-finalPrice)
        });

        // Đánh dấu coupon đã sử dụng (nếu có)
        if (coupon) {
            try {
                await couponManager.markCouponAsUsed(orderRef.id);
            } catch (error) {
                console.error('Lỗi khi đánh dấu coupon:', error);
            }
        }

        showNotification('Mua hàng thành công!', 'success');
        closeProductModal();
        
        // Reload data
        loadUserData(auth.currentUser.uid);
        loadTransactions(auth.currentUser.uid);
        loadAllTransactions(auth.currentUser.uid);
        loadOrdersCount(auth.currentUser.uid);
        loadOrders(auth.currentUser.uid);
        loadFeaturedProducts();
        loadAllProducts();

    } catch (error) {
        console.error('Lỗi khi mua hàng:', error);
        showNotification('Có lỗi xảy ra khi mua hàng: ' + error.message, 'error');
    }
}

// Download product
function downloadProduct(downloadUrl, productName) {
    showNotification('Đang chuẩn bị tải xuống...', 'info');
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = productName || 'download';
    
    // Simulate click to trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Đã bắt đầu tải xuống', 'success');
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('product-modal');
    if (modal && event.target === modal) {
        closeProductModal();
    }
});