// Admin Announcements
document.addEventListener('DOMContentLoaded', async () => {
    await loadAnnouncements();
});

async function loadAnnouncements() {
    try {
        const { announcements } = await API.announcements.list();
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            tableBody.innerHTML = announcements.map(a => `
        <tr>
          <td>${a.id}</td>
          <td>${a.title}</td>
          <td>${a.message?.substring(0, 50)}...</td>
          <td><span class="badge bg-${a.is_active ? 'success' : 'secondary'}">${a.is_active ? 'Active' : 'Inactive'}</span></td>
          <td>${formatDate(a.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editAnnouncement(${a.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncement(${a.id})">Delete</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load announcements:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                title: form.querySelector('input[name="title"]')?.value,
                message: form.querySelector('textarea[name="message"]')?.value
            };

            try {
                if (form.dataset.editId) {
                    await API.announcements.update(form.dataset.editId, data);
                    showToast('Announcement updated!', 'success');
                    delete form.dataset.editId;
                } else {
                    await API.announcements.create(data);
                    showToast('Announcement added!', 'success');
                }
                form.reset();
                await loadAnnouncements();
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});

async function editAnnouncement(id) {
    try {
        const { announcements } = await API.announcements.list();
        const ann = announcements.find(a => a.id === id);
        if (ann) {
            const form = document.querySelector('form');
            if (form) {
                form.querySelector('input[name="title"]').value = ann.title;
                form.querySelector('textarea[name="message"]').value = ann.message || '';
                form.dataset.editId = id;
                showToast('Announcement loaded for editing', 'info');
            }
        }
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
        await API.announcements.delete(id);
        showToast('Announcement deleted', 'success');
        await loadAnnouncements();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
