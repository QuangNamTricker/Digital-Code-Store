let allProducts = [];
let allServices = [];

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
                    purchaseProduct(doc.id, product);
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
            purchaseProduct(product.id, product);
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

// Purchase product
function purchaseProduct(productId, product) {
    if (userData.balance < product.price) {
        showNotification('Số dư không đủ để mua sản phẩm này', 'error');
        return;
    }

    // Create transaction record
    db.collection('transactions').add({
        userId: currentUser.uid,
        type: 'purchase',
        amount: product.price,
        description: `Mua sản phẩm: ${product.name}`,
        status: 'completed',
        productId: productId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // Deduct balance
        return db.collection('users').doc(currentUser.uid).update({
            balance: firebase.firestore.FieldValue.increment(-product.price)
        });
    }).then(() => {
        // Create order record - FIXED: Include downloadUrl from product
        return db.collection('orders').add({
            userId: currentUser.uid,
            productId: productId,
            productName: product.name,
            amount: product.price,
            status: 'completed',
            downloadUrl: product.downloadUrl || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).then(() => {
        showNotification('Mua sản phẩm thành công', 'success');
        // Reload user data and transactions
        loadUserData(currentUser.uid);
        loadTransactions(currentUser.uid);
        loadAllTransactions(currentUser.uid);
        loadOrdersCount(currentUser.uid);
        loadOrders(currentUser.uid);
    }).catch((error) => {
        showNotification('Có lỗi xảy ra khi mua sản phẩm', 'error');
        console.error("Error purchasing product:", error);
    });
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