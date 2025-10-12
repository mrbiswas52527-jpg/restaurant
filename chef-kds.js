import { db, appId } from './firebase-setup.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * Updates the status of an order in the database.
 * Attached to window.updateOrderStatus for HTML access.
 */
async function updateOrderStatus(orderId, currentStatus) {
    if (!db) return console.error("Database not initialized.");

    let newStatus;
    let statusMessage;

    // Determine the next status in the workflow
    switch (currentStatus) {
        case 'New':
            newStatus = 'In Progress';
            statusMessage = 'Started preparation.';
            break;
        case 'In Progress':
            newStatus = 'Ready';
            statusMessage = 'Order is ready for pickup/delivery.';
            break;
        case 'Ready':
            newStatus = 'Completed';
            statusMessage = 'Order marked as completed.';
            break;
        default:
            return;
    }

    try {
        const docRef = doc(db, `artifacts/${appId}/public/data/orders`, orderId);
        // Use merge: true to only update the status field
        await setDoc(docRef, { status: newStatus }, { merge: true }); 
        
        document.getElementById('chef-status-message').textContent = `Order ${orderId.substring(0, 8)}: ${statusMessage}`;
        setTimeout(() => document.getElementById('chef-status-message').textContent = '', 3000);
    } catch (e) {
        console.error("Error updating order status: ", e);
        document.getElementById('chef-status-message').textContent = `Error updating order: ${e.message}`;
    }
}

// Export and attach to window for access from index.html onclick events
window.updateOrderStatus = updateOrderStatus;

