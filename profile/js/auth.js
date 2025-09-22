// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log("User is signed in:", user);
        document.getElementById('profile-name').textContent = user.displayName || user.email;
        document.getElementById('profile-email').textContent = user.email;
        
        // Update avatar with user's photo or initials
        if (user.photoURL) {
            document.getElementById('profile-avatar').src = user.photoURL;
        } else {
            const name = user.displayName || user.email;
            document.getElementById('profile-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3498db&color=fff`;
        }
        
        // Load user data from Firestore
        loadUserData(user.uid);
    } else {
        // User is signed out, redirect to login
        window.location.href = '../login/index.html';
    }
});

// Handle logout
function handleLogout() {
    auth.signOut().then(() => {
        window.location.href = '../index.html';
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}