// Custom Orders page
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: form.querySelector('input[name="name"]')?.value,
                email: form.querySelector('input[name="email"]')?.value,
                phone: form.querySelector('input[name="phone"]')?.value,
                description: form.querySelector('textarea[name="description"]')?.value,
                quantity: parseInt(form.querySelector('input[name="quantity"]')?.value) || 1,
                preferred_date: form.querySelector('input[name="date"]')?.value
            };

            try {
                await API.customOrders.create(data);
                showToast('Custom order submitted successfully!', 'success');
                form.reset();
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});
