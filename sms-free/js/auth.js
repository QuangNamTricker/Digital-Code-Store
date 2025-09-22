// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is signed in:", user.email);
        
        // Log tool access
        db.collection('tool_access').add({
            userId: user.uid,
            tool: 'receive_sms',
            accessedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.error("Error logging tool access:", error);
        });
    } else {
        console.log("User is signed out");
        // Redirect to login if not authenticated
        window.location.href = '../login/index.html';
    }
});