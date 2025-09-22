// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log("User is signed in:", user.email);
        // Update auth buttons
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <button class="btn btn-outline" onclick="firebase.auth().signOut()">
                    <i class="fas fa-sign-out-alt"></i> Đăng xuất
                </button>
                <button class="btn btn-primary" onclick="window.location.href='../profile/index.html'">
                    <i class="fas fa-user"></i> ${user.email}
                </button>
            `;
        }
    } else {
        // User is signed out
        console.log("User is signed out");
    }
});