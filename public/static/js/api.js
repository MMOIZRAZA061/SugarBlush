// Sugar Blush Bakery - Frontend API Module
// This module handles all API communication between frontend and backend

const API = {
    baseUrl: '/api',

    // Helper to make API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth
    auth: {
        check: () => API.request('/auth/check'),
        login: (email, password) => API.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
        signup: (data) => API.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        logout: () => API.request('/auth/logout', { method: 'POST' }),
        getProfile: () => API.request('/auth/profile'),
        updateProfile: (data) => API.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    },

    // Products
    products: {
        list: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.request(`/products${query ? '?' + query : ''}`);
        },
        get: (id) => API.request(`/products/${id}`),
        create: (data) => API.request('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.request(`/products/${id}`, { method: 'DELETE' }),
        toggle: (id) => API.request(`/products/${id}/toggle`, { method: 'POST' })
    },

    // Cart
    cart: {
        get: () => API.request('/cart'),
        add: (productId, quantity = 1) => API.request('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        }),
        update: (id, quantity) => API.request(`/cart/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        }),
        remove: (id) => API.request(`/cart/remove/${id}`, { method: 'DELETE' }),
        checkout: (data) => API.request('/cart/checkout', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    // Orders
    orders: {
        list: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.request(`/orders${query ? '?' + query : ''}`);
        },
        myOrders: () => API.request('/orders/my'),
        get: (id) => API.request(`/orders/${id}`),
        updateStatus: (id, status) => API.request(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
        delete: (id) => API.request(`/orders/${id}`, { method: 'DELETE' })
    },

    // Categories
    categories: {
        list: () => API.request('/categories'),
        create: (data) => API.request('/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.request(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.request(`/categories/${id}`, { method: 'DELETE' })
    },

    // Banners
    banners: {
        list: () => API.request('/banners'),
        create: (data) => API.request('/banners', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.request(`/banners/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.request(`/banners/${id}`, { method: 'DELETE' })
    },

    // Announcements
    announcements: {
        list: () => API.request('/announcements'),
        create: (data) => API.request('/announcements', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => API.request(`/announcements/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.request(`/announcements/${id}`, { method: 'DELETE' })
    },

    // Custom Orders
    customOrders: {
        list: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.request(`/custom-orders${query ? '?' + query : ''}`);
        },
        create: (data) => API.request('/custom-orders', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        updateStatus: (id, status) => API.request(`/custom-orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
        delete: (id) => API.request(`/custom-orders/${id}`, { method: 'DELETE' })
    },

    // Contact
    contact: {
        list: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.request(`/contact${query ? '?' + query : ''}`);
        },
        create: (data) => API.request('/contact', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        markRead: (id) => API.request(`/contact/${id}/read`, { method: 'PUT' }),
        delete: (id) => API.request(`/contact/${id}`, { method: 'DELETE' })
    },

    // Users
    users: {
        list: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.request(`/users${query ? '?' + query : ''}`);
        },
        get: (id) => API.request(`/users/${id}`),
        update: (id, data) => API.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => API.request(`/users/${id}`, { method: 'DELETE' })
    },

    // Stock
    stock: {
        list: () => API.request('/stock'),
        update: (productId, stock, reason) => API.request('/stock/update', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, stock, reason })
        }),
        logs: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.request(`/stock/logs${query ? '?' + query : ''}`);
        },
        report: () => API.request('/stock/report')
    },

    // Reports
    reports: {
        dashboard: () => API.request('/reports/dashboard'),
        analytics: () => API.request('/reports/analytics'),
        topSearch: () => API.request('/reports/top-search')
    },

    // Settings
    settings: {
        get: () => API.request('/settings'),
        update: (data) => API.request('/settings', {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    }
};

// Auth Guard - Check if user is authenticated
async function requireAuth() {
    try {
        const result = await API.auth.check();
        return result.authenticated;
    } catch (e) {
        return false;
    }
}

// Redirect to login if not authenticated
async function guardPage() {
    const path = window.location.pathname.toLowerCase();
    const needsAuth = path.includes('/admin') || path.includes('/profile') ||
        path.includes('/order-history') || path.includes('/cart');

    if (needsAuth) {
        const authed = await requireAuth();
        if (!authed) {
            window.location.href = '/login';
            return false;
        }
    }
    return true;
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', async () => {
    await guardPage();

    // Wire up login form
    const loginForm = document.querySelector('form#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[name="email"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;

            try {
                await API.auth.login(email, password);
                const next = new URLSearchParams(window.location.search).get('next');
                window.location.href = next ? decodeURIComponent(next) : '/admin';
            } catch (error) {
                const alert = document.createElement('div');
                alert.className = 'alert alert-danger';
                alert.textContent = error.message;
                loginForm.parentNode.insertBefore(alert, loginForm);
                alert.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Wire up logout links
    document.querySelectorAll('a[href*="logout"]').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            await API.auth.logout();
            window.location.href = '/';
        });
    });
});

// Utility functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatCurrency(amount) {
    return 'Rs. ' + parseFloat(amount).toFixed(2);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PK', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}
