// DOM Elements
const usersTable = document.getElementById('users-table');
const userSearch = document.getElementById('user-search');
const exportUsersBtn = document.getElementById('export-users-btn');

// Load users
function loadUsers(searchTerm = '') {
    let query = db.collection('users');
    
    query.get().then((querySnapshot) => {
        const tbody = usersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7">Không có người dùng nào</td></tr>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            const userId = doc.id;
            
            // Filter by search term (email or user ID)
            if (searchTerm && 
                !user.email.toLowerCase().includes(searchTerm.toLowerCase()) && 
                !userId.toLowerCase().includes(searchTerm.toLowerCase())) {
                return;
            }
            
            const userRow = `
                <tr>
                    <td>${userId.substring(0, 8)}</td>
                    <td>${user.displayName || 'N/A'}</td>
                    <td>${user.email}</td>
                    <td>${formatPrice(user.balance || 0)}</td>
                    <td>${user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td>
                    <td><span class="status ${user.status || 'active'}">${user.status === 'banned' ? 'Bị khóa' : 'Hoạt động'}</span></td>
                    <td>
                        <button class="action-btn btn-edit" onclick="editUser('${userId}')">Sửa</button>
                        <button class="action-btn btn-add-funds" onclick="addFunds('${userId}', '${user.displayName || user.email}')">Cộng tiền</button>
                        <button class="action-btn btn-ban" onclick="toggleUserStatus('${userId}', '${user.status || 'active'}')">
                            ${user.status === 'banned' ? 'Mở khóa' : 'Khóa'}
                        </button>
                    </td>
                </tr>
            `;
            
            tbody.innerHTML += userRow;
        });
        
        if (tbody.innerHTML === '') {
            tbody.innerHTML = '<tr><td colspan="7">Không tìm thấy người dùng phù hợp</td></tr>';
        }
    }).catch((error) => {
        console.error("Error loading users:", error);
    });
}

// Toggle user status
function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    
    db.collection('users').doc(userId).update({
        status: newStatus
    })
    .then(() => {
        showNotification('Thành công', `Đã ${newStatus === 'banned' ? 'khóa' : 'mở khóa'} người dùng`, 'success');
        loadUsers(userSearch.value);
    })
    .catch((error) => {
        console.error("Error updating user status:", error);
        showNotification('Lỗi', 'Không thể cập nhật trạng thái người dùng', 'error');
    });
}

// Export users to Excel
function exportUsersToExcel() {
    const tbody = usersTable.querySelector('tbody');
    if (tbody.innerHTML.includes('Đang tải')) {
        showNotification('Thông báo', 'Vui lòng chờ dữ liệu tải xong', 'warning');
        return;
    }

    const data = [];
    const headers = ['ID', 'Tên', 'Email', 'Số dư', 'Vai trò', 'Trạng thái'];
    
    // Add headers
    data.push(headers);
    
    // Add data rows
    const rows = usersTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 6) { // Make sure we have enough columns
            const rowData = [
                cols[0].textContent,
                cols[1].textContent,
                cols[2].textContent,
                cols[3].textContent,
                cols[4].textContent,
                cols[5].textContent
            ];
            data.push(rowData);
        }
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Người dùng');
    
    // Export to file
    XLSX.writeFile(wb, 'danh_sach_nguoi_dung.xlsx');
    showNotification('Thành công', 'Đã xuất danh sách người dùng thành công', 'success');
}

// User search
userSearch.addEventListener('input', () => {
    loadUsers(userSearch.value);
});

// Export button
exportUsersBtn.addEventListener('click', exportUsersToExcel);

// Make functions global for onclick attributes
window.toggleUserStatus = toggleUserStatus;