console.log('🔵 cart-manager.js loading...');

class CartManager {
    constructor() {
        console.log('🔵 CartManager constructor called');
        this.cart = this.loadCart();
        this.appliedPromo = this.loadPromo();
        console.log('🔵 Initial cart loaded:', this.cart);

        // Available promo codes
        this.promoCodes = {
            'SAVE10':    { type: 'percent',   value: 10,  label: '10% off your order' },
            'SAVE20':    { type: 'percent',   value: 20,  label: '20% off your order' },
               'SAVE50':    { type: 'percent',   value: 50 , label: '% 100off your order' },
              'SAVE100':    { type: 'percent',   value: 100 , label: '% 100off your order' },
            'FREESHIP':  { type: 'shipping',  value: 0,   label: 'Free delivery' },
            'WELCOME5':  { type: 'fixed',     value: 5,   label: '$5 off your order' },
        };
    }

    loadPromo() {
        try {
            const stored = localStorage.getItem('foodCartPromo');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    }

    savePromo() {
        try {
            if (this.appliedPromo) {
                localStorage.setItem('foodCartPromo', JSON.stringify(this.appliedPromo));
            } else {
                localStorage.removeItem('foodCartPromo');
            }
        } catch (e) { console.error('Error saving promo:', e); }
    }

    applyPromo(code) {
        const upper = code.trim().toUpperCase();
        if (!upper) return { success: false, message: 'Please enter a promo code.' };

        const promo = this.promoCodes[upper];
        if (!promo) return { success: false, message: `"${upper}" is not a valid promo code.` };

        this.appliedPromo = { code: upper, ...promo };
        this.savePromo();
        window.dispatchEvent(new Event('cartUpdated'));
        return { success: true, message: `Code applied: ${promo.label}!`, promo: this.appliedPromo };
    }

    removePromo() {
        this.appliedPromo = null;
        this.savePromo();
        window.dispatchEvent(new Event('cartUpdated'));
    }

    removePromo(){
        this.appliedPormo = null;
        this.savePromo();
        window.dispatchEvent(new Event('cartUpdate'));
    }
 


    getPromo() {
        return this.appliedPromo;
    }

    getDiscount(subtotal) {
        if (!this.appliedPromo) return 0;
        const { type, value } = this.appliedPromo;
        if (type === 'percent') return parseFloat((subtotal * value / 100).toFixed(2));
        if (type === 'fixed')   return Math.min(value, subtotal);
        return 0; 
    }

    getDeliveryFee(subtotal) {
        if (subtotal === 0) return 0;
        if (this.appliedPromo && this.appliedPromo.type === 'shipping') return 0;
        return 5;
    }

     loadCart() {
        try {
            const stored = localStorage.getItem('foodCart');
            const cart = stored ? JSON.parse(stored) : [];
            console.log('📦 Loaded from storage:', cart);
            return cart;
        } catch (error) {
            console.error('❌ Error loading cart:', error);
            return [];
        }
    }




     saveCart() {
        try {
            localStorage.setItem('foodCart', JSON.stringify(this.cart));
            console.log('💾 Cart saved:', this.cart);
            
            
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('❌ Error saving cart:', error);
        }
    }

     addItem(item) {
        console.log('➕ Adding item:', item);
        
        const existingIndex = this.cart.findIndex(cartItem => cartItem.name === item.name);

         
        if (existingIndex > -1) {
             this.cart[existingIndex].quantity += 1;
            console.log('✅ Updated quantity for:', item.name, 'New qty:', this.cart[existingIndex].quantity);
        } else {
             const newItem = {
                name: item.name,
                price: item.price,
                image: item.image,
                description: item.description,
                tags: item.tags || [],
                calories: item.calories || '0 cal',
                quantity: 1
            };                                  
            this.cart.push(newItem);
            console.log('✅ Added new item:', newItem);
        }
        
            
        this.saveCart();
        console.log('📊 Current cart:', this.cart);
        return true;
    }

     removeItem(itemName) {
        console.log('🗑️ Removing item:', itemName);
        this.cart = this.cart.filter(item => item.name !== itemName);
        this.saveCart();
    }

     updateQuantity(itemName, quantity) {
        console.log('🔄 Updating quantity for:', itemName, 'to:', quantity);
        const item = this.cart.find(cartItem => cartItem.name === itemName);
        if (item) {
            item.quantity = Math.max(1, Math.min(1000, quantity));
            this.saveCart();
        }
    }
 

    getItems() {
        return this.cart;
    }

 
    // Get cart count
    getCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart subtotal
    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}

 console.log('🟢 Creating CartManager instance...');
const cartManager = new CartManager();

 window.cartManager = cartManager;
console.log('✅ window.cartManager set:', window.cartManager);

 function showToast(message, type = 'success') {
    console.log('🔔 Toast:', message, type);
    
     const existingToast = document.querySelector('.cart-toast');
    if (existingToast) {
        existingToast.remove();
    }

     const toast = document.createElement('div');
    toast.className = `cart-toast cart-toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'times-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 1);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
 

// Make showToast global
window.showToast = showToast;

// Add toast styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .cart-toast {
        position: fixed;
        top: 0px;
        right: -300px;
        background: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        transition: right 0.3s ease;
        font-weight: 600;
    }
    
    .cart-toast.show {
        right: 20px;
    }
    
    .cart-toast-success {
        border-left: 4px solid #4CAF50;
    }
    
    .cart-toast-success i {
        color: #4CAF50;
        font-size: 1.3em;
    }
    
    .cart-toast-error {
        border-left: 4px solid #ff4444;
    }
    
    .cart-toast-error i {
        color: #ff4444;
        font-size: 1.3em;
    }
        
    
    @media (max-width: 768px) {
        .cart-toast {
            right: -250px;
            padding: 12px 20px;
            font-size: 0.9em;
        }
        
        .cart-toast.show {
            right: 10px;
        }
    }
`;
document.head.appendChild(toastStyles);

// Update cart badge count
function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    if (badges.length > 0 && window.cartManager) {
        const count = window.cartManager.getCount();
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
        console.log('🔢 Cart badge updated:', count);
    }
}
 
window.updateCartBadge = updateCartBadge;
// Initialize on page load
function initCartBadge() {
    console.log('🎯 Initializing cart badge...');
    updateCartBadge();
}
 window.addEventListener('cartUpdated', updateCartBadge);
window.addEventListener('storage', function(e) {
    if (e.key === 'foodCart') {
        console.log('🔄 Cart updated in another tab/page');
        if (window.cartManager) {
            window.cartManager.cart = window.cartManager.loadCart();
            updateCartBadge();
        }
    }
});
 

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartBadge);
} else {
    initCartBadge();
}

if (document.readyState === 'loading') {
    document
}

console.log('✅ cart-manager.js fully loaded and ready!');
console.log('📊 Cart has', cartManager.getCount(), 'items');
