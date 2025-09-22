// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Tải các phần của trang
    loadHeader();
    loadHero();
    loadFeatures();
    loadProductsSection();
    loadFooter();
    
    // Thiết lập bộ lọc danh mục
    setupCategoryFilters();
    
    // Thiết lập tìm kiếm
    setupSearch();
    
    // Thiết lập newsletter
    setupNewsletter();
});

// Tải header
function loadHeader() {
    fetch('partials/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        });
}

// Tải hero section
function loadHero() {
    fetch('partials/hero.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('hero-placeholder').innerHTML = data;
        });
}

// Tải features section
function loadFeatures() {
    fetch('partials/features.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('features-placeholder').innerHTML = data;
        });
}

// Tải products section
function loadProductsSection() {
    fetch('partials/products.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('products-placeholder').innerHTML = data;
            // Sau khi tải xong, load sản phẩm
            loadProducts();
        });
}

// Tải footer
function loadFooter() {
    fetch('partials/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
}