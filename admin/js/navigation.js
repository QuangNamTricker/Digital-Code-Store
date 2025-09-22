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
        if (page === 'users') {
            loadUsers(document.getElementById('user-search').value);
        } else if (page === 'transactions') {
            loadTransactions(document.getElementById('transaction-search').value);
        } else if (page === 'deposits') {
            loadDepositRequests(document.getElementById('deposit-search').value);
        } else if (page === 'stats') {
            loadStatistics();
        } else if (page === 'products') {
            loadProductsManagement();
        } else if (page === 'services') {
            loadServicesManagement();
        }
    });
});