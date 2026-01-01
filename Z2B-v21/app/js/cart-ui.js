/**
 * Cart UI Rendering
 */

function renderCart() {
    const cart = z2bCart.getCart();
    const cartContent = document.getElementById('cartContent');

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-items">
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your cart is empty</h2>
                    <p style="color: rgba(255, 255, 255, 0.5); margin-bottom: 30px;">
                        Browse our apps and add them to your cart to get started!
                    </p>
                    <a href="index.html" class="btn-checkout">
                        <i class="fas fa-arrow-left"></i> Browse Apps
                    </a>
                </div>
            </div>
        `;
        return;
    }

    const total = z2bCart.getCartTotal();
    const itemCount = cart.length;
    const showSavings = itemCount >= 2;
    const bronzePrice = 480;
    const potentialSavings = total - bronzePrice;

    cartContent.innerHTML = `
        <div class="cart-content">
            <div class="cart-items">
                <h3 style="color: var(--gold); margin-bottom: 20px;">
                    <i class="fas fa-box"></i> Items in Cart (${itemCount})
                </h3>
                ${cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-icon">
                            <i class="fas ${item.icon}"></i>
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">
                                ${item.description || 'AI-Powered Application'}
                            </div>
                        </div>
                        <div class="cart-item-price">R${item.price}</div>
                        <button class="cart-item-remove" onclick="removeItem('${item.name}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                `).join('')}

                <div style="margin-top: 30px;">
                    <a href="index.html" class="btn-continue">
                        <i class="fas fa-arrow-left"></i> Continue Shopping
                    </a>
                </div>
            </div>

            <div class="cart-summary">
                <h3><i class="fas fa-receipt"></i> Order Summary</h3>

                <div class="summary-row">
                    <span>Items (${itemCount})</span>
                    <span style="font-size: 18px; font-weight: bold;">R${total}</span>
                </div>

                <div class="summary-row">
                    <span>Billing</span>
                    <span style="color: var(--gold);">Monthly</span>
                </div>

                <div class="summary-row" style="padding-top: 20px;">
                    <span style="font-size: 20px; font-weight: bold;">Total/Month</span>
                    <span class="summary-total">R${total}</span>
                </div>

                ${showSavings && potentialSavings > 0 ? `
                    <div style="background: rgba(255, 215, 0, 0.1); border: 2px solid var(--gold); border-radius: 15px; padding: 20px; margin-top: 20px;">
                        <h4 style="color: var(--gold); font-size: 16px; margin-bottom: 10px;">
                            <i class="fas fa-lightbulb"></i> Save R${potentialSavings}/month!
                        </h4>
                        <p style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin-bottom: 15px;">
                            Z2B Bronze Membership gives you ${itemCount} apps + 7 income streams for only R${bronzePrice}/month!
                        </p>
                        <a href="register.html?tier=BRONZE" class="btn-checkout" style="margin-top: 0; background: linear-gradient(135deg, #00ff88, #00cc66);">
                            <i class="fas fa-trophy"></i> Upgrade to Bronze
                        </a>
                    </div>
                ` : ''}

                <button class="btn-checkout" onclick="proceedToCheckout()">
                    <i class="fas fa-lock"></i> Proceed to Checkout
                </button>

                <p style="text-align: center; margin-top: 15px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">
                    <i class="fas fa-shield-alt"></i> Secure checkout - Cancel anytime
                </p>

                <button onclick="clearCart()" style="background: none; border: none; color: #ff6b6b; margin-top: 15px; cursor: pointer; width: 100%; opacity: 0.7; font-size: 14px;">
                    <i class="fas fa-trash"></i> Clear Cart
                </button>
            </div>
        </div>
    `;
}

function removeItem(itemName) {
    const result = z2bCart.removeFromCart(itemName);
    if (result.success) {
        renderCart();
    }
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        z2bCart.clearCart();
        renderCart();
    }
}

function proceedToCheckout() {
    const checkoutData = z2bCart.getCheckoutData();

    if (checkoutData.count === 0) {
        alert('Your cart is empty!');
        return;
    }

    const params = new URLSearchParams({
        items: checkoutData.items.map(item => item.name).join(','),
        total: checkoutData.total,
        count: checkoutData.count
    });

    if (checkoutData.referralCode) {
        params.append('ref', checkoutData.referralCode);
    }

    window.location.href = 'cart-checkout.html?' + params.toString();
}

window.addEventListener('cartUpdated', () => {
    renderCart();
});

if (typeof renderCart === 'function') {
    renderCart();
}
