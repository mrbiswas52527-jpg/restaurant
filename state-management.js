import { collection, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { renderCustomerMenu, renderChefView, renderAdminView } from './ui-updates.js';

// --- Global Data Stores ---

// Stores all menu items fetched from Firestore
export let menuItems = [];

// Stores all orders fetched from Firestore (only active ones)
export let orders = [];

// --- Real-time Listener Setup ---

/**
 * Initializes real-time listeners for both Menu Items and Orders.
 * This function is called once the Firebase connection and authentication are complete.
 * @param {object} db The Firestore database instance.
 * @param {string} appId The unique application ID for pathing.
 */
export function setupRealtimeListeners(db, appId) {
    // 1. Menu Items Listener
    setupMenuListener(db, appId);

    // 2. Orders Listener
    setupOrdersListener(db, appId);
}

/**
 * Sets up the real-time listener for the menu items collection.
 * @param {object} db The Firestore database instance.
 * @param {string} appId The unique application ID.
 */
function setupMenuListener(db, appId) {
    // Path: /artifacts/{appId}/public/data/menu_items
    const menuCollectionRef = collection(db, `artifacts/${appId}/public/data/menu_items`);

    onSnapshot(menuCollectionRef, (snapshot) => {
        menuItems = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Trigger updates across all views that rely on menu items
        renderCustomerMenu(menuItems);
        renderAdminView(menuItems);
        
        console.log(`[Firestore] Menu items updated: ${menuItems.length} items loaded.`);
    }, (error) => {
        console.error("Error setting up menu listener:", error);
    });
}

/**
 * Sets up the real-time listener for the orders collection.
 * It filters for only 'New' and 'In Progress' orders (KDS view).
 * @param {object} db The Firestore database instance.
 * @param {string} appId The unique application ID.
 */
function setupOrdersListener(db, appId) {
    // Path: /artifacts/{appId}/public/data/orders
    const ordersCollectionRef = collection(db, `artifacts/${appId}/public/data/orders`);

    // Create a query to only fetch orders that are 'New' or 'In Progress'
    // This is the Kitchen Display System (KDS) view
    const q = query(
        ordersCollectionRef, 
        where('status', 'in', ['New', 'In Progress', 'Ready'])
    );

    onSnapshot(q, (snapshot) => {
        orders = snapshot.docs.map((doc, index) => ({
            id: doc.id,
            displayId: index + 1, // Simple sequential ID for the chef's view (not permanent)
            ...doc.data()
        }));
        
        // Trigger update for the Chef View
        renderChefView(orders);
        
        console.log(`[Firestore] Active orders updated: ${orders.length} orders loaded.`);
    }, (error) => {
        console.error("Error setting up orders listener:", error);
    });
}
