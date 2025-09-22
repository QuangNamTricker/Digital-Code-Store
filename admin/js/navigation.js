// navigation.js
// Menu navigation
const menuItems = document.querySelectorAll('.menu-item');
const pageContents = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        
        // Update active menu item
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding page
        pageContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${page}-page`).classList.add('active');
        
        // Load specific data for the page
        switch (page) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'users':
                loadUsers(document.getElementById('user-search').value);
                break;
            case 'transactions':
                loadTransactions(document.getElementById('transaction-search').value);
                break;
            case 'deposits':
                loadDepositRequests(document.getElementById('deposit-search').value);
                break;
            case 'stats':
                loadStatistics();
                break;
            case 'products':
                loadProductsManagement();
                break;
            case 'services':
                loadServicesManagement();
                break;
            case 'coupons':
                loadCouponsPage();
                break;
        }
    });
});

// Function to show specific section (for external calls)
function showSection(sectionId) {
    // Hide all sections
    pageContents.forEach(content => content.classList.remove('active'));
    
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    
    // Update menu items
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === sectionId.replace('-page', '')) {
            item.classList.add('active');
        }
    });
}

// Initialize navigation
function initNavigation() {
    console.log('Navigation initialized');
    
    // Load dashboard by default if no active page
    const activePage = document.querySelector('.content-section.active');
    if (!activePage) {
        showSection('dashboard-page');
        loadDashboard();
    }
}