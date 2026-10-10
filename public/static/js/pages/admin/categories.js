// Admin Categories
document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
});

async function loadCategories() {
    try {
        const { categories } = await API.categories.list();
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            tableBody.innerHTML = categories.map(c => `
        <tr>
          <td>${c.id}</td>
          <td>${c.name}</td>
          <td>${c.description || '-'}</td>
          <td>${formatDate(c.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${c.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${c.id})">Delete</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load categories:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: form.querySelector('input[name="name"]')?.value,
                description: form.querySelector('textarea[name="description"]')?.value
            };

            try {
                if (form.dataset.editId) {
                    await API.categories.update(form.dataset.editId, data);
                    showToast('Category updated!', 'success');
                    delete form.dataset.editId;
                } else {
                    await API.categories.create(data);
                    showToast('Category added!', 'success');
                }
                form.reset();
                await loadCategories();
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});

async function editCategory(id) {
    try {
        const { categories } = await API.categories.list();
        const cat = categories.find(c => c.id === id);
        if (cat) {
            const form = document.querySelector('form');
            if (form) {
                form.querySelector('input[name="name"]').value = cat.name;
                form.querySelector('textarea[name="description"]').value = cat.description || '';
                form.dataset.editId = id;
                showToast('Category loaded for editing', 'info');
            }
        }
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function deleteCategory(id) {
    if (!confirm('Are you sure? Products in this category will be uncategorized.')) return;
    try {
        await API.categories.delete(id);
        showToast('Category deleted', 'success');
        await loadCategories();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
