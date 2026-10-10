// Admin Orders
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrders();
});

async function loadOrders() {
    try {
        const { orders } = await API.orders.list();
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            tableBody.innerHTML = orders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${o.customer_name}</td>
          <td>${o.customer_email}</td>
          <td>${formatCurrency(o.total_amount)}</td>
          <td><span class="badge bg-${getStatusColor(o.status)}">${o.status}</span></td>
          <td>${formatDate(o.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="viewOrder(${o.id})">View</button>
            <select class="form-select form-select-sm d-inline-block" style="width: auto;" onchange="updateStatus(${o.id}, this.value)">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
              <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
              <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${o.id})">Delete</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load orders:', e);
    }
}

function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'processing': 'info',
        'shipped': 'primary',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

async function updateStatus(id, status) {
    try {
        await API.orders.updateStatus(id, status);
        showToast('Status updated', 'success');
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
        await API.orders.delete(id);
        showToast('Order deleted', 'success');
        await loadOrders();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function viewOrder(id) {
    try {
        const { order, items } = await API.orders.get(id);
        const modal = document.querySelector('.modal') || document.createElement('div');

        if (!modal.classList.contains('modal')) {
            modal.className = 'modal fade';
            modal.id = 'orderModal';
            modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Order #${order.id}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="orderModalBody"></div>
          </div>
        </div>
      `;
            document.body.appendChild(modal);
        }

        document.querySelector('#orderModalBody').innerHTML = `
      <div class="mb-3">
        <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
        <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(order.status)}">${order.status}</span></p>
        <p><strong>Total:</strong> ${formatCurrency(order.total_amount)}</p>
        ${order.delivery_address ? `<p><strong>Address:</strong> ${order.delivery_address}</p>` : ''}
        ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
      </div>
      <h6>Items:</h6>
      <table class="table table-sm">
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
          ${items.map(i => `
            <tr>
              <td>${i.name}</td>
              <td>${i.quantity}</td>
              <td>${formatCurrency(i.price)}</td>
              <td>${formatCurrency(i.price * i.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
