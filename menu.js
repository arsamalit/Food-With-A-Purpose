console.log('🔵 menu.js loading...');

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
                console.error('❌ Cart manager not found after 50 attempts (5 seconds)');
                clearInterval(checkInterval);
                alert('Cart system not loaded. Please refresh the page.');
            }
        }, 100);
    }
}

 waitForCartManager(function() {
    console.log('🚀 Initializing menu functionality...');
    
     const filterButtons = document.querySelectorAll('.filter-btn');
    const categories = document.querySelectorAll('.menu-category');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            categories.forEach(category => {
                if (filter === 'all') {
                    category.style.display = 'block';
                } else if (category.dataset.category === filter) {
                    category.style.display = 'block';
                } else {
                    category.style.display = 'none';
                }
            });
        });
    });

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    console.log('🛒 Found', addToCartButtons.length, 'add-to-cart buttons');
    
    addToCartButtons.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔵 Add to cart clicked - button', index + 1);
            
             if (!window.cartManager) {
                console.error('❌ Cart manager not available!');
                alert('Cart system not loaded. Please refresh the page.');
                return;
            }
            
            const card = this.closest('.menu-item-card');
            if (!card) {
                console.error('❌ Could not find menu-item-card');
                return;
            }
            
            const itemDetails = card.querySelector('.item-details');
            if (!itemDetails) {
                console.error('❌ Could not find item-details');
                return;
            }
            

            
             try {
                const h3 = itemDetails.querySelector('h3');
                const priceElement = card.querySelector('.item-price');
                const img = card.querySelector('.item-image img');
                const descElement = itemDetails.querySelector('.item-description');
                const ingredientTags = itemDetails.querySelectorAll('.ingredient-tag');
                const metaSpans = itemDetails.querySelectorAll('.item-meta span');
                
                console.log('📋 Extracting data from elements:', {
                    h3: h3 ? h3.textContent : 'NOT FOUND',
                    price: priceElement ? priceElement.textContent : 'NOT FOUND',
                    img: img ? img.src : 'NOT FOUND'
                });
                
                const itemData = {
                    name: h3.textContent.trim(),
                    price: parseFloat(priceElement.textContent.replace('$', '')),
                    image: img.src,
                    description: descElement.textContent.trim(),
                    tags: Array.from(ingredientTags).map(tag => tag.textContent.trim()),
                    calories: metaSpans.length > 0 ? metaSpans[metaSpans.length - 1].textContent.trim() : '0 cal'
                };
                
                console.log('📦 Item data extracted:', itemData);
                
                 if (!itemData.name || isNaN(itemData.price)) {
                    console.error('❌ Invalid item data:', itemData);
                    alert('Error: Could not extract item information');
                    return;
                }
                
                 console.log('➕ Calling cartManager.addItem...');
                const success = window.cartManager.addItem(itemData);
                console.log('📊 Add result:', success);
                
                if (success) {
                    console.log('✅ Item successfully added to cart');
                    
                    // Show notification
                    if (window.showToast) {
                        window.showToast(`✅ ${itemData.name} added to cart!`, 'success');
                    } else {
                        alert(`✅ ${itemData.name} added to cart!`);
                    }
                    
                    // Update badge
                    if (window.updateCartBadge) {
                        window.updateCartBadge();
                    }
                    
                    // Log current cart
                    console.log('🛒 Current cart:', window.cartManager.getItems());
                    console.log('🔢 Cart count:', window.cartManager.getCount());
                }
            } catch (error) {
                console.error('❌ Error in add to cart:', error);
                alert('Failed to add item to cart: ' + error.message);
            }
        });
    });

    // Customize button functionality
    document.querySelectorAll('.customize-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemName = this.closest('.item-details').querySelector('h3').textContent;
            if (window.showToast) {
                window.showToast(`🎨 Customize ${itemName} - Coming soon!`, 'success');
            } else {
                alert(`🎨 Customize ${itemName} - Coming soon!`);
            }
        });
    });

 
    
    console.log('✅ Menu functionality initialized');
});

console.log('✅ menu.js loaded');
