import { db, userId, appId } from './firebase-setup.js';
import { doc, collection, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { renderCart } from './ui-updates.js';

// Global state for the customer's shopping cart
export let cart = {};

/**
 * Adds an item to the cart or increments its quantity.
 * This version is called with item data directly, not a button element.
 */
function addToCart(id, name, price) {
    if (cart[id]) {
        cart[id].quantity += 1;
    } else {
        cart[id] = { id, name, price, quantity: 1 };
    }
    renderCart(); // Trigger a re-render of the cart view
}

/**
 * Removes one item from the cart, or deletes it if quantity hits zero.
 * Attached to window.removeFromCart for HTML access.
 */
function removeFromCart(id) {
    if (cart[id]) {
        cart[id].quantity -= 1;
        if (cart[id].quantity <= 0) {
            delete cart[id];
        }
    }
    renderCart();
}

/**
 * Clears the entire cart.
 */
function clearCart() {
    cart = {};
    renderCart();
}


/**
 * Submits the current cart contents as a new order to the database.
 * Attached to window.placeOrder for HTML access.
 */
async function placeOrder() {
    if (!db || Object.keys(cart).length === 0) {
        document.getElementById('cart-message').textContent = "Cannot place empty order.";
        setTimeout(() => document.getElementById('cart-message').textContent = '', 3000);
        return;
    }

    const itemsArray = Object.values(cart).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: (item.price * item.quantity).toFixed(2)
    }));
    
    const total = itemsArray.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);

    const orderData = {
        customerId: userId,
        items: itemsArray,
        total: total,
        status: 'New', // Initial status for Chef KDS
        timestamp: Date.now()
    };

    try {
        const ordersRef = collection(db, `artifacts/${appId}/public/data/orders`);
        const docRef = doc(ordersRef); // Let Firestore generate the ID
        await setDoc(docRef, orderData);

        // Clear the cart after successful order placement
        cart = {}; // Clear the global cart object
        renderCart();
        document.getElementById('cart-message').textContent = `Order placed successfully! Total: $${total}`;
        setTimeout(() => document.getElementById('cart-message').textContent = 'Your cart is empty. Start adding items!', 5000);
    } catch (e) {
        console.error("Error placing order: ", e);
        document.getElementById('cart-message').textContent = `Error placing order: ${e.message}`;
    }
}

// Export and attach to window for access from index.html onclick events
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.placeOrder = placeOrder;
window.clearCart = clearCart;
