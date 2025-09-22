// coupons.js
class CouponManager {
    constructor() {
        this.db = firebase.firestore();
        this.products = [];
    }

    // Tải danh sách coupon
    async loadCoupons() {
        try {
            const querySnapshot = await this.db.collection('coupons')
                .orderBy('createdAt', 'desc')
                .get();
            
            const coupons = [];
            querySnapshot.forEach(doc => {
                coupons.push({ id: doc.id, ...doc.data() });
            });
            
            this.renderCoupons(coupons);
        } catch (error) {
            console.error('Lỗi khi tải coupon:', error);
            showNotification('Có lỗi xảy ra khi tải mã giảm giá', 'error');
        }
    }

    // Tải danh sách sản phẩm cho dropdown
    async loadProductsForDropdown() {
        try {
            const querySnapshot = await this.db.collection('products')
                .where('status', '==', 'active')
                .get();
            
            this.products = [];
            querySnapshot.forEach(doc => {
                this.products.push({ id: doc.id, ...doc.data() });
            });
            
            this.renderProductDropdown();
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
        }
    }

    // Render dropdown sản phẩm
    renderProductDropdown() {
        const dropdown = document.getElementById('coupon-applicableProducts');
        if (!dropdown) return;
        
        dropdown.innerHTML = '';
        this.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - ${formatPrice(product.price)}`;
            dropdown.appendChild(option);
        });
    }

    // Render bảng coupon
    renderCoupons(coupons) {
        const tbody = document.querySelector('#coupons-table tbody');
        if (!tbody) return;
        
        if (coupons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Chưa có mã giảm giá nào</td></tr>';
            return;
        }
        
        tbody.innerHTML = coupons.map(coupon => `
            <tr>
                <td>
                    <strong>${coupon.code}</strong>
                    ${coupon.isFeatured ? '<span class="badge badge-primary">Nổi bật</span>' : ''}
                </td>
                <td>${coupon.description || 'Không có mô tả'}</td>
                <td>
                    <span class="badge ${coupon.discountType === 'percentage' ? 'badge-success' : 'badge-info'}">
                        ${coupon.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}
                    </span>
                </td>
                <td>
                    ${coupon.discountType === 'percentage' ? 
                        `${coupon.discountValue}%` : 
                        formatPrice(coupon.discountValue)
                    }
                </td>
                <td>
                    ${coupon.expiryDate ? 
                        new Date(coupon.expiryDate.toDate()).toLocaleDateString('vi-VN') : 
                        '<em>Không hết hạn</em>'
                    }
                </td>
                <td>${coupon.usedCount || 0}/${coupon.usageLimit || '∞'}</td>
                <td>
                    <span class="badge ${coupon.isActive ? 'badge-success' : 'badge-secondary'}">
                        ${coupon.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary edit-coupon" data-id="${coupon.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-coupon" data-id="${coupon.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${coupon.isActive ? 
                        `<button class="btn btn-sm btn-warning disable-coupon" data-id="${coupon.id}">
                            <i class="fas fa-ban"></i>
                        </button>` :
                        `<button class="btn btn-sm btn-success enable-coupon" data-id="${coupon.id}">
                            <i class="fas fa-check"></i>
                        </button>`
                    }
                </td>
            </tr>
        `).join('');
        
        this.attachCouponEventListeners();
    }

    // Gắn event listeners cho các nút
    attachCouponEventListeners() {
        // Edit
        document.querySelectorAll('.edit-coupon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const couponId = e.target.closest('button').dataset.id;
                this.editCoupon(couponId);
            });
        });
        
        // Delete
        document.querySelectorAll('.delete-coupon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const couponId = e.target.closest('button').dataset.id;
                this.deleteCoupon(couponId);
            });
        });
        
        // Enable/Disable
        document.querySelectorAll('.enable-coupon, .disable-coupon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const couponId = e.target.closest('button').dataset.id;
                const action = e.target.closest('button').classList.contains('enable-coupon') ? 'enable' : 'disable';
                this.toggleCouponStatus(couponId, action);
            });
        });
    }

    // Mở modal tạo coupon mới
    openAddCouponModal() {
        const modal = document.getElementById('coupon-modal');
        const form = document.getElementById('coupon-form');
        const title = document.getElementById('coupon-modal-title');
        
        title.textContent = 'Tạo mã giảm giá mới';
        form.reset();
        document.getElementById('coupon-id').value = '';
        document.getElementById('coupon-code').value = this.generateCouponCode();
        
        // Đặt giá trị mặc định
        document.getElementById('coupon-usageLimit').value = '100';
        document.getElementById('coupon-oneTimeUse').value = 'true';
        document.getElementById('coupon-isActive').value = 'true';
        document.getElementById('coupon-minOrderValue').value = '0';
        
        modal.style.display = 'block';
    }

    // Tạo mã coupon ngẫu nhiên
    generateCouponCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Chỉnh sửa coupon
    async editCoupon(couponId) {
        try {
            const doc = await this.db.collection('coupons').doc(couponId).get();
            if (!doc.exists) {
                showNotification('Mã giảm giá không tồn tại', 'error');
                return;
            }
            
            const coupon = doc.data();
            const modal = document.getElementById('coupon-modal');
            const form = document.getElementById('coupon-form');
            const title = document.getElementById('coupon-modal-title');
            
            title.textContent = 'Chỉnh sửa mã giảm giá';
            form.reset();
            
            // Điền dữ liệu vào form
            document.getElementById('coupon-id').value = couponId;
            document.getElementById('coupon-code').value = coupon.code;
            document.getElementById('coupon-description').value = coupon.description || '';
            document.getElementById('coupon-discountType').value = coupon.discountType;
            document.getElementById('coupon-discountValue').value = coupon.discountValue;
            document.getElementById('coupon-minOrderValue').value = coupon.minOrderValue || 0;
            document.getElementById('coupon-usageLimit').value = coupon.usageLimit || '';
            document.getElementById('coupon-oneTimeUse').value = coupon.oneTimeUse ? 'true' : 'false';
            document.getElementById('coupon-isActive').value = coupon.isActive ? 'true' : 'false';
            
            // Xử lý expiry date
            if (coupon.expiryDate) {
                const expiryDate = coupon.expiryDate.toDate();
                const localDateTime = expiryDate.toISOString().slice(0, 16);
                document.getElementById('coupon-expiryDate').value = localDateTime;
            }
            
            // Xử lý sản phẩm áp dụng
            const productsDropdown = document.getElementById('coupon-applicableProducts');
            if (productsDropdown && coupon.applicableProducts) {
                Array.from(productsDropdown.options).forEach(option => {
                    option.selected = coupon.applicableProducts.includes(option.value);
                });
            }
            
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('Lỗi khi chỉnh sửa coupon:', error);
            showNotification('Có lỗi xảy ra khi tải thông tin coupon', 'error');
        }
    }

    // Xóa coupon
    async deleteCoupon(couponId) {
        if (!confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
        
        try {
            await this.db.collection('coupons').doc(couponId).delete();
            showNotification('Xóa mã giảm giá thành công', 'success');
            this.loadCoupons();
        } catch (error) {
            console.error('Lỗi khi xóa coupon:', error);
            showNotification('Có lỗi xảy ra khi xóa coupon', 'error');
        }
    }

    // Bật/tắt coupon
    async toggleCouponStatus(couponId, action) {
        try {
            await this.db.collection('coupons').doc(couponId).update({
                isActive: action === 'enable'
            });
            
            showNotification(`Đã ${action === 'enable' ? 'kích hoạt' : 'vô hiệu hóa'} mã giảm giá`, 'success');
            this.loadCoupons();
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái coupon:', error);
            showNotification('Có lỗi xảy ra khi thay đổi trạng thái', 'error');
        }
    }

    // Xử lý submit form
    async handleCouponSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const couponId = document.getElementById('coupon-id').value;
        const isEdit = !!couponId;
        
        try {
            const couponData = {
                code: document.getElementById('coupon-code').value.toUpperCase().trim(),
                description: document.getElementById('coupon-description').value.trim(),
                discountType: document.getElementById('coupon-discountType').value,
                discountValue: parseFloat(document.getElementById('coupon-discountValue').value),
                minOrderValue: parseFloat(document.getElementById('coupon-minOrderValue').value) || 0,
                usageLimit: document.getElementById('coupon-usageLimit').value ? 
                    parseInt(document.getElementById('coupon-usageLimit').value) : null,
                oneTimeUse: document.getElementById('coupon-oneTimeUse').value === 'true',
                isActive: document.getElementById('coupon-isActive').value === 'true',
                applicableProducts: Array.from(document.getElementById('coupon-applicableProducts').selectedOptions)
                    .map(option => option.value),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Xử lý expiry date
            const expiryDate = document.getElementById('coupon-expiryDate').value;
            if (expiryDate) {
                couponData.expiryDate = firebase.firestore.Timestamp.fromDate(new Date(expiryDate));
            } else {
                couponData.expiryDate = null;
            }
            
            // Validation
            if (!couponData.code) {
                throw new Error('Vui lòng nhập mã giảm giá');
            }
            
            if (couponData.discountType === 'percentage' && couponData.discountValue > 100) {
                throw new Error('Giảm giá phần trăm không thể vượt quá 100%');
            }
            
            if (couponData.discountValue <= 0) {
                throw new Error('Giá trị giảm giá phải lớn hơn 0');
            }
            
            if (isEdit) {
                // Cập nhật coupon
                await this.db.collection('coupons').doc(couponId).update(couponData);
                showNotification('Cập nhật mã giảm giá thành công', 'success');
            } else {
                // Kiểm tra mã trùng
                const existingCoupon = await this.db.collection('coupons')
                    .where('code', '==', couponData.code)
                    .get();
                
                if (!existingCoupon.empty) {
                    throw new Error('Mã giảm giá đã tồn tại');
                }
                
                // Tạo coupon mới
                couponData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                couponData.usedCount = 0;
                await this.db.collection('coupons').add(couponData);
                showNotification('Tạo mã giảm giá thành công', 'success');
            }
            
            // Đóng modal và reload data
            document.getElementById('coupon-modal').style.display = 'none';
            this.loadCoupons();
            
        } catch (error) {
            console.error('Lỗi khi lưu coupon:', error);
            showNotification(error.message || 'Có lỗi xảy ra khi lưu mã giảm giá', 'error');
        }
    }

    // Khởi tạo
    init() {
        // Gắn event listeners
        const addCouponBtn = document.getElementById('add-coupon-btn');
        const couponForm = document.getElementById('coupon-form');
        const discountTypeSelect = document.getElementById('coupon-discountType');
        
        if (addCouponBtn) {
            addCouponBtn.addEventListener('click', () => {
                this.openAddCouponModal();
            });
        }
        
        if (couponForm) {
            couponForm.addEventListener('submit', (e) => {
                this.handleCouponSubmit(e);
            });
        }
        
        if (discountTypeSelect) {
            discountTypeSelect.addEventListener('change', (e) => {
                const discountValueInput = document.getElementById('coupon-discountValue');
                if (e.target.value === 'percentage') {
                    discountValueInput.placeholder = '10 (10%)';
                    discountValueInput.step = '1';
                } else {
                    discountValueInput.placeholder = '10000 (10,000 VNĐ)';
                    discountValueInput.step = '1000';
                }
            });
        }
        
        console.log('Coupon manager initialized');
    }
}

// Global coupon manager instance
let couponManager = null;

// Function to load coupons page
function loadCouponsPage() {
    if (!couponManager) {
        couponManager = new CouponManager();
        couponManager.init();
    }
    
    couponManager.loadCoupons();
    couponManager.loadProductsForDropdown();
}

// Make function globally available
window.loadCouponsPage = loadCouponsPage;