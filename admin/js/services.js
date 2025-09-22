// DOM Elements
const servicesTable = document.getElementById('services-table');
const addServiceBtn = document.getElementById('add-service-btn');

// Load services management
function loadServicesManagement() {
    const tbody = servicesTable.querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="7">Đang tải dữ liệu...</td></tr>';

    db.collection('free_services').orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            tbody.innerHTML = '';
            if (querySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="7">Không có dịch vụ nào.</td></tr>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const service = doc.data();
                const serviceId = doc.id;
                
                const serviceRow = `
                    <tr>
                        <td><img src="${service.imageUrl || 'https://via.placeholder.com/50x50?text=No+Image'}" alt="${service.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                        <td>${service.name}</td>
                        <td>${service.description || 'N/A'}</td>
                        <td><a href="${service.externalUrl}" target="_blank">Xem liên kết</a></td>
                        <td>${service.isFeatured ? 'Có' : 'Không'}</td>
                        <td><span class="status ${service.status}">${service.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}</span></td>
                        <td>
                            <button class="action-btn btn-edit" onclick="editService('${serviceId}')">Sửa</button>
                            <button class="action-btn btn-ban" onclick="toggleServiceStatus('${serviceId}', '${service.status}')">
                                ${service.status === 'active' ? 'Ẩn' : 'Hiện'}
                            </button>
                            <button class="action-btn btn-delete" onclick="deleteService('${serviceId}', '${service.name}')">
                                Xóa
                            </button>
                        </td>
                    </tr>
                `;
                
                tbody.innerHTML += serviceRow;
            });
        })
        .catch((error) => {
            console.error("Error loading services:", error);
            tbody.innerHTML = '<tr><td colspan="7">Có lỗi xảy ra khi tải danh sách dịch vụ.</td></tr>';
        });
}

// Add service
function addService() {
    document.getElementById('service-modal-title').textContent = 'Thêm dịch vụ miễn phí';
    document.getElementById('service-form').reset();
    document.getElementById('service-id').value = '';
    document.getElementById('service-status').value = 'active';
    document.getElementById('service-isFeatured').value = 'false';
    document.getElementById('service-modal').style.display = 'flex';
}

// Toggle service status
function toggleServiceStatus(serviceId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    db.collection('free_services').doc(serviceId).update({
        status: newStatus
    })
    .then(() => {
        showNotification('Thành công', `Đã ${newStatus === 'active' ? 'kích hoạt' : 'ẩn'} dịch vụ thành công`, 'success');
        loadServicesManagement();
    })
    .catch((error) => {
        console.error("Error updating service status:", error);
        showNotification('Lỗi', 'Không thể cập nhật trạng thái dịch vụ', 'error');
    });
}

// Delete service
function deleteService(serviceId, serviceName) {
    if (confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${serviceName}"?`)) {
        db.collection('free_services').doc(serviceId).delete()
        .then(() => {
            showNotification('Thành công', 'Đã xóa dịch vụ thành công', 'success');
            loadServicesManagement();
        })
        .catch((error) => {
            console.error("Error deleting service:", error);
            showNotification('Lỗi', 'Không thể xóa dịch vụ', 'error');
        });
    }
}

// Add service button
addServiceBtn.addEventListener('click', addService);

// Make functions global for onclick attributes
window.toggleServiceStatus = toggleServiceStatus;
window.deleteService = deleteService;