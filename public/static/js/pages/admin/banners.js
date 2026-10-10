// Admin Banners
document.addEventListener('DOMContentLoaded', async () => {
    await loadBanners();
});

async function loadBanners() {
    try {
        const { banners } = await API.banners.list();
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            tableBody.innerHTML = banners.map(b => `
        <tr>
          <td>${b.id}</td>
          <td>
            <div class="d-flex align-items-center">
              <img src="/static/uploads/${b.image}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 8px;">
              ${b.title}
            </div>
          </td>
          <td>${b.subtitle || '-'}</td>
          <td>${b.link || '-'}</td>
          <td><span class="badge bg-${b.is_active ? 'success' : 'secondary'}">${b.is_active ? 'Active' : 'Inactive'}</span></td>
          <td>${b.sort_order}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editBanner(${b.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteBanner(${b.id})">Delete</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load banners:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                title: form.querySelector('input[name="title"]')?.value,
                subtitle: form.querySelector('input[name="subtitle"]')?.value,
                image: form.querySelector('input[name="image"]')?.value,
                link: form.querySelector('input[name="link"]')?.value,
                sort_order: parseInt(form.querySelector('input[name="sort_order"]')?.value) || 0
            };

            try {
                if (form.dataset.editId) {
                    await API.banners.update(form.dataset.editId, data);
                    showToast('Banner updated!', 'success');
                    delete form.dataset.editId;
                } else {
                    await API.banners.create(data);
                    showToast('Banner added!', 'success');
                }
                form.reset();
                await loadBanners();
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});

async function editBanner(id) {
    try {
        const { banners } = await API.banners.list();
        const banner = banners.find(b => b.id === id);
        if (banner) {
            const form = document.querySelector('form');
            if (form) {
                form.querySelector('input[name="title"]').value = banner.title;
                form.querySelector('input[name="subtitle"]').value = banner.subtitle || '';
                form.querySelector('input[name="image"]').value = banner.image;
                form.querySelector('input[name="link"]').value = banner.link || '';
                form.querySelector('input[name="sort_order"]').value = banner.sort_order;
                form.dataset.editId = id;
                showToast('Banner loaded for editing', 'info');
            }
        }
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function deleteBanner(id) {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
        await API.banners.delete(id);
        showToast('Banner deleted', 'success');
        await loadBanners();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
