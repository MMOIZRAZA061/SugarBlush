// Admin Products
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    await loadCategories();
});

async function loadProducts() {
    try {
        const { products } = await API.products.list({ limit: 100 });
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
          <td>${formatCurrency(p.price)}</td>
          <td>${p.stock}</td>
          <td>
            <span class="badge bg-${p.is_active ? 'success' : 'secondary'}">${p.is_active ? 'Active' : 'Inactive'}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${p.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">Delete</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load products:', e);
    }
}

async function loadCategories() {
    try {
        const { categories } = await API.categories.list();
        const select = document.querySelector('select[name="category_id"]');
        if (select) {
            select.innerHTML = '<option value="">Select Category</option>' +
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    } catch (e) {
        console.error('Failed to load categories:', e);
    }
}

// Add product form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: form.querySelector('input[name="name"]')?.value,
                description: form.querySelector('textarea[name="description"]')?.value,
                price: parseFloat(form.querySelector('input[name="price"]')?.value) || 0,
                cost_price: parseFloat(form.querySelector('input[name="cost_price"]')?.value) || 0,
                category_id: parseInt(form.querySelector('select[name="category_id"]')?.value) || null,
                image: form.querySelector('input[name="image"]')?.value || '',
                stock: parseInt(form.querySelector('input[name="stock"]')?.value) || 0,
                is_active: form.querySelector('input[name="is_active"]')?.checked || false,
                is_featured: form.querySelector('input[name="is_featured"]')?.checked || false,
                is_new: form.querySelector('input[name="is_new"]')?.checked || false
            };

            try {
                await API.products.create(data);
                showToast('Product added!', 'success');
                form.reset();
                await loadProducts();
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});

async function editProduct(id) {
    try {
        const { product } = await API.products.get(id);
        const form = document.querySelector('form');
        if (form) {
            form.querySelector('input[name="name"]').value = product.name;
            form.querySelector('textarea[name="description"]').value = product.description;
            form.querySelector('input[name="price"]').value = product.price;
            form.querySelector('input[name="cost_price"]').value = product.cost_price;
            form.querySelector('select[name="category_id"]').value = product.category_id || '';
            form.querySelector('input[name="image"]').value = product.image;
            form.querySelector('input[name="stock"]').value = product.stock;
            form.querySelector('input[name="is_active"]').checked = !!product.is_active;
            form.querySelector('input[name="is_featured"]').checked = !!product.is_featured;
            form.querySelector('input[name="is_new"]').checked = !!product.is_new;

            // Update form action to PUT
            form.dataset.editId = id;
            showToast('Product loaded for editing', 'info');
        }
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
        await API.products.delete(id);
        showToast('Product deleted', 'success');
        await loadProducts();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
