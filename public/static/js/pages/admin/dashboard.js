// Admin Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const stats = await API.reports.dashboard();

        // Update stat cards
        const updateStat = (id, value) => {
            const el = document.querySelector(`[id*="${id}"]`) ||
                document.querySelector(`.card .text-end strong`);
            if (el) el.textContent = value;
        };

        // Try to find and update stat values
        const cards = document.querySelectorAll('.card .text-end');
        if (cards.length >= 5) {
            cards[0].querySelector('strong').textContent = formatCurrency(stats.totalSales);
            cards[1].querySelector('strong').textContent = formatCurrency(stats.totalProfit);
            cards[2].querySelector('strong').textContent = stats.totalOrders;
            cards[3].querySelector('strong').textContent = stats.pendingOrders;
            cards[4].querySelector('strong').textContent = stats.totalProducts;
        }

        // Update recent orders table
        const tableBody = document.querySelector('.table tbody');
        if (tableBody && stats.recentOrders.length > 0) {
            tableBody.innerHTML = stats.recentOrders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${o.customer_name}</td>
          <td>${formatCurrency(o.total_amount)}</td>
          <td><span class="badge bg-${getStatusColor(o.status)}">${o.status}</span></td>
          <td>${formatDate(o.created_at)}</td>
        </tr>
      `).join('');
        }

        // Update top products
        const topProductsEl = document.querySelector('.top-products') || document.querySelector('.list-group');
        if (topProductsEl && stats.topProducts.length > 0) {
            topProductsEl.innerHTML = stats.topProducts.map((p, i) => `
        <div class="list-group-item d-flex justify-content-between">
          <span>${i + 1}. ${p.name}</span>
          <span class="text-muted">${p.total_sold} sold</span>
        </div>
      `).join('');
        }

    } catch (e) {
        console.error('Failed to load dashboard:', e);
    }
});

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
