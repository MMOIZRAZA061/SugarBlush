// Home page - Load featured products and banners
document.addEventListener('DOMContentLoaded', async () => {
    // Load featured products
    try {
        const { products } = await API.products.list({ featured: 1, limit: 4 });
        const featuredContainer = document.querySelector('.row');
        if (featuredContainer && products.length > 0) {
            // Find the featured products section
            const sections = document.querySelectorAll('.row');
            let featuredSection = null;
            for (const section of sections) {
                if (section.querySelector('.product-card')) {
                    featuredSection = section;
                    break;
                }
            }

            if (featuredSection) {
                featuredSection.innerHTML = products.map(p => `
          <div class="col-6 col-sm-4 col-lg-3">
            <div class="card product-card mb-4" onclick="window.location='/shop';" style="cursor:pointer;">
              <img src="/static/uploads/${p.image}" class="card-img-top" alt="${p.name}" style="height: 200px; object-fit: cover;">
              <div class="card-body">
                <h5 class="card-title">${p.name}</h5>
                <p class="card-text text-muted">${p.description?.substring(0, 50)}...</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-bold text-primary">${formatCurrency(p.price)}</span>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); addToCart(${p.id});">
                      <i class="bi bi-cart-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); buyNow(${p.id});">
                      <i class="bi bi-lightning"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('');
            }
        }
    } catch (e) {
        console.error('Failed to load featured products:', e);
    }

    // Load new arrivals
    try {
        const { products: newArrivals } = await API.products.list({ new_arrivals: 1, limit: 4 });
        const newSection = document.querySelector('.new-arrivals-section');
        if (newSection && newArrivals.length > 0) {
            const row = newSection.querySelector('.row');
            if (row) {
                row.innerHTML = newArrivals.map(p => `
          <div class="col-6 col-sm-4 col-lg-3">
            <div class="card product-card mb-4" onclick="window.location='/shop';" style="cursor:pointer;">
              <img src="/static/uploads/${p.image}" class="card-img-top" alt="${p.name}" style="height: 200px; object-fit: cover;">
              <div class="card-body">
                <h5 class="card-title">${p.name}</h5>
                <p class="card-text text-muted">${p.description?.substring(0, 50)}...</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fw-bold text-primary">${formatCurrency(p.price)}</span>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); addToCart(${p.id});">
                      <i class="bi bi-cart-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); buyNow(${p.id});">
                      <i class="bi bi-lightning"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('');
            }
        }
    } catch (e) {
        console.error('Failed to load new arrivals:', e);
    }

    // Load banners
    try {
        const { banners } = await API.banners.list();
        const carousel = document.querySelector('#promoCarousel .carousel-inner');
        if (carousel && banners.length > 0) {
            carousel.innerHTML = banners.map((b, i) => `
        <div class="carousel-item ${i === 0 ? 'active' : ''}">
          <img src="/static/uploads/${b.image}" class="d-block w-100" alt="${b.title}" style="height: 400px; object-fit: cover;">
          <div class="carousel-caption d-none d-md-block text-start">
            <h2>${b.title}</h2>
            <p>${b.subtitle}</p>
            <div class="d-flex gap-2">
              <a href="${b.link || '/shop'}" class="btn btn-primary">Shop Now</a>
              <a href="/about" class="btn btn-outline-light">Learn More</a>
            </div>
          </div>
        </div>
      `).join('');
        }
    } catch (e) {
        console.error('Failed to load banners:', e);
    }
});

// Add to cart function
async function addToCart(productId) {
    try {
        await API.cart.add(productId);
        showToast('Added to cart!', 'success');
    } catch (e) {
        if (e.message.includes('Not authenticated')) {
            window.location.href = '/login?next=/';
        } else {
            showToast(e.message, 'danger');
        }
    }
}

// Buy now function
async function buyNow(productId) {
    try {
        await API.cart.add(productId);
        window.location.href = '/cart';
    } catch (e) {
        if (e.message.includes('Not authenticated')) {
            window.location.href = '/login?next=/cart';
        } else {
            showToast(e.message, 'danger');
        }
    }
}
