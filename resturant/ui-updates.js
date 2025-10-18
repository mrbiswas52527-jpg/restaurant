import { addToCart, cart, placeOrder, clearCart } from './customer-cart.js';
import { updateOrderStatus } from './chef-kds.js';
import { menuItems, orders } from './state-management.js';
import { editItem, deleteMenuItem, resetAdminForm } from './admin-management.js';

// Attach essential public functions to the window object so they can be called
// directly from dynamically generated HTML (like the Add to Cart buttons).
window.addToCart = addToCart;
window.placeOrder = placeOrder;
window.clearCart = clearCart;
window.updateOrderStatus = updateOrderStatus;
window.editItem = editItem;
window.deleteMenuItem = deleteMenuItem;
window.resetAdminForm = resetAdminForm;


// --- Customer View Rendering ---

/**
 * Renders the full customer menu with all items categorized.
 * This is the main renderer for the customer view.
 */
export function renderCustomerMenu() {
    const items = menuItems; // Get the latest menu items from state-management.js
    const contentDiv = document.getElementById('customer-content');
    if (!contentDiv) return;

    if (items.length === 0) {
        contentDiv.innerHTML = '<div class="text-center py-10 text-gray-500">The menu is currently empty. Please check the Management page to add items.</div>';
        renderCart();
        return;
    }

    // Group items by category
    const categories = items.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    let menuHtml = '';
    
    // Create a section for each category
    for (const category in categories) {
        menuHtml += `
            <section class="menu-section mb-8 bg-white p-6 rounded-xl shadow-lg">
                <h3 class="text-3xl font-bold text-primary-dark border-b border-gray-200 pb-2 mb-4">${category}</h3>
                <ul class="space-y-6">
                    ${categories[category].map(item => `
                        <li class="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
                            <div class="flex-grow">
                                <h4 class="text-xl font-semibold text-primary-dark">${item.name}</h4>
                                <p class="text-gray-600 text-sm">${item.description}</p>
                                <span class="text-lg font-bold text-accent-gold mt-2 block">$${item.price.toFixed(2)}</span>
                            </div>
                            <button onclick="window.addToCart('${item.id}', '${item.name}', ${item.price})" 
                                class="bg-accent-gold text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300">
                                + Add
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </section>
        `;
    }

    contentDiv.innerHTML = menuHtml;
    renderCart();
}

/**
 * Renders the shopping cart summary and total bill.
 * This function is called by renderCustomerMenu and by add/remove/clear cart functions.
 */
export function renderCart() {
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalSpan = document.getElementById('cart-total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const cartMessage = document.getElementById('cart-message');

    if (!cartItemsList || !cartTotalSpan || !placeOrderBtn) return;

    const items = Object.values(cart);
    let total = 0;
    
    // Clear previous content
    cartItemsList.innerHTML = '';

    if (items.length === 0) {
        cartMessage.textContent = "Your cart is empty. Start adding items!";
        cartMessage.classList.remove('hidden');
        placeOrderBtn.disabled = true;
        placeOrderBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        cartMessage.classList.add('hidden');
        items.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center text-sm border-b border-gray-600 pb-2';
            itemElement.innerHTML = `
                <span class="text-gray-300">${item.name} (x${item.quantity})</span>
                <span class="font-semibold text-white">$${subtotal.toFixed(2)}</span>
            `;
            cartItemsList.appendChild(itemElement);
        });
        placeOrderBtn.disabled = false;
        placeOrderBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    cartTotalSpan.textContent = `$${total.toFixed(2)}`;
}


// --- Chef View Rendering ---

/**
 * Renders the Kitchen Display System (KDS) view for the chef.
 * @param {Array<object>} activeOrders The list of active (New or In Progress) orders.
 */
export function renderChefView() {
    const activeOrders = orders; // Get the latest orders from state-management.js
    const contentDiv = document.getElementById('chef-content');
    if (!contentDiv) return;

    // Filter and sort orders: New first, then In Progress, oldest first
    const sortedOrders = [...activeOrders].sort((a, b) => {
        if (a.status === 'New' && b.status !== 'New') return -1;
        if (a.status !== 'New' && b.status === 'New') return 1;
        // Sort by timestamp (oldest first)
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    if (sortedOrders.length === 0) {
        contentDiv.innerHTML = '<div class="text-center py-10 text-xl font-semibold text-gray-500">No active orders right now!</div>';
        return;
    }

    let ordersHtml = sortedOrders.map(order => {
        const isNew = order.status === 'New';
        const isInProgress = order.status === 'In Progress';
        const isReady = order.status === 'Ready';
        let bgColor = '';
        let statusColor = '';
        let buttonText = '';
        let nextStatus = '';
        let nextButtonClass = '';

        if (isNew) {
            bgColor = 'bg-red-100 border-red-500';
            statusColor = 'text-red-700';
            buttonText = 'Start Cooking';
            nextStatus = 'In Progress';
            nextButtonClass = 'bg-blue-600 hover:bg-blue-700';
        } else if (isInProgress) {
            bgColor = 'bg-yellow-100 border-yellow-500';
            statusColor = 'text-yellow-700';
            buttonText = 'Mark as Ready';
            nextStatus = 'Ready';
            nextButtonClass = 'bg-green-600 hover:bg-green-700';
        } else if (isReady) {
            bgColor = 'bg-green-100 border-green-500';
            statusColor = 'text-green-700';
            buttonText = 'Mark as Completed';
            nextStatus = 'Completed';
            nextButtonClass = 'bg-gray-600 hover:bg-gray-700';
        }

        return `
            <div class="bg-white rounded-xl shadow-lg border-l-8 ${bgColor} p-5 flex flex-col justify-between h-full">
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-xl font-extrabold text-gray-900">Order #${order.displayId}</h3>
                        <span class="text-sm font-semibold px-3 py-1 rounded-full ${statusColor} bg-opacity-70">${order.status}</span>
                    </div>
                    <p class="text-xs text-gray-500 mb-4">Placed: ${new Date(order.timestamp).toLocaleTimeString()}</p>
                    
                    <ul class="list-none p-0 space-y-2">
                        ${order.items.map(item => `
                            <li class="flex justify-between text-base border-b border-gray-200 pb-1">
                                <span class="font-medium text-gray-700">${item.name}</span>
                                <span class="text-gray-600 font-bold">x${item.quantity}</span>
                            </li>
                        `).join('')}
                    </ul>
                    <p class="text-lg font-bold text-gray-800 mt-4">Total: $${order.total}</p>
                </div>

                <div class="mt-4">
                    <button onclick="window.updateOrderStatus('${order.id}', '${nextStatus}')"
                        class="w-full px-4 py-3 text-white font-bold rounded-lg shadow-md ${nextButtonClass} transition duration-200">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    contentDiv.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${ordersHtml}</div>`;
}


// --- Management View Rendering ---

/**
 * Renders the full administration view, including the current menu items.
 */
export function renderAdminView() {
    const items = menuItems;
    const contentDiv = document.getElementById('admin-items-list');
    if (!contentDiv) return;

    // Sort items alphabetically by name for easy management
    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));

    let html = `
        <div class="overflow-x-auto shadow-lg rounded-lg mt-8">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Category</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Price</th>
                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
    `;

    if (sortedItems.length === 0) {
        html += `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                    No menu items found. Use the form above to start building your menu!
                </td>
            </tr>
        `;
    } else {
        sortedItems.forEach(item => {
            html += `
                <tr class="hover:bg-gray-50 transition duration-150">
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${item.name}
                        <p class="text-xs text-gray-500 truncate">${item.description}</p>
                    </td>
                    <td class="px-4 py-3 whitespace-now-wrap text-sm text-gray-500">${item.category}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">$${item.price.toFixed(2)}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                        <button onclick="window.editItem('${item.id}')" class="text-blue-600 hover:text-blue-900 transition duration-150 font-semibold mr-3">
                            Edit
                        </button>
                        <button onclick="window.deleteMenuItem('${item.id}')" class="text-red-600 hover:text-red-900 transition duration-150 font-semibold">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    contentDiv.innerHTML = html;
}

// --- QR Code Rendering ---

/**
 * Renders the QR code for the customer link.
 */
export function renderQrCode() {
    const qrContainer = document.getElementById('qrcode-container');
    const qrLink = document.getElementById('qr-link');
    
    if (!qrContainer || !qrLink) return;

    // The base URL pointing to the customer page
    const appUrl = window.location.href.split('#')[0] + '#menu'; 

    qrContainer.innerHTML = ''; // Clear previous QR code
    
    // Check if qrcode.js is loaded (it is loaded via the HTML script tag)
    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: appUrl,
            width: 256,
            height: 256,
            colorDark : "#4b3e34",
            colorLight : "#f7f3f0",
            correctLevel : QRCode.CorrectLevel.H
        });
        qrLink.href = appUrl;
        qrLink.textContent = appUrl; // Show the full link too
    } else {
        qrContainer.innerHTML = '<p class="text-red-500">QR Code library failed to load.</p>';
    }
}
