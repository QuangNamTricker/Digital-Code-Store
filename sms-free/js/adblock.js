// Adblock functionality
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        /* CSS để ẩn quảng cáo - chỉ hoạt động nếu iframe cùng origin */
        .ads, .ad, .advertisement, [id*='ad'], [class*='ad'] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
        }
    `;
    document.head.appendChild(style);

    // Iframe load event
    document.getElementById('smsFrame').onload = function() {
        console.log("Iframe đã tải. Sử dụng CSS để ẩn quảng cáo.");
        
        // Thử áp dụng CSS vào iframe (chỉ hoạt động nếu cùng origin)
        try {
            const iframeDoc = this.contentDocument || this.contentWindow.document;
            const iframeStyle = iframeDoc.createElement('style');
            iframeStyle.textContent = `
                .ads, .ad, .advertisement, [id*='ad'], [class*='ad'] {
                    display: none !important;
                    visibility: hidden !important;
                    height: 0 !important;
                    width: 0 !important;
                }
            `;
            iframeDoc.head.appendChild(iframeStyle);
        } catch (e) {
            console.log("Không thể truy cập vào nội dung iframe (khác origin). Sử dụng extension để chặn quảng cáo.");
        }
    };
});