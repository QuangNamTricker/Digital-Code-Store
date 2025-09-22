// DOM Elements
const transactionsTable = document.getElementById('transactions-table');
const transactionSearch = document.getElementById('transaction-search');
const exportTransactionsBtn = document.getElementById('export-transactions-btn');

// Load transactions
function loadTransactions(userIdFilter = '') {
    let query = db.collection('transactions').orderBy('createdAt', 'desc');
    
    query.get().then((querySnapshot) => {
        const tbody = transactionsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7">Không có giao dịch nào</td></tr>';
            return;
        }
        
        querySnapshot.forEach((doc) => {
            const transaction = doc.data();
            const transactionId = doc.id;
            
            // Filter by user ID
            if (userIdFilter && transaction.userId && 
                !transaction.userId.toLowerCase().includes(userIdFilter.toLowerCase())) {
                return;
            }
            
            const transactionRow = `
                <tr>
                    <td>${transactionId.substring(0, 8)}</td>
                    <td>${transaction.userId ? transaction.userId.substring(0, 8) : 'N/A'}</td>
                    <td>${getTransactionTypeText(transaction.type)}</td>
                    <td>${transaction.description || 'N/A'}</td>
                    <td>${formatPrice(transaction.amount || 0)}</td>
                    <td>${transaction.createdAt ? transaction.createdAt.toDate().toLocaleString('vi-VN') : 'N/A'}</td>
                    <td><span class="status ${transaction.status || 'completed'}">${transaction.status === 'pending' ? 'Chờ xử lý' : 'Hoàn thành'}</span></td>
                </tr>
            `;
            
            tbody.innerHTML += transactionRow;
        });
        
        if (tbody.innerHTML === '') {
            tbody.innerHTML = '<tr><td colspan="7">Không tìm thấy giao dịch phù hợp</td></tr>';
        }
    }).catch((error) => {
        console.error("Error loading transactions:", error);
    });
}

// Export transactions to Excel
function exportTransactionsToExcel() {
    const tbody = transactionsTable.querySelector('tbody');
    if (tbody.innerHTML.includes('Đang tải')) {
        showNotification('Thông báo', 'Vui lòng chờ dữ liệu tải xọng', 'warning');
        return;
    }

    const data = [];
    const headers = ['ID', 'Người dùng', 'Loại', 'Mô tả', 'Số tiền', 'Ngày', 'Trạng thái'];
    
    // Add headers
    data.push(headers);
    
    // Add data rows
    const rows = transactionsTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        if (cols.length >= 7) { // Make sure we have enough columns
            const rowData = [
                cols[0].textContent,
                cols[1].textContent,
                cols[2].textContent,
                cols[3].textContent,
                cols[4].textContent,
                cols[5].textContent,
                cols[6].textContent
            ];
            data.push(rowData);
        }
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử giao dịch');
    
    // Export to file
    XLSX.writeFile(wb, 'lich_su_giao_dich.xlsx');
    showNotification('Thành công', 'Đã xuất lịch sử giao dịch thành công', 'success');
}

// Transaction search
transactionSearch.addEventListener('input', () => {
    loadTransactions(transactionSearch.value);
});

// Export button
exportTransactionsBtn.addEventListener('click', exportTransactionsToExcel);