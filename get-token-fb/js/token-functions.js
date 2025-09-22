// Get Token from Cookie
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('get-token-btn').addEventListener('click', async () => {
        const cookie = document.getElementById('cookie-input').value.trim();
        if (!cookie) {
            showNotification('Vui lòng nhập cookie Facebook', 'error');
            return;
        }

        // Show loading
        const btn = document.getElementById('get-token-btn');
        const loader = document.getElementById('token-loader');
        btn.disabled = true;
        loader.style.display = 'block';

        try {
            // Call Cloudflare Worker API
            const response = await fetch('https://get-token-fb.digitalcodestore-dev.workers.dev/cookie-to-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cookie })
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('token-content').textContent = data.token;
                document.getElementById('token-result').style.display = 'block';
                showNotification('Lấy token thành công', 'success');
                
                // Save to user history in Firebase
                const user = auth.currentUser;
                if (user) {
                    db.collection('token_tool_history').add({
                        userId: user.uid,
                        type: 'cookie_to_token',
                        input: cookie.substring(0, 100) + '...', // Store only first 100 chars
                        output: data.token.substring(0, 50) + '...', // Store only first 50 chars
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).catch(error => {
                        console.error("Error saving history:", error);
                    });
                }
            } else {
                showNotification(data.error || 'Lỗi khi lấy token', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Lỗi kết nối đến server', 'error');
        } finally {
            btn.disabled = false;
            loader.style.display = 'none';
        }
    });

    // Get Cookie from Token
    document.getElementById('get-cookie-btn').addEventListener('click', async () => {
        const token = document.getElementById('token-input').value.trim();
        if (!token) {
            showNotification('Vui lòng nhập token Facebook', 'error');
            return;
        }

        // Show loading
        const btn = document.getElementById('get-cookie-btn');
        const loader = document.getElementById('cookie-loader');
        btn.disabled = true;
        loader.style.display = 'block';

        try {
            // Call Cloudflare Worker API
            const response = await fetch('https://get-token-fb.digitalcodestore-dev.workers.dev/token-to-cookie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('cookie-content').textContent = data.cookie;
                document.getElementById('cookie-result').style.display = 'block';
                showNotification('Lấy cookie thành công', 'success');
                
                // Save to user history in Firebase
                const user = auth.currentUser;
                if (user) {
                    db.collection('token_tool_history').add({
                        userId: user.uid,
                        type: 'token_to_cookie',
                        input: token.substring(0, 50) + '...', // Store only first 50 chars
                        output: data.cookie.substring(0, 100) + '...', // Store only first 100 chars
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).catch(error => {
                        console.error("Error saving history:", error);
                    });
                }
            } else {
                showNotification(data.error || 'Lỗi khi lấy cookie', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Lỗi kết nối đến server', 'error');
        } finally {
            btn.disabled = false;
            loader.style.display = 'none';
        }
    });
});

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Đã sao chép vào clipboard', 'success');
    }).catch(err => {
        showNotification('Lỗi khi sao chép', 'error');
    });
}