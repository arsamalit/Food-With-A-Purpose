// Cart Page - Displays cart items
console.log('🔵 cart-page.js loading...');

// Wait for cart manager to be ready
function waitForCartManager(callback) {
    if (window.cartManager) {
        console.log('✅ Cart manager found immediately');
        callback();
    } else {
        console.log('⏳ Waiting for cart manager...');
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            console.log(`🔍 Checking for cart manager... attempt ${attempts}`);
            
            if (window.cartManager) {
                console.log('✅ Cart manager found after', attempts, 'attempts');
                clearInterval(checkInterval);
                callback();
            } else if (attempts > 50) {
                console.error('❌ Cart manager not found after 50 attempts');
                clearInterval(checkInterval);
                alert('Cart system not loaded. Please refresh the page.');
            }
        }, 100);
    }
}

// Initialize cart page
waitForCartManager(function() {
    console.log('🚀 Initializing cart page...');
    
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const continueShoppingSection = document.querySelector('.continue-shopping');
    
    function renderCart() {
        console.log('🎨 Rendering cart...');
        const items = window.cartManager.getItems();
        console.log('📦 Items to render:', items);
        
        if (!cartItemsContainer) {
            console.error('❌ Cart items container not found!');
            return;
        }
        
        // Clear container
        cartItemsContainer.innerHTML = '';
        
        if (items.length === 0) {
            console.log('📭 Cart is empty');
            if (emptyCart) emptyCart.style.display = 'block';
            if (continueShoppingSection) continueShoppingSection.style.display = 'none';
        } else {
            console.log('🛒 Displaying', items.length, 'items');
            if (emptyCart) emptyCart.style.display = 'none';
            if (continueShoppingSection) continueShoppingSection.style.display = 'block';
            
            items.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p class="item-description">${item.description}</p>
                        <div class="item-tags">
                            ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="item-price">$${item.price.toFixed(2)}</div>
                    <div class="item-quantity">
                        <button class="qty-btn minus" data-name="${item.name}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10" data-name="${item.name}">
                        <button class="qty-btn plus" data-name="${item.name}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item" data-name="${item.name}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }
        
        updateSummary();
        updateItemCount();
        
        // Update badge
        if (window.updateCartBadge) {
            window.updateCartBadge();
        }
    }
    
    function updateSummary() {
        const subtotal = window.cartManager.getSubtotal();
        const deliveryFee = subtotal > 0 ? 5 : 0;
        const tax = subtotal * 0.1;
        const total = subtotal + deliveryFee + tax;
        
        const subtotalElement = document.getElementById('subtotal');
        const deliveryFeeElement = document.getElementById('delivery-fee');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');
        
        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (deliveryFeeElement) deliveryFeeElement.textContent = `$${deliveryFee.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }
    
    function updateItemCount() {
        const count = window.cartManager.getCount();
        const itemCountElement = document.getElementById('item-count');
        if (itemCountElement) {
            itemCountElement.textContent = count;
        }
    }
    
    // Event delegation for cart actions
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const itemName = target.dataset.name;
            
            if (target.classList.contains('remove-item')) {
                console.log('🗑️ Remove item:', itemName);
                window.cartManager.removeItem(itemName);
                renderCart();
                if (window.showToast) {
                    window.showToast('Item removed from cart', 'success');
                }
            } else if (target.classList.contains('minus')) {
                const input = cartItemsContainer.querySelector(`.qty-input[data-name="${itemName}"]`);
                if (input) {
                    const newQty = Math.max(1, parseInt(input.value) - 1);
                    window.cartManager.updateQuantity(itemName, newQty);
                    renderCart();
                }
            } else if (target.classList.contains('plus')) {
                const input = cartItemsContainer.querySelector(`.qty-input[data-name="${itemName}"]`);
                if (input) {
                    const newQty = Math.min(100, parseInt(input.value) + 1);
                    window.cartManager.updateQuantity(itemName, newQty);
                    renderCart();
                }
            }
        });
        
        // Handle quantity input changes
        cartItemsContainer.addEventListener('change', function(e) {
            if (e.target.classList.contains('qty-input')) {
                const itemName = e.target.dataset.name;
                const newQty = parseInt(e.target.value);
                if (!isNaN(newQty) && newQty >= 1 && newQty <= 100) {
                    window.cartManager.updateQuantity(itemName, newQty);
                    renderCart();
                }
            }
        });
    }
    
    // t button
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your cart?')) {
                window.cartManager.clearCart();
                renderCart();
                if (window.showToast) {
                    window.showToast('Cart cleared', 'success');
                }
            }
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const items = window.cartManager.getItems();
            if (items.length === 0) {
                if (window.showToast) {
                    window.showToast('Your cart is empty!', 'error');
                } else {
                    alert('Your cart is empty!');
                }
            } else {
                if (window.showToast) {
                    window.showToast('Proceeding to checkout...', 'success');
                } else {
                    alert('Proceeding to checkout...');
                }
            }
        });
    }




    
    // Promo code button
    const applyPromoBtn = document.getElementById('apply-promo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', function() {
            const promoInput = document.getElementById('promo-input');
            if (promoInput && promoInput.value.trim()) {
                if (window.showToast) {
                    window.showToast('Promo code feature coming soon!', 'success');
                } else {
                    alert('Promo code feature coming soon!');
                }
            }
        });
    }
    
    // Initial render
    renderCart();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', renderCart);
    
    console.log('✅ Cart page initialized');
});

console.log('✅ cart-page.js loaded')
