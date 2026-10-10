// Order History page
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrders();
});

async function loadOrders() {
    try {
        const { orders } = await API.orders.myOrders();
        const container = document.querySelector('.orders-list') || document.querySelector('.row') || document.querySelector('.table-responsive');

        if (orders.length === 0) {
            if (container) {
                container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No orders yet</p><a href="/shop" class="btn btn-primary">Start Shopping</a></div>';
            }
            return;
        }

        // If it's a table
        if (container.classList.contains('table-responsive')) {
            const table = container.querySelector('table');
            if (table) {
                table.querySelector('tbody').innerHTML = orders.map(o => `
          <tr>
            <td>#${o.id}</td>
            <td>${formatDate(o.created_at)}</td>
            <td>${formatCurrency(o.total_amount)}</td>
            <td><span class="badge bg-${getStatusColor(o.status)}">${o.status}</span></td>
            <td><button class="btn btn-sm btn-outline-primary" onclick="viewOrder(${o.id})">View</button></td>
          </tr>
        `).join('');
            }
        } else {
            container.innerHTML = orders.map(o => `
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5>Order #${o.id}</h5>
                <p class="text-muted mb-0">${formatDate(o.created_at)}</p>
              </div>
              <div class="text-end">
                <strong>${formatCurrency(o.total_amount)}</strong>
                <br>
                <span class="badge bg-${getStatusColor(o.status)}">${o.status}</span>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-primary mt-2" onclick="viewOrder(${o.id})">View Details</button>
          </div>
        </div>
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

async function viewOrder(id) {
    try {
        const { order, items } = await API.orders.get(id);
        const modal = document.querySelector('.modal') || document.createElement('div');

        // Create modal if not exists
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
        <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(order.status)}">${order.status}</span></p>
        <p><strong>Total:</strong> ${formatCurrency(order.total_amount)}</p>
        ${order.delivery_address ? `<p><strong>Address:</strong> ${order.delivery_address}</p>` : ''}
        ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
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
