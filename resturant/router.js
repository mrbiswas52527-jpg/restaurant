import { renderCustomerMenu, renderChefView, renderAdminView, renderQrCode } from './ui-updates.js';

/**
 * Maps URL hash fragments to the corresponding HTML view element IDs and rendering functions.
 */
const routes = {
    '#menu': { viewId: 'customer-view', renderer: renderCustomerMenu },
    '#chef': { viewId: 'chef-view', renderer: renderChefView },
    '#admin': { viewId: 'admin-view', renderer: renderAdminView },
    '#qr': { viewId: 'qr-view', renderer: renderQrCode }
};

/**
 * Handles application routing based on the URL hash.
 * Hides all views and shows the one that matches the current hash, then triggers its rendering.
 */
export function updateView() {
    const hash = window.location.hash || '#menu';
    const route = routes[hash];

    // Hide all views first
    Object.values(routes).forEach(routeInfo => {
        const el = document.getElementById(routeInfo.viewId);
        if (el) el.classList.add('hidden');
    });

    // Show the target view and render its content
    if (route) {
        const targetView = document.getElementById(route.viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            // The renderer function is passed the data it needs to populate the view.
            route.renderer(); 
        }
    }
}
