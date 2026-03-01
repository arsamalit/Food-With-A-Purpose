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
        const deliveryFee = window.cartManager.getDeliveryFee(subtotal);
        const discount = window.cartManager.getDiscount(subtotal);
        const tax = (subtotal - discount) * 0.1;
        const total = subtotal - discount + deliveryFee + tax;

        const subtotalEl   = document.getElementById('subtotal');
        const deliveryEl   = document.getElementById('delivery-fee');
        const taxEl        = document.getElementById('tax');
        const totalEl      = document.getElementById('total');
        const discountRow  = document.getElementById('discount-row');
        const discountEl   = document.getElementById('discount');
        const discountCode = document.querySelector('.discount-code');

        if (subtotalEl)  subtotalEl.textContent  = `$${subtotal.toFixed(2)}`;
        if (deliveryEl)  deliveryEl.textContent  = `$${deliveryFee.toFixed(2)}`;
        if (taxEl)       taxEl.textContent       = `$${tax.toFixed(2)}`;
        if (totalEl)     totalEl.textContent     = `$${total.toFixed(2)}`;

        const promo = window.cartManager.getPromo();
        if (promo && (discount > 0 || promo.type === 'shipping')) {
            if (discountRow)  discountRow.style.display = 'flex';
            if (discountEl)   discountEl.textContent = promo.type === 'shipping' ? '-$5.00' : `-$${discount.toFixed(2)}`;
            if (discountCode) discountCode.textContent = promo.code;
        } else {
            if (discountRow) discountRow.style.display = 'none';
        }
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




    
    // Promo code
    const applyPromoBtn = document.getElementById('apply-promo');
    const promoInput    = document.getElementById('promo-input');
    const promoFeedback = document.getElementById('promo-feedback');

    function setPromoFeedback(message, type) {
        if (!promoFeedback) return;
        promoFeedback.textContent = message;
        promoFeedback.className = `promo-feedback promo-feedback-${type} show`;
    }

    function refreshPromoUI() {
        const promo = window.cartManager.getPromo();
        const removeBtn = document.getElementById('remove-promo');

        if (promo) {
            if (promoInput)  { promoInput.value = promo.code; promoInput.disabled = true; }
            if (applyPromoBtn) applyPromoBtn.style.display = 'none';
            if (removeBtn)   removeBtn.style.display = 'inline-flex';
            setPromoFeedback(`✓ ${promo.label}`, 'success');
        } else {
            if (promoInput)  { promoInput.value = ''; promoInput.disabled = false; }
            if (applyPromoBtn) applyPromoBtn.style.display = '';
            if (removeBtn)   removeBtn.style.display = 'none';
            if (promoFeedback) promoFeedback.className = 'promo-feedback';
        }
    }

    // Inject remove button & feedback element into DOM
    const promoSection = document.querySelector('.promo-code');
    if (promoSection) {
        // Feedback line
        const fb = document.createElement('div');
        fb.id = 'promo-feedback';
        fb.className = 'promo-feedback';
        promoSection.insertAdjacentElement('afterend', fb);

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.id = 'remove-promo';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.title = 'Remove promo code';
        removeBtn.style.display = 'none';
        removeBtn.className = 'remove-promo-btn';
        promoSection.appendChild(removeBtn);

        removeBtn.addEventListener('click', function () {
            window.cartManager.removePromo();
            refreshPromoUI();
            updateSummary();
            if (window.showToast) window.showToast('Promo code removed', 'success');
        });
    }

    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', function () {
            const code = promoInput ? promoInput.value : '';
            const result = window.cartManager.applyPromo(code);
            if (result.success) {
                refreshPromoUI();
                updateSummary();
                if (window.showToast) window.showToast(result.message, 'success');
            } else {
                setPromoFeedback(result.message, 'error');
                if (window.showToast) window.showToast(result.message, 'error');
            }
        });

        if (promoInput) {
            promoInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') applyPromoBtn.click();
            });
        }
    }

    refreshPromoUI();

    
    
    // Initial render
    renderCart();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', renderCart);
    
    console.log('✅ Cart page initialized');
});

console.log('✅ cart-page.js loaded')
