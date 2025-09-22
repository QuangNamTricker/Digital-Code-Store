// coupons.js
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
    applyDiscount(originalPrice) {
        if (!this.currentCoupon) return originalPrice;

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
                discountAmount: this.calculateDiscountAmount(0) // Lưu thông tin giảm giá
            });

            // Cập nhật số lần sử dụng
            await this.db.collection('coupons').doc(this.currentCoupon.id).update({
                usedCount: firebase.firestore.FieldValue.increment(1),
                lastUsedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.currentCoupon = null;

        } catch (error) {
            console.error('Lỗi khi đánh dấu mã đã sử dụng:', error);
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

// Khởi tạo coupon manager
const couponManager = new CouponManager();