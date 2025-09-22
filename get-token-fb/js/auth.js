// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is signed in:", user.email);
        // Update user info if needed
    } else {
        console.log("User is signed out");
        // Redirect to login if not authenticated
        window.location.href = '../login/index.html';
    }
});