// Profile page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await API.auth.getProfile();

        // Fill form fields
        document.querySelector('input[name="name"]')?.setAttribute('value', user.name);
        document.querySelector('input[name="email"]')?.setAttribute('value', user.email);
        document.querySelector('input[name="phone"]')?.setAttribute('value', user.phone || '');
        document.querySelector('textarea[name="address"]')?.value = user.address || '';

        // Update display
        const nameEl = document.querySelector('.profile-name') || document.querySelector('h4');
        if (nameEl) nameEl.textContent = user.name;

        const emailEl = document.querySelector('.profile-email');
        if (emailEl) emailEl.textContent = user.email;

    } catch (e) {
        console.error('Failed to load profile:', e);
    }
});

// Update profile
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                name: form.querySelector('input[name="name"]')?.value,
                phone: form.querySelector('input[name="phone"]')?.value,
                address: form.querySelector('textarea[name="address"]')?.value
            };

            try {
                await API.auth.updateProfile(data);
                showToast('Profile updated!', 'success');
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});
