// DOM Elements
const depositsTable = document.getElementById('deposits-table');
const depositSearch = document.getElementById('deposit-search');
const exportDepositsBtn = document.getElementById('export-deposits-btn');

// Load deposit requests
function loadDepositRequests(userIdFilter = '') {
    let query = db.collection('deposit_requests').orderBy('createdAt', 'desc');
    
    query.get().then((querySnapshot) => {
        const tbody = depositsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7">Không có yêu cầu nộp tiền nào</td></tr>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const request = doc.data();
            const requestId = doc.id;
            
            // Filter by user ID
            if (userIdFilter && request.userId && 
                !request.userId.toLowerCase().includes(userIdFilter.toLowerCase())) {
                return;
            }
            
            const requestRow = `
                <tr>
                    <td>${requestId.substring(0, 8)}</td>
                    <td>${request.userId ? request.userId.substring(0, 8) : 'N/A'}</td>
                    <td>${formatPrice(request.amount || 0)}</td>
                    <td>${request.description || 'N/A'}</td>
                    <td>${request.createdAt ? request.createdAt.toDate().toLocaleString('vi-VN') : 'N/A'}</td>
                    <td><span class="status ${request.status || 'pending'}">${request.status === 'pending' ? 'Chờ xử lý' : request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}</span></td>
                    <td>
                        ${request.status === 'pending' ? `
                            <button class="action-btn btn-approve" onclick="approveDeposit('${requestId}', '${request.userId}', ${request.amount})">Duyệt</button>
                            <button class="action-btn btn-reject" onclick="rejectDeposit('${requestId}')">Từ chối</button>
                        ` : 'Đã xử lý'}
                    </td>
                </tr>
            `;
            
            tbody.innerHTML += requestRow;
        });
        
        if (tbody.innerHTML === '') {
            tbody.innerHTML = '<tr><td colspan="7">Không tìm thấy yêu cầu phù hợp</td></tr>';
        }
    }).catch((error) => {
        console.error("Error loading deposit requests:", error);
    });
}

// Approve deposit
function approveDeposit(requestId, userId, amount) {
    const batch = db.batch();
    
    // Update deposit request status
    const requestRef = db.collection('deposit_requests').doc(requestId);
    batch.update(requestRef, { status: 'approved' });
    
    // Update user balance
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
        balance: firebase.firestore.FieldValue.increment(amount)
    });
    
    // Create transaction record
    const transactionRef = db.collection('transactions').doc();
    batch.set(transactionRef, {
        userId: userId,
        type: 'deposit',
        amount: amount,
        description: 'Nạp tiền thành công',
        status: 'completed',
        createdAt: new Date()
    });
    
    // Commit batch
    batch.commit()
        .then(() => {
            showNotification('Thành công', 'Đã duyệt yêu cầu nộp tiền', 'success');
            loadDepositRequests(depositSearch.value);
            loadStats();
        })
        .catch((error) => {
            console.error("Error approving deposit:", error);
            showNotification('Lỗi', 'Không thể duyệt yêu cầu nộp tiền', 'error');
        });
}

// Reject deposit
function rejectDeposit(requestId) {
    db.collection('deposit_requests').doc(requestId).update({
        status: 'rejected'
    })
    .then(() => {
        showNotification('Thành công', 'Đã từ chối yêu cầu nộp tiền', 'success');
        loadDepositRequests(depositSearch.value);
    })
    .catch((error) => {
        console.error("Error rejecting deposit:", error);
        showNotification('Lỗi', 'Không thể từ chối yêu cầu nộp tiền', 'error');
    });
}

// Export deposits to Excel
function exportDepositsToExcel() {
    const tbody = depositsTable.querySelector('tbody');
    if (tbody.innerHTML.includes('Đang tải')) {
        showNotification('Thông báo', 'Vui lòng chờ dữ liệu tải xong', 'warning');
        return;
    }

    const data = [];
    const headers = ['ID', 'Người dùng', 'Số tiền', 'Nội dung', 'Ngày yêu cầu', 'Trạng thái'];
    
    // Add headers
    data.push(headers);
    
    // Add data rows
    const rows = depositsTable.querySelectorAll('tbody tr');
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
    XLSX.utils.book_append_sheet(wb, ws, 'Yêu cầu nộp tiền');
    
    // Export to file
    XLSX.writeFile(wb, 'yeu_cau_nop_tien.xlsx');
    showNotification('Thành công', 'Đã xuất yêu cầu nộp tiền thành công', 'success');
}

// Deposit search
depositSearch.addEventListener('input', () => {
    loadDepositRequests(depositSearch.value);
});

// Export button
exportDepositsBtn.addEventListener('click', exportDepositsToExcel);

// Make functions global for onclick attributes
window.approveDeposit = approveDeposit;
window.rejectDeposit = rejectDeposit;