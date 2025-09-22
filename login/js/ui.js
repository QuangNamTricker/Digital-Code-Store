// Tab functionality
function initTabs() {
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            // Show the corresponding tab pane
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
    
    // Switch between login and register
    document.getElementById('go-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('[data-tab="register"]').click();
    });
    
    document.getElementById('go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('[data-tab="login"]').click();
    });
}

// Forgot password modal
function initForgotPasswordModal() {
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const closeModal = document.querySelector('.close-modal');
    
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
    });
    
    closeModal.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    });
}

// Check if URL has #register hash and switch to register tab
function checkUrlHash() {
    if (window.location.hash === '#register') {
        document.querySelector('[data-tab="register"]').click();
    }
}

// Initialize all UI components
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initForgotPasswordModal();
    checkUrlHash();
});