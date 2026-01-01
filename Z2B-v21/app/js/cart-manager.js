/**
 * Z2B Shopping Cart Manager
 * Handles cart operations for app purchases
 */

class CartManager {
    constructor() {
        this.storageKey = 'z2b_cart';
        this.cart = this.loadCart();
        this.updateCartBadge();
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        try {
            const cartData = localStorage.getItem(this.storageKey);
            return cartData ? JSON.parse(cartData) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
            this.updateCartBadge();
            this.triggerCartUpdate();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    /**
     * Add item to cart
     */
    addToCart(item) {
        // Check if item already exists
        const existingIndex = this.cart.findIndex(cartItem =>
            cartItem.name.toLowerCase() === item.name.toLowerCase()
        );

        if (existingIndex !== -1) {
            // Item already in cart
            return {
                success: false,
                message: `${item.name} is already in your cart!`,
                cart: this.cart
            };
        }

        // Add new item
        this.cart.push({
            name: item.name,
            price: parseFloat(item.price),
            icon: item.icon || 'fa-box',
            description: item.description || '',
            addedAt: new Date().toISOString()
        });

        this.saveCart();

        return {
            success: true,
            message: `${item.name} added to cart!`,
            cart: this.cart
        };
    }

    /**
     * Remove item from cart
     */
    removeFromCart(itemName) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item =>
            item.name.toLowerCase() !== itemName.toLowerCase()
        );

        if (this.cart.length < initialLength) {
            this.saveCart();
            return {
                success: true,
                message: `${itemName} removed from cart`,
                cart: this.cart
            };
        }

        return {
            success: false,
            message: 'Item not found in cart',
            cart: this.cart
        };
    }

    /**
     * Clear entire cart
     */
    clearCart() {
        this.cart = [];
        this.saveCart();
        return {
            success: true,
            message: 'Cart cleared',
            cart: this.cart
        };
    }

    /**
     * Get cart items
     */
    getCart() {
        return this.cart;
    }

    /**
     * Get cart count
     */
    getCartCount() {
        return this.cart.length;
    }

    /**
     * Calculate cart total
     */
    getCartTotal() {
        return this.cart.reduce((total, item) => total + item.price, 0);
    }

    /**
     * Check if item is in cart
     */
    isInCart(itemName) {
        return this.cart.some(item =>
            item.name.toLowerCase() === itemName.toLowerCase()
        );
    }

    /**
     * Update cart badge on all pages
     */
    updateCartBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = this.getCartCount();

        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });

        // Update cart count text
        const countTexts = document.querySelectorAll('.cart-count-text');
        countTexts.forEach(text => {
            text.textContent = count;
        });
    }

    /**
     * Trigger cart update event
     */
    triggerCartUpdate() {
        const event = new CustomEvent('cartUpdated', {
            detail: {
                cart: this.cart,
                count: this.getCartCount(),
                total: this.getCartTotal()
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get cart summary for checkout
     */
    getCheckoutData() {
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref') ||
                           urlParams.get('sponsor') ||
                           localStorage.getItem('referralCode') || '';

        return {
            items: this.cart,
            count: this.getCartCount(),
            total: this.getCartTotal(),
            referralCode: referralCode,
            timestamp: new Date().toISOString()
        };
    }
}

// Create global cart instance
const z2bCart = new CartManager();

// Listen for cart updates
window.addEventListener('cartUpdated', (e) => {
    console.log('Cart updated:', e.detail);
});
