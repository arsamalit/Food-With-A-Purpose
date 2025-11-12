const mobileMenu = document.querySelector('.mobile-menu');
const mobileNav = document.querySelector('.mobile-nav');
const mobileOverlay = document.querySelector('.mobile-overlay');
const mobileClose = document.querySelector('.mobile-close');

mobileMenu.addEventListener('click', () => {
    mobileNav.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

const closeMobileMenu = () => {
    mobileNav.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
};

mobileClose.addEventListener('click', closeMobileMenu);
mobileOverlay.addEventListener('click', closeMobileMenu);

document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

document.querySelector('.newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (window.showToast) {
        window.showToast('✅ Thank you for subscribing!', 'success');
    } else {
        alert('Thank you for subscribing! You will receive exclusive offers and updates.');
    }
    e.target.reset();
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.step, .menu-item, .offer-card, .meal-card, .about-card, .recipe-card, .order-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

document.querySelectorAll('.recipe-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const recipeName = this.closest('.recipe-card').querySelector('h3').textContent;
        if (window.showToast) {
            window.showToast(`📖 Recipe Coming soon: ${recipeName}`, 'success');
        } else {
            alert(`Opening recipe for: ${recipeName}\n\nFull recipe details coming soon!`);
        }
    });
});

document.querySelectorAll('.order-card-btn, .order-cta-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (window.showToast) {
            window.showToast('🛒 Redirecting to order page...', 'success');
        } else {
            alert('🛒 Redirecting to order page...\n\nYour delicious, healthy meal is just a few clicks away!');
        }
    });
});

// Also update "Order Now" buttons in special offers
document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (window.showToast) {
            window.showToast('🛒 Adding to cart...', 'success');
        } else {
            alert('Order functionality coming soon!');
        }
    });
});
