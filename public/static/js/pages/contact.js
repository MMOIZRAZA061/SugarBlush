// Contact page
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: form.querySelector('input[name="name"]')?.value,
                email: form.querySelector('input[name="email"]')?.value,
                phone: form.querySelector('input[name="phone"]')?.value,
                subject: form.querySelector('input[name="subject"]')?.value,
                message: form.querySelector('textarea[name="message"]')?.value
            };

            try {
                await API.contact.create(data);
                showToast('Message sent successfully!', 'success');
                form.reset();
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});
