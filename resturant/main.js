import { initializeFirebase } from './firebase-setup.js';
import { updateView } from './router.js';

/**
 * Main application initializer.
 * Runs once the HTML document is loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Firebase and get connection details (db, userId)
    await initializeFirebase();
    
    // 2. Set up initial routing and view
    updateView();

    // 3. Set up event listener for hash changes (for internal navigation)
    window.addEventListener('hashchange', updateView);
});
