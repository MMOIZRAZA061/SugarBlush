// Admin Users
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
});

async function loadUsers() {
    try {
        const { users } = await API.users.list();
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            tableBody.innerHTML = users.map(u => `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.phone || '-'}</td>
          <td><span class="badge bg-${u.role === 'admin' ? 'danger' : 'primary'}">${u.role}</span></td>
          <td>${formatDate(u.created_at)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editUser(${u.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})">Delete</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load users:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: form.querySelector('input[name="name"]')?.value,
                phone: form.querySelector('input[name="phone"]')?.value,
                address: form.querySelector('textarea[name="address"]')?.value,
                role: form.querySelector('select[name="role"]')?.value || 'customer'
            };

            try {
                if (form.dataset.editId) {
                    await API.users.update(form.dataset.editId, data);
                    showToast('User updated!', 'success');
                    delete form.dataset.editId;
                } else {
                    showToast('Cannot create users from admin panel', 'warning');
                }
                form.reset();
                await loadUsers();
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});

async function editUser(id) {
    try {
        const { user } = await API.users.get(id);
        const form = document.querySelector('form');
        if (form) {
            form.querySelector('input[name="name"]').value = user.name;
            form.querySelector('input[name="phone"]').value = user.phone || '';
            form.querySelector('textarea[name="address"]').value = user.address || '';
            form.querySelector('select[name="role"]').value = user.role;
            form.dataset.editId = id;
            showToast('User loaded for editing', 'info');
        }
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        await API.users.delete(id);
        showToast('User deleted', 'success');
        await loadUsers();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
