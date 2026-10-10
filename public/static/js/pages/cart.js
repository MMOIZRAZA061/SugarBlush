// Cart page
document.addEventListener('DOMContentLoaded', async () => {
    await loadCart();
});

async function loadCart() {
    try {
        const { items, total } = await API.cart.get();
        const container = document.querySelector('.cart-items') || document.querySelector('.row');
        const totalEl = document.querySelector('.cart-total') || document.querySelector('[id*="total"]');

        if (items.length === 0) {
            if (container) {
                container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">Your cart is empty</p><a href="/shop" class="btn btn-primary">Continue Shopping</a></div>';
            }
            return;
        }

        if (container) {
            container.innerHTML = items.map(item => `
        <div class="col-12 mb-3">
          <div class="card">
            <div class="card-body d-flex align-items-center">
              <img src="/static/uploads/${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
              <div class="ms-3 flex-grow-1">
                <h5>${item.name}</h5>
                <p class="text-muted mb-0">${formatCurrency(item.price)} each</p>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" onclick="updateQty(${item.id}, ${item.quantity - 1})">-</button>
                <span class="qty-display" id="qty-${item.id}">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary" onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
              </div>
              <div class="ms-3 text-end">
                <strong>${formatCurrency(item.price * item.quantity)}</strong>
              </div>
              <button class="btn btn-sm btn-outline-danger ms-3" onclick="removeItem(${item.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
        }

        if (totalEl) {
            totalEl.textContent = formatCurrency(total);
        }
    } catch (e) {
        console.error('Failed to load cart:', e);
    }
}

async function updateQty(itemId, quantity) {
    if (quantity < 1) return;
    try {
        await API.cart.update(itemId, quantity);
        await loadCart();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function removeItem(itemId) {
    try {
        await API.cart.remove(itemId);
        await loadCart();
        showToast('Item removed', 'success');
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function checkout() {
    const address = document.querySelector('input[name="address"]')?.value ||
        document.querySelector('textarea[name="address"]')?.value;
    const phone = document.querySelector('input[name="phone"]')?.value;
    const payment = document.querySelector('select[name="payment"]')?.value || 'cash';
    const notes = document.querySelector('textarea[name="notes"]')?.value;

    try {
        const result = await API.cart.checkout({
            delivery_address: address,
            phone: phone,
            payment_method: payment,
            notes: notes
        });
        showToast(`Order placed! Total: ${formatCurrency(result.total)}`, 'success');
        setTimeout(() => {
            window.location.href = '/order-history';
        }, 2000);
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
