// Admin Custom Orders
document.addEventListener('DOMContentLoaded', async () => {
    await loadCustomOrders();
});

async function loadCustomOrders() {
    try {
        const { orders } = await API.customOrders.list();
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            tableBody.innerHTML = orders.map(o => `
        <tr>
          <td>${o.id}</td>
          <td>${o.name}</td>
          <td>${o.email}</td>
          <td>${o.phone || '-'}</td>
          <td>${o.description?.substring(0, 50)}...</td>
          <td>${o.quantity}</td>
          <td>${o.preferred_date || '-'}</td>
          <td><span class="badge bg-${getStatusColor(o.status)}">${o.status}</span></td>
          <td>${formatDate(o.created_at)}</td>
          <td>
            <select class="form-select form-select-sm d-inline-block" style="width: auto;" onchange="updateStatus(${o.id}, this.value)">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in_progress" ${o.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${o.id})">Delete</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load custom orders:', e);
    }
}

function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'in_progress': 'info',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

async function updateStatus(id, status) {
    try {
        await API.customOrders.updateStatus(id, status);
        showToast('Status updated', 'success');
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this custom order?')) return;
    try {
        await API.customOrders.delete(id);
        showToast('Order deleted', 'success');
        await loadCustomOrders();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
