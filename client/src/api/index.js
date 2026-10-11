const BASE_URL = '/api'

// Helper: resolve image URL (supports both Cloudinary URLs and legacy local filenames)
export function imageUrl(image) {
    if (!image) return ''
    if (image.startsWith('http')) return image
    return `/static/uploads/${image}`
}

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`
    const token = localStorage.getItem('token')
    const config = {
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        },
        ...options
    }

    try {
        const response = await fetch(url, config)
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Request failed')
        }
        return data
    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
}

function buildQuery(params = {}) {
    const query = new URLSearchParams(params).toString()
    return query ? `?${query}` : ''
}

export const API = {
    auth: {
        check: () => request('/auth/check'),
        login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
        signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
        logout: () => request('/auth/logout', { method: 'POST' }),
        getProfile: () => request('/auth/profile'),
        updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) })
    },
    products: {
        list: (params = {}) => request(`/products${buildQuery(params)}`),
        get: (id) => request(`/products/${id}`),
        create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
        toggle: (id) => request(`/products/${id}/toggle`, { method: 'POST' })
    },
    cart: {
        get: () => request('/cart'),
        add: (productId, quantity = 1) => request('/cart/add', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
        update: (id, quantity) => request(`/cart/update/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
        remove: (id) => request(`/cart/remove/${id}`, { method: 'DELETE' }),
        checkout: (data) => request('/cart/checkout', { method: 'POST', body: JSON.stringify(data) })
    },
    orders: {
        list: (params = {}) => request(`/orders${buildQuery(params)}`),
        myOrders: () => request('/orders/my'),
        get: (id) => request(`/orders/${id}`),
        updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
        delete: (id) => request(`/orders/${id}`, { method: 'DELETE' })
    },
    categories: {
        list: () => request('/categories'),
        create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => request(`/categories/${id}`, { method: 'DELETE' })
    },
    banners: {
        list: () => request('/banners'),
        create: (data) => request('/banners', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => request(`/banners/${id}`, { method: 'DELETE' })
    },
    announcements: {
        list: () => request('/announcements'),
        create: (data) => request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => request(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => request(`/announcements/${id}`, { method: 'DELETE' })
    },
    customOrders: {
        list: (params = {}) => request(`/custom-orders${buildQuery(params)}`),
        create: (data) => request('/custom-orders', { method: 'POST', body: JSON.stringify(data) }),
        updateStatus: (id, status) => request(`/custom-orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
        delete: (id) => request(`/custom-orders/${id}`, { method: 'DELETE' })
    },
    contact: {
        list: (params = {}) => request(`/contact${buildQuery(params)}`),
        create: (data) => request('/contact', { method: 'POST', body: JSON.stringify(data) }),
        markRead: (id) => request(`/contact/${id}/read`, { method: 'PUT' }),
        delete: (id) => request(`/contact/${id}`, { method: 'DELETE' })
    },
    users: {
        list: (params = {}) => request(`/users${buildQuery(params)}`),
        get: (id) => request(`/users/${id}`),
        update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => request(`/users/${id}`, { method: 'DELETE' })
    },
    stock: {
        list: () => request('/stock'),
        update: (productId, stock, reason) => request('/stock/update', { method: 'POST', body: JSON.stringify({ product_id: productId, stock, reason }) }),
        logs: (params = {}) => request(`/stock/logs${buildQuery(params)}`),
        report: () => request('/stock/report')
    },
    reports: {
        dashboard: () => request('/reports/dashboard'),
        analytics: () => request('/reports/analytics'),
        topSearch: () => request('/reports/top-search')
    },
    coupons: {
        list: () => request('/coupons'),
        create: (data) => request('/coupons', { method: 'POST', body: JSON.stringify(data) }),
        generate: (data) => request('/coupons/generate', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => request(`/coupons/${id}`, { method: 'DELETE' }),
        validate: (code, cart_total) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, cart_total }) }),
        assign: (coupon_id, total_assignments) => request('/coupons/assign', { method: 'POST', body: JSON.stringify({ coupon_id, total_assignments }) }),
        my: () => request('/coupons/my'),
        claim: (assignment_id) => request(`/coupons/claim/${assignment_id}`, { method: 'POST' })
    },
    settings: {
        get: () => request('/settings'),
        update: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) })
    },
    upload: {
        image: (file, folder = 'sugar-blush') => {
            const formData = new FormData()
            formData.append('image', file)
            formData.append('folder', folder)
            const token = localStorage.getItem('token')
            return fetch(`${BASE_URL}/upload`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData
            }).then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Upload failed')
                return data
            })
        }
    }
}

export function formatCurrency(amount) {
    return 'Rs. ' + parseFloat(amount).toFixed(2)
}

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-PK', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}
