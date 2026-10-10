// Admin Stock Management
document.addEventListener('DOMContentLoaded', async () => {
    await loadStock();
});

async function loadStock() {
    try {
        const { products } = await API.stock.list();
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            tableBody.innerHTML = products.map(p => `
        <tr>
          <td>${p.id}</td>
          <td>
            <div class="d-flex align-items-center">
              <img src="/static/uploads/${p.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 8px;">
              ${p.name}
            </div>
          </td>
          <td>${p.category_name || '-'}</td>
          <td>
            <span class="badge bg-${getStockColor(p.stock)}">${p.stock}</span>
          </td>
          <td>
            <input type="number" class="form-control form-control-sm d-inline-block" style="width: 80px;" 
                   value="${p.stock}" id="stock-${p.id}" min="0">
            <button class="btn btn-sm btn-outline-primary" onclick="updateStock(${p.id})">Update</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load stock:', e);
    }
}

function getStockColor(stock) {
    if (stock === 0) return 'danger';
    if (stock <= 5) return 'warning';
    return 'success';
}

async function updateStock(productId) {
    const input = document.querySelector(`#stock-${productId}`);
    const newStock = parseInt(input.value);

    if (isNaN(newStock) || newStock < 0) {
        showToast('Invalid stock value', 'danger');
        return;
    }

    try {
        await API.stock.update(productId, newStock, 'Manual adjustment');
        showToast('Stock updated', 'success');
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
