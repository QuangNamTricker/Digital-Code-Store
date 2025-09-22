// DOM Elements
const productsTable = document.getElementById('products-table');
const addProductBtn = document.getElementById('add-product-btn');

// Load products management
function loadProductsManagement() {
    const tbody = productsTable.querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="7">Đang tải dữ liệu...</td></tr>';

    db.collection('products').orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            tbody.innerHTML = '';
            if (querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="7">Không có sản phẩm nào.</td></tr>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const productId = doc.id;
                
                const productRow = `
                    <tr>
                        <td><img src="${product.imageUrl || 'https://via.placeholder.com/50x50?text=No+Image'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                        <td>${product.name}</td>
                        <td>${product.description || 'N/A'}</td>
                        <td>${formatPrice(product.price)}</td>
                        <td>${product.isFeatured ? 'Có' : 'Không'}</td>
                        <td><span class="status ${product.status}">${product.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}</span></td>
                        <td>
                            <button class="action-btn btn-edit" onclick="editProduct('${productId}')">Sửa</button>
                            <button class="action-btn btn-ban" onclick="toggleProductStatus('${productId}', '${product.status}')">
                                ${product.status === 'active' ? 'Ẩn' : 'Hiện'}
                            </button>
                            <button class="action-btn btn-delete" onclick="deleteProduct('${productId}', '${product.name}')">
                                Xóa
                            </button>
                        </td>
                    </tr>
                `;
                
                tbody.innerHTML += productRow;
            });
        })
        .catch((error) => {
            console.error("Error loading products:", error);
            tbody.innerHTML = '<tr><td colspan="7">Có lỗi xảy ra khi tải danh sách sản phẩm.</td></tr>';
        });
}

// Add product
function addProduct() {
    document.getElementById('product-modal-title').textContent = 'Thêm sản phẩm mới';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-status').value = 'active';
    document.getElementById('product-isFeatured').value = 'false';
    document.getElementById('product-modal').style.display = 'flex';
}

// Toggle product status
function toggleProductStatus(productId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    db.collection('products').doc(productId).update({
        status: newStatus
    })
    .then(() => {
        showNotification('Thành công', `Đã ${newStatus === 'active' ? 'kích hoạt' : 'ẩn'} sản phẩm thành công`, 'success');
        loadProductsManagement();
    })
    .catch((error) => {
        console.error("Error updating product status:", error);
        showNotification('Lỗi', 'Không thể cập nhật trạng thái sản phẩm', 'error');
    });
}

// Delete product
function deleteProduct(productId, productName) {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
        db.collection('products').doc(productId).delete()
        .then(() => {
            showNotification('Thành công', 'Đã xóa sản phẩm thành công', 'success');
            loadProductsManagement();
        })
        .catch((error) => {
            console.error("Error deleting product:", error);
            showNotification('Lỗi', 'Không thể xóa sản phẩm', 'error');
        });
    }
}

// Add product button
addProductBtn.addEventListener('click', addProduct);

// Make functions global for onclick attributes
window.toggleProductStatus = toggleProductStatus;
window.deleteProduct = deleteProduct;