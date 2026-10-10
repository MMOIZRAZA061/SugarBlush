// Admin Site Settings
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
});

async function loadSettings() {
    try {
        const { settings } = await API.settings.get();

        // Fill form fields
        document.querySelector('input[name="site_name"]')?.setAttribute('value', settings.site_name || '');
        document.querySelector('textarea[name="site_description"]')?.value = settings.site_description || '';
        document.querySelector('input[name="contact_email"]')?.setAttribute('value', settings.contact_email || '');
        document.querySelector('input[name="contact_phone"]')?.setAttribute('value', settings.contact_phone || '');
        document.querySelector('textarea[name="contact_address"]')?.value = settings.contact_address || '';
        document.querySelector('input[name="facebook_url"]')?.setAttribute('value', settings.facebook_url || '');
        document.querySelector('input[name="instagram_url"]')?.setAttribute('value', settings.instagram_url || '');
        document.querySelector('input[name="whatsapp_url"]')?.setAttribute('value', settings.whatsapp_url || '');
        document.querySelector('input[name="delivery_fee"]')?.setAttribute('value', settings.delivery_fee || '0');
        document.querySelector('input[name="free_delivery_min"]')?.setAttribute('value', settings.free_delivery_min || '0');
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                site_name: form.querySelector('input[name="site_name"]')?.value,
                site_description: form.querySelector('textarea[name="site_description"]')?.value,
                contact_email: form.querySelector('input[name="contact_email"]')?.value,
                contact_phone: form.querySelector('input[name="contact_phone"]')?.value,
                contact_address: form.querySelector('textarea[name="contact_address"]')?.value,
                facebook_url: form.querySelector('input[name="facebook_url"]')?.value,
                instagram_url: form.querySelector('input[name="instagram_url"]')?.value,
                whatsapp_url: form.querySelector('input[name="whatsapp_url"]')?.value,
                delivery_fee: form.querySelector('input[name="delivery_fee"]')?.value,
                free_delivery_min: form.querySelector('input[name="free_delivery_min"]')?.value
            };

            try {
                await API.settings.update(data);
                showToast('Settings saved!', 'success');
            } catch (e) {
                showToast(e.message, 'danger');
            }
        });
    }
});
