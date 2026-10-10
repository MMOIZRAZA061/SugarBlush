// Shop page - Load all products with filtering
document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.querySelector('.row');
    if (!productsContainer) return;

    // Load categories for filter
    try {
        const { categories } = await API.categories.list();
        const categoryFilter = document.querySelector('select[name="category"]') ||
            document.querySelector('.filter-category');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        }
    } catch (e) {
        console.error('Failed to load categories:', e);
    }

    // Load products
    await loadProducts();

    // Add event listeners for filters
    document.querySelectorAll('select, input[type="text"]').forEach(el => {
        el.addEventListener('change', loadProducts);
        el.addEventListener('input', loadProducts);
    });
});

async function loadProducts() {
    const params = {};
    const category = document.querySelector('select[name="category"]')?.value;
    const search = document.querySelector('input[name="search"]')?.value;

    if (category) params.category = category;
    if (search) params.search = search;

    try {
        const { products } = await API.products.list(params);
        const container = document.querySelector('.row');

        if (products.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No products found</p></div>';
            return;
        }

        container.innerHTML = products.map(p => `
      <div class="col-6 col-sm-4 col-lg-3">
        <div class="card product-card mb-4" style="cursor:pointer;">
          <img src="/static/uploads/${p.image}" class="card-img-top" alt="${p.name}" style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text text-muted">${p.description?.substring(0, 50)}...</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-bold text-primary">${formatCurrency(p.price)}</span>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" onclick="addToCart(${p.id});">
                  <i class="bi bi-cart-plus"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="buyNow(${p.id});">
                  <i class="bi bi-lightning"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    } catch (e) {
        console.error('Failed to load products:', e);
    }
}

async function addToCart(productId) {
    try {
        await API.cart.add(productId);
        showToast('Added to cart!', 'success');
    } catch (e) {
        if (e.message.includes('Not authenticated')) {
            window.location.href = '/login?next=/shop';
        } else {
            showToast(e.message, 'danger');
        }
    }
}

async function buyNow(productId) {
    try {
        await API.cart.add(productId);
        window.location.href = '/cart';
    } catch (e) {
        if (e.message.includes('Not authenticated')) {
            window.location.href = '/login?next=/cart';
        } else {
            showToast(e.message, 'danger');
        }
    }
}
