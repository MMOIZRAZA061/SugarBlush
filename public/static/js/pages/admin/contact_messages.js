// Admin Contact Messages
document.addEventListener('DOMContentLoaded', async () => {
    await loadMessages();
});

async function loadMessages() {
    try {
        const { messages } = await API.contact.list();
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            tableBody.innerHTML = messages.map(m => `
        <tr class="${m.is_read ? '' : 'table-primary'}">
          <td>${m.id}</td>
          <td>${m.name}</td>
          <td>${m.email}</td>
          <td>${m.phone || '-'}</td>
          <td>${m.subject || '-'}</td>
          <td>${m.message?.substring(0, 50)}...</td>
          <td>${formatDate(m.created_at)}</td>
          <td>
            ${!m.is_read ? `<button class="btn btn-sm btn-outline-info" onclick="markRead(${m.id})">Mark Read</button>` : ''}
            <button class="btn btn-sm btn-outline-danger" onclick="deleteMessage(${m.id})">Delete</button>
          </td>
        </tr>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load messages:', e);
    }
}

async function markRead(id) {
    try {
        await API.contact.markRead(id);
        await loadMessages();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}

async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
        await API.contact.delete(id);
        showToast('Message deleted', 'success');
        await loadMessages();
    } catch (e) {
        showToast(e.message, 'danger');
    }
}
