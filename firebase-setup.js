<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restaurant Control Panel</title>
    <!-- Load Tailwind CSS for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Load QRCode.js for generating the customer link -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode.js/1.0.0/qrcode.min.js"></script>
    <style>
        /* Custom Tailwind Configuration and Styles */
        :root {
            --primary-dark: #1f2937; /* Gray-800 */
            --accent-gold: #f59e0b; /* Amber-500 */
            --status-new: #10b981; /* Emerald-500 */
            --status-progress: #3b82f6; /* Blue-500 */
            --status-ready: #f97316; /* Orange-500 */
        }
        .text-primary-dark { color: var(--primary-dark); }
        .bg-primary-dark { background-color: var(--primary-dark); }
        .border-primary-dark { border-color: var(--primary-dark); }
        .text-accent-gold { color: var(--accent-gold); }
        .border-accent-gold { border-color: var(--accent-gold); }
        .text-status-new { color: var(--status-new); }
        .text-status-progress { color: var(--status-progress); }
        .border-status-progress { border-color: var(--status-progress); }
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; }
        .scroll-hidden::-webkit-scrollbar { display: none; }
        .scroll-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        /* Style for the QR code container */
        #qrcode-container img { display: block; }

        /* Custom Styles for Input Focus */
        input:focus, textarea:focus, select:focus {
            border-color: var(--accent-gold) !important;
            box-shadow: 0 0 0 1px var(--accent-gold);
        }
    </style>
</head>
<body class="min-h-screen">

    <!-- Global Message Modal (replaces alert/confirm) -->
    <div id="modal-backdrop" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 id="modal-title" class="text-xl font-bold mb-4 text-primary-dark"></h3>
            <p id="modal-message" class="mb-6 text-gray-700"></p>
            <div class="flex justify-end space-x-3">
                <button id="modal-cancel-btn" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 hidden">Cancel</button>
                <button id="modal-ok-btn" class="px-4 py-2 bg-accent-gold text-white rounded-lg hover:bg-amber-600">OK</button>
            </div>
        </div>
    </div>
    
    <!-- Main Header Navigation -->
    <header id="app-header" class="bg-primary-dark shadow-lg sticky top-0 z-40">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 class="text-2xl font-extrabold text-white">Food Service App</h1>
            <nav id="nav-tabs" class="flex space-x-4">
                <button id="nav-customer" data-view="customer-view" class="py-2 px-4 rounded-lg font-semibold bg-accent-gold text-white hover:bg-amber-600 transition duration-150">Customer Menu</button>
                <button id="nav-admin" data-view="login-view" class="py-2 px-4 rounded-lg font-semibold text-gray-300 hover:text-white transition duration-150">Admin Menu</button>
                <button id="nav-chef" data-view="login-view" class="py-2 px-4 rounded-lg font-semibold text-gray-300 hover:text-white transition duration-150">Chef KDS</button>
                <button id="nav-qr" data-view="qr-view" class="py-2 px-4 rounded-lg font-semibold text-gray-300 hover:text-white transition duration-150">QR Code</button>
            </nav>
            <div id="auth-status" class="text-sm text-gray-400">Not Logged In</div>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="container mx-auto px-4 py-8">
        <!-- Loading Indicator -->
        <div id="loading-indicator" class="text-center p-10 text-xl font-semibold text-primary-dark hidden">
            <div class="animate-spin inline-block w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full"></div>
            <p class="mt-4">Loading application...</p>
        </div>

        <!-- 1. LOGIN VIEW -->
        <div id="login-view" class="flex justify-center items-start pt-20 h-full hidden">
            <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 class="text-3xl text-primary-dark font-bold mb-6 text-center">Staff Login</h2>
                <form id="login-form">
                    <div class="mb-4">
                        <label for="login-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number (Admin: 123, Chef: 456)</label>
                        <input type="tel" id="login-phone" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" placeholder="e.g., 123">
                    </div>
                    <div class="mb-6">
                        <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">Password (Any)</label>
                        <input type="password" id="login-password" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" placeholder="Enter password">
                    </div>
                    <button type="submit" class="w-full bg-primary-dark text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-800 transition duration-150 shadow-lg">
                        Log In
                    </button>
                </form>
                <p id="login-error" class="text-red-500 text-center mt-4 hidden"></p>
                <div id="staff-controls" class="mt-6 pt-4 border-t border-gray-200 hidden">
                    <p class="text-sm text-gray-600 mb-2 font-semibold">Logged in as:</p>
                    <button id="view-admin-btn" data-view="admin-view" class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-150 mb-2">Go to Admin View</button>
                    <button id="view-chef-btn" data-view="chef-view" class="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-150">Go to Chef View</button>
                    <button id="logout-btn" class="w-full mt-2 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-150">Log Out</button>
                </div>
            </div>
        </div>

        <!-- 2. CUSTOMER VIEW (The Menu) -->
        <div id="customer-view" class="hidden grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <h2 class="text-4xl text-primary-dark font-semibold border-b-2 border-accent-gold pb-3 mb-6">
                    Restaurant Menu
                </h2>
                <div id="customer-content" class="space-y-8">
                    <!-- Menu items will be rendered here -->
                    <div class="text-center text-gray-500 p-10 bg-white rounded-xl shadow-md" id="customer-menu-empty">
                        <p class="font-semibold text-lg">Menu is currently empty. Check back soon!</p>
                    </div>
                </div>
            </div>
            
            <!-- Cart Summary (Sticky on the right for desktop) -->
            <div id="cart-summary" class="lg:col-span-1 bg-primary-dark p-6 rounded-xl shadow-2xl text-white sticky top-20 h-fit max-h-[85vh] overflow-y-auto">
                <h3 class="text-3xl font-bold text-accent-gold mb-4 border-b border-gray-600 pb-2">Your Order</h3>
                
                <div class="mb-4">
                    <label for="table-id" class="block text-sm font-medium text-gray-300 mb-1">Your Table/User ID</label>
                    <input type="text" id="table-id" class="w-full p-2 rounded-lg text-primary-dark" placeholder="Table 5 or Your Name" required>
                </div>

                <div id="cart-items-list" class="space-y-3 mb-4 text-base max-h-56 overflow-y-auto scroll-hidden">
                    <p id="cart-message" class="text-gray-400">Your cart is empty. Start adding items!</p>
                </div>
                
                <div class="flex justify-between items-center pt-4 border-t border-accent-gold">
                    <span class="text-2xl font-bold">Total Bill:</span>
                    <span id="cart-total" class="text-3xl font-extrabold text-accent-gold">$0.00</span>
                </div>
                
                <button id="place-order-btn" onclick="window.placeOrder()" disabled class="w-full mt-4 bg-status-new text-white py-3 rounded-lg font-bold text-xl hover:bg-green-700 transition duration-150 shadow-lg opacity-50 cursor-not-allowed">
                    Place Order
                </button>
                <button id="clear-cart-btn" onclick="window.clearCart()" class="w-full mt-2 bg-red-600 text-white py-3 rounded-lg font-bold text-xl hover:bg-red-700 transition duration-150 shadow-lg">
                    Clear Cart
                </button>
            </div>
        </div>

        <!-- 3. CHEF KITCHEN DISPLAY SYSTEM (KDS) -->
        <div id="chef-view" class="hidden">
            <h2 class="text-4xl text-primary-dark font-semibold border-b-2 border-status-progress pb-3 mb-6">
                Chef Kitchen Display System (KDS)
            </h2>
            <div id="chef-status-message" class="text-center text-primary-dark font-semibold p-3 mb-4 hidden"></div>
            <div id="chef-content" class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <!-- Orders will be rendered here -->
                <div class="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-gray-500 p-10 bg-white rounded-xl shadow-md" id="chef-orders-empty">
                    <p class="font-semibold text-xl">No new orders at the moment. Enjoy the break!</p>
                </div>
            </div>
        </div>

        <!-- 4. ADMIN MENU MANAGEMENT EDITOR -->
        <div id="admin-view" class="hidden grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
                <h2 class="text-4xl text-primary-dark font-semibold border-b-2 border-primary-dark pb-3 mb-8">
                    Menu Management Editor
                </h2>
                
                <div class="bg-white p-6 rounded-xl shadow-lg mb-8 sticky top-20">
                    <h3 id="admin-form-title" class="text-2xl font-bold text-primary-dark mb-4">Add New Item</h3>
                    <form id="admin-form" onsubmit="window.saveMenuItem(event)">
                        <input type="hidden" id="admin-item-id">
                        
                        <div class="mb-4">
                            <label for="admin-item-name" class="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" id="admin-item-name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                        </div>

                        <div class="mb-4">
                            <label for="admin-item-description" class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="admin-item-description" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows="3"></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label for="admin-item-price" class="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input type="number" id="admin-item-price" required min="0.01" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                            </div>
                            <div>
                                <label for="admin-item-category" class="block text-sm font-medium text-gray-700">Category</label>
                                <select id="admin-item-category" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white">
                                    <option value="" disabled selected>Select Category</option>
                                    <option value="appetizers">Appetizers</option>
                                    <option value="main-courses">Main Courses</option>
                                    <option value="desserts">Desserts</option>
                                    <option value="beverages">Beverages</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" id="admin-save-btn" class="w-full bg-primary-dark text-white py-3 rounded-lg font-bold text-xl hover:bg-gray-800 transition duration-150 shadow-lg">
                            Save Item
                        </button>
                        <button type="button" onclick="window.resetAdminForm()" class="w-full mt-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold text-xl hover:bg-gray-300 transition duration-150 shadow-lg">
                            Clear/Cancel Edit
                        </button>
                    </form>
                </div>
            </div>

            <!-- Menu List -->
            <div class="lg:col-span-2">
                <div class="bg-white p-6 rounded-xl shadow-lg">
                    <h3 class="text-2xl font-bold text-primary-dark mb-4 border-b border-gray-200 pb-2">Current Menu Items</h3>
                    <div id="admin-items-list" class="space-y-4">
                        <!-- Menu items will be rendered here for editing/deleting -->
                        <div class="text-center text-gray-500 p-10" id="admin-menu-empty">
                            <p class="font-semibold text-lg">No menu items found. Add one above!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 5. QR CODE VIEW -->
        <div id="qr-view" class="hidden text-center bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto">
            <h2 class="text-4xl text-primary-dark font-semibold border-b-2 border-accent-gold pb-3 mb-8">
                Customer Scan Code
            </h2>
            <p class="text-gray-700 mb-6">Scan this code to immediately access the Customer Menu.</p>
            
            <div id="qrcode-container" class="mx-auto p-4 inline-block bg-white rounded-lg shadow-xl border-8 border-accent-gold">
                <!-- QR Code will be generated here -->
            </div>
            
            <a id="qr-link" href="#" target="_blank" class="mt-8 inline-block text-lg font-bold text-blue-600 hover:text-blue-800 transition">
                Direct Link to Customer Menu
            </a>
        </div>
    </main>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, serverTimestamp, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        
        // --- GLOBAL VARIABLES & FIREBASE INITIALIZATION ---

        // Firebase Fallback Configuration (using the keys you provided)
        const localFirebaseConfigPlaceholder = {
            apiKey: "AIzaSyARDiRKdMPruNamb50HJUb_B8bPWrYmK24",
            authDomain: "resturant-ef4ad.firebaseapp.com",
            projectId: "resturant-ef4ad",
            storageBucket: "resturant-ef4ad.firebasestorage.app",
            messagingSenderId: "458014795991",
            appId: "1:458014795991:web:d159552312427fe9e4e892",
            // measurementId:"G-LJLHJM8RPL" // Removed as we don't import getAnalytics
        };

        // Prioritize the Canvas environment variable. If missing, use the local fallback.
        let rawConfig = typeof __firebase_config !== 'undefined' ? __firebase_config : JSON.stringify(localFirebaseConfigPlaceholder);
        const firebaseConfig = JSON.parse(rawConfig);
        
        // Use projectId as app ID fallback if __app_id is missing
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        let app, db, auth;
        let currentUserId = null;
        let isAuthenticated = false;
        let menuItems = [];
        let cartItems = [];
        
        // Firestore paths
        const MENU_COLLECTION_PATH = `artifacts/${appId}/public/data/menuItems`;
        const ORDERS_COLLECTION_PATH = `artifacts/${appId}/public/data/orders`;

        // UI Elements
        const views = {
            'login-view': document.getElementById('login-view'),
            'customer-view': document.getElementById('customer-view'),
            'admin-view': document.getElementById('admin-view'),
            'chef-view': document.getElementById('chef-view'),
            'qr-view': document.getElementById('qr-view')
        };
        const loginForm = document.getElementById('login-form');
        const customerContent = document.getElementById('customer-content');
        const customerMenuEmpty = document.getElementById('customer-menu-empty');
        const adminItemsList = document.getElementById('admin-items-list');
        const adminMenuEmpty = document.getElementById('admin-menu-empty');
        const chefContent = document.getElementById('chef-content');
        const chefOrdersEmpty = document.getElementById('chef-orders-empty');
        const cartTotalSpan = document.getElementById('cart-total');
        const cartItemsList = document.getElementById('cart-items-list');
        const placeOrderBtn = document.getElementById('place-order-btn');
        const tableIdInput = document.getElementById('table-id');
        const navTabs = document.getElementById('nav-tabs');
        const authStatusDiv = document.getElementById('auth-status');
        const loadingIndicator = document.getElementById('loading-indicator');
        
        // Modal elements
        const modalBackdrop = document.getElementById('modal-backdrop');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalOkBtn = document.getElementById('modal-ok-btn');
        const modalCancelBtn = document.getElementById('modal-cancel-btn');

        // --- UTILITY FUNCTIONS ---

        // Custom Modal Function (replaces alert/confirm)
        function showModal(title, message, isConfirm = false) {
            return new Promise((resolve) => {
                modalTitle.textContent = title;
                modalMessage.textContent = message;
                modalBackdrop.classList.remove('hidden');
                modalBackdrop.classList.add('flex');
                
                // Reset listeners
                modalOkBtn.onclick = null;
                modalCancelBtn.onclick = null;

                if (isConfirm) {
                    modalCancelBtn.classList.remove('hidden');
                    modalOkBtn.textContent = 'Confirm';
                    
                    modalOkBtn.onclick = () => {
                        modalBackdrop.classList.add('hidden');
                        modalBackdrop.classList.remove('flex');
                        resolve(true);
                    };
                    modalCancelBtn.onclick = () => {
                        modalBackdrop.classList.add('hidden');
                        modalBackdrop.classList.remove('flex');
                        resolve(false);
                    };
                } else {
                    modalCancelBtn.classList.add('hidden');
                    modalOkBtn.textContent = 'OK';
                    
                    modalOkBtn.onclick = () => {
                        modalBackdrop.classList.add('hidden');
                        modalBackdrop.classList.remove('flex');
                        resolve(true);
                    };
                }
            });
        }

        // --- AUTHENTICATION & VIEW MANAGEMENT ---

        async function setupFirebase() {
            // Check if the configuration is completely unusable (even the fallback failed)
            if (Object.keys(firebaseConfig).length === 0 || !firebaseConfig.projectId) {
                 // The error message is now contained here, only fired if initialization is genuinely impossible.
                 showModal("Firebase Error", "Firebase configuration is missing. Data persistence will not work. Please ensure the hosting environment is configured correctly.");
                 loadingIndicator.classList.add('hidden');
                 switchView('customer-view');
                 return; // Stop execution if config is missing
            }

            try {
                // setLogLevel('debug'); // Enable for debugging
                app = initializeApp(firebaseConfig);
                db = getFirestore(app);
                auth = getAuth(app);

                // Sign in using the initial custom token or anonymously
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
                
                onAuthStateChanged(auth, (user) => {
                    if (user) {
                        currentUserId = user.uid;
                        authStatusDiv.textContent = `User ID: ${currentUserId.substring(0, 8)}...`;
                        isAuthenticated = true;
                        initRealtimeListeners(); // Start listening for data once authenticated
                        generateQRCode(window.location.href.split('#')[0] + '#customer-view');
                    } else {
                        currentUserId = 'anonymous-' + crypto.randomUUID();
                        authStatusDiv.textContent = 'Not Logged In';
                        isAuthenticated = false;
                        // For customer view, we use the random UUID as a session ID
                    }
                    loadingIndicator.classList.add('hidden');
                    // Default to customer view on load
                    switchView('customer-view'); 
                });

            } catch (error) {
                console.error("Firebase setup failed:", error);
                showModal("Setup Error", `Could not initialize Firebase. Check console for details: ${error.message}`);
                loadingIndicator.classList.add('hidden');
                switchView('customer-view'); // Still allow customer view even on error
            }
        }
        
        window.switchView = (viewId) => {
            const isStaffView = ['admin-view', 'chef-view'].includes(viewId);
            const currentView = document.querySelector('.main-view:not(.hidden)');
            
            // Hide all views
            Object.values(views).forEach(v => v.classList.add('hidden'));

            // Reset navigation button styles
            document.querySelectorAll('#nav-tabs button').forEach(btn => {
                btn.classList.remove('bg-accent-gold', 'text-white');
                btn.classList.add('text-gray-300');
            });

            // Handle Protected Views
            if (isStaffView && !isAuthenticated) {
                // If trying to access protected view, redirect to login
                views['login-view'].classList.remove('hidden');
                document.getElementById('staff-controls').classList.add('hidden'); // Hide controls initially
                document.getElementById('nav-admin').dataset.view = 'login-view';
                document.getElementById('nav-chef').dataset.view = 'login-view';
                
                // Highlight the login button corresponding to the intended view
                const navBtn = document.getElementById(`nav-${viewId.split('-')[0]}`);
                navBtn.classList.add('bg-accent-gold', 'text-white');
                navBtn.classList.remove('text-gray-300');
                navBtn.dataset.targetView = viewId; // Store intended view
                
                return;
            }
            
            // Show the requested view
            const targetView = views[viewId];
            if (targetView) {
                targetView.classList.remove('hidden');
                
                // Highlight the active navigation button
                const navBtn = document.getElementById(`nav-${viewId.split('-')[0]}`);
                if (navBtn) {
                    navBtn.classList.add('bg-accent-gold', 'text-white');
                    navBtn.classList.remove('text-gray-300');
                }
            }
            
            // Special handling for QR view (re-generate the code)
            if (viewId === 'qr-view' && isAuthenticated) {
                generateQRCode(window.location.href.split('#')[0] + '#customer-view');
            }
        };

        window.handleLogin = (e) => {
            e.preventDefault();
            const phone = document.getElementById('login-phone').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            const staffControls = document.getElementById('staff-controls');
            const targetView = document.querySelector('[data-target-view]')?.dataset.targetView;
            
            errorDiv.classList.add('hidden');

            // --- Mock Authentication ---
            let role = null;
            if (phone === '123' && password === 'admin') {
                role = 'admin';
            } else if (phone === '456' && password === 'chef') {
                role = 'chef';
            } else {
                errorDiv.textContent = 'Invalid phone number or password. Try 123/admin or 456/chef.';
                errorDiv.classList.remove('hidden');
                return;
            }

            // Simulate successful login state changes
            isAuthenticated = true;
            authStatusDiv.textContent = `Logged in as: ${role.toUpperCase()}`;
            
            // Show controls and set view buttons for easy switching
            staffControls.classList.remove('hidden');
            
            document.getElementById('view-admin-btn').dataset.role = 'admin';
            document.getElementById('view-chef-btn').dataset.role = 'chef';
            
            document.getElementById('nav-admin').dataset.view = 'admin-view';
            document.getElementById('nav-chef').dataset.view = 'chef-view';
            
            // Redirect to the originally intended view or Admin by default
            const nextView = targetView || (role === 'admin' ? 'admin-view' : 'chef-view');
            switchView(nextView);
        };
        loginForm.addEventListener('submit', window.handleLogin);
        
        document.getElementById('logout-btn').onclick = async () => {
            if (auth) {
                await signOut(auth); // Sign out of Firebase
            }
            isAuthenticated = false;
            document.getElementById('login-form').reset();
            document.getElementById('staff-controls').classList.add('hidden');
            document.getElementById('nav-admin').dataset.view = 'login-view';
            document.getElementById('nav-chef').dataset.view = 'login-view';
            showModal("Logged Out", "You have been successfully logged out.");
            switchView('customer-view'); // Redirect to public view
        };
        
        // Add event listeners for the staff view buttons in the login pane
        document.getElementById('staff-controls').addEventListener('click', (e) => {
            if (e.target.dataset.view) {
                window.switchView(e.target.dataset.view);
            }
        });
        
        // Add event listeners for the main navigation tabs
        navTabs.addEventListener('click', (e) => {
            if (e.target.dataset.view) {
                window.switchView(e.target.dataset.view);
            }
        });

        // --- REALTIME DATA LISTENERS ---

        function initRealtimeListeners() {
            if (!db) return;

            // 1. Menu Items Listener (for Customer and Admin)
            onSnapshot(collection(db, MENU_COLLECTION_PATH), (snapshot) => {
                menuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                window.renderCustomerMenu(menuItems);
                window.renderAdminMenu(menuItems);
                console.log("Menu items updated:", menuItems.length);
            }, (error) => {
                console.error("Error listening to menu items:", error);
                showModal("Data Error", "Failed to fetch menu items in real-time.");
            });

            // 2. Orders Listener (for Chef)
            const ordersQuery = query(collection(db, ORDERS_COLLECTION_PATH));
            onSnapshot(ordersQuery, (snapshot) => {
                const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                window.renderChefOrders(orders);
                console.log("Orders updated:", orders.length);
            }, (error) => {
                console.error("Error listening to orders:", error);
                showModal("Data Error", "Failed to fetch orders in real-time.");
            });
        }

        // --- ADMIN MENU MANAGEMENT FUNCTIONS ---

        window.renderAdminMenu = (items) => {
            adminItemsList.innerHTML = '';
            adminMenuEmpty.classList.toggle('hidden', items.length > 0);

            items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)).forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200';
                itemEl.innerHTML = `
                    <div>
                        <p class="text-lg font-bold text-primary-dark">${item.name}</p>
                        <p class="text-sm text-gray-600">${item.category.charAt(0).toUpperCase() + item.category.slice(1)} | $${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex space-x-3">
                        <button onclick="window.editMenuItem('${item.id}')" class="text-blue-600 hover:text-blue-800 font-semibold transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-1.88 5.617L3 16.5V13.5l8.69-8.69 2.828 2.828z" />
                            </svg>
                        </button>
                        <button onclick="window.deleteMenuItem('${item.id}')" class="text-red-600 hover:text-red-800 font-semibold transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                `;
                adminItemsList.appendChild(itemEl);
            });
        };

        window.resetAdminForm = () => {
            document.getElementById('admin-form').reset();
            document.getElementById('admin-item-id').value = '';
            document.getElementById('admin-form-title').textContent = 'Add New Item';
            document.getElementById('admin-save-btn').textContent = 'Save Item';
        };

        window.editMenuItem = (itemId) => {
            const item = menuItems.find(i => i.id === itemId);
            if (item) {
                document.getElementById('admin-item-id').value = item.id;
                document.getElementById('admin-item-name').value = item.name;
                document.getElementById('admin-item-description').value = item.description;
                document.getElementById('admin-item-price').value = item.price;
                document.getElementById('admin-item-category').value = item.category;

                document.getElementById('admin-form-title').textContent = `Editing: ${item.name}`;
                document.getElementById('admin-save-btn').textContent = 'Update Item';

                // Scroll to the form
                document.getElementById('admin-form-title').scrollIntoView({ behavior: 'smooth' });
            }
        };

        window.deleteMenuItem = async (itemId) => {
            const item = menuItems.find(i => i.id === itemId);
            if (!item) return;

            const isConfirmed = await showModal("Confirm Deletion", `Are you sure you want to permanently delete '${item.name}'?`, true);
            if (!isConfirmed) return;

            try {
                if (db) await deleteDoc(doc(db, MENU_COLLECTION_PATH, itemId));
                showModal("Success", `${item.name} was successfully deleted.`);
                window.resetAdminForm();
            } catch (error) {
                console.error("Error deleting document: ", error);
                showModal("Error", "Failed to delete item. Please try again.");
            }
        };

        window.saveMenuItem = async (e) => {
            e.preventDefault();
            
            if (!db) return showModal("Database Error", "Cannot save. Firebase is not initialized due to missing configuration.");

            const itemId = document.getElementById('admin-item-id').value;
            const itemData = {
                name: document.getElementById('admin-item-name').value,
                description: document.getElementById('admin-item-description').value,
                price: parseFloat(document.getElementById('admin-item-price').value),
                category: document.getElementById('admin-item-category').value,
                updatedAt: serverTimestamp()
            };

            try {
                if (itemId) {
                    // Update existing item
                    await updateDoc(doc(db, MENU_COLLECTION_PATH, itemId), itemData);
                    showModal("Success", `${itemData.name} was updated successfully.`);
                } else {
                    // Add new item
                    itemData.createdAt = serverTimestamp();
                    await addDoc(collection(db, MENU_COLLECTION_PATH), itemData);
                    showModal("Success", `${itemData.name} was added to the menu.`);
                }
                window.resetAdminForm();
            } catch (error) {
                console.error("Error saving document: ", error);
                showModal("Error", "Failed to save item. Please check the data and try again.");
            }
        };

        // --- CUSTOMER MENU & ORDERING FUNCTIONS ---

        window.renderCustomerMenu = (items) => {
            customerContent.innerHTML = '';
            const categories = items.reduce((acc, item) => {
                (acc[item.category] = acc[item.category] || []).push(item);
                return acc;
            }, {});

            customerMenuEmpty.classList.toggle('hidden', items.length > 0);

            for (const category in categories) {
                const categorySection = document.createElement('div');
                categorySection.innerHTML = `
                    <h3 class="text-3xl font-bold text-primary-dark mb-4 border-b border-gray-300 pb-2">${category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
                    <div class="space-y-4">
                        ${categories[category].sort((a, b) => a.name.localeCompare(b.name)).map(item => `
                            <div class="flex justify-between items-center p-4 bg-white rounded-xl shadow-md transition duration-200 hover:shadow-lg">
                                <div>
                                    <p class="text-xl font-semibold text-primary-dark">${item.name}</p>
                                    <p class="text-sm text-gray-500">${item.description}</p>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <span class="text-2xl font-extrabold text-accent-gold">$${item.price.toFixed(2)}</span>
                                    <button onclick="window.addToCart('${item.id}')" class="bg-status-new text-white p-2 rounded-full shadow-md hover:bg-green-700 transition duration-150">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                customerContent.appendChild(categorySection);
            }
        };

        window.addToCart = (itemId) => {
            const item = menuItems.find(i => i.id === itemId);
            if (!item) return;

            const existingItem = cartItems.find(c => c.id === itemId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({ ...item, quantity: 1 });
            }
            window.updateCartDisplay();
        };

        window.removeFromCart = (itemId) => {
            const existingItemIndex = cartItems.findIndex(c => c.id === itemId);
            if (existingItemIndex > -1) {
                const existingItem = cartItems[existingItemIndex];
                existingItem.quantity -= 1;
                if (existingItem.quantity <= 0) {
                    cartItems.splice(existingItemIndex, 1);
                }
            }
            window.updateCartDisplay();
        };
        
        window.clearCart = () => {
            cartItems = [];
            window.updateCartDisplay();
            showModal("Cart Cleared", "Your order basket has been emptied.");
        };

        window.updateCartDisplay = () => {
            let total = 0;
            cartItemsList.innerHTML = '';

            if (cartItems.length === 0) {
                cartItemsList.innerHTML = '<p id="cart-message" class="text-gray-400">Your cart is empty. Start adding items!</p>';
                placeOrderBtn.disabled = true;
                placeOrderBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                placeOrderBtn.disabled = false;
                placeOrderBtn.classList.remove('opacity-50', 'cursor-not-allowed');

                cartItems.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    
                    const cartItemEl = document.createElement('div');
                    cartItemEl.className = 'flex justify-between items-center bg-gray-700 p-3 rounded-lg';
                    cartItemEl.innerHTML = `
                        <div class="flex-grow">
                            <span class="text-white font-semibold">${item.name}</span>
                            <span class="text-sm text-gray-400 block">$${item.price.toFixed(2)} ea.</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="window.removeFromCart('${item.id}')" class="text-red-400 hover:text-red-500 font-bold text-xl leading-none">-</button>
                            <span class="font-bold text-accent-gold">${item.quantity}</span>
                            <button onclick="window.addToCart('${item.id}')" class="text-status-new hover:text-green-500 font-bold text-xl leading-none">+</button>
                        </div>
                    `;
                    cartItemsList.appendChild(cartItemEl);
                });
            }
            cartTotalSpan.textContent = `$${total.toFixed(2)}`;
        };

        window.placeOrder = async () => {
            if (cartItems.length === 0) return showModal("Order Error", "Your cart is empty. Add items before placing an order.");
            const tableId = tableIdInput.value.trim();
            if (!tableId) return showModal("Order Error", "Please enter your Table/User ID before placing the order.");

            if (!db) return showModal("Database Error", "Cannot place order. Firebase is not initialized due to missing configuration.");


            const total = parseFloat(cartTotalSpan.textContent.replace('$', ''));
            
            const isConfirmed = await showModal("Confirm Order", `Total: $${total.toFixed(2)}. Place order for Table/User: ${tableId}?`, true);
            if (!isConfirmed) return;

            const orderData = {
                tableId: tableId,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                })),
                total: total,
                status: 'New', // New, Preparing, Ready
                createdAt: serverTimestamp()
            };

            try {
                await addDoc(collection(db, ORDERS_COLLECTION_PATH), orderData);
                showModal("Order Placed!", `Your order (Table/User: ${tableId}) has been sent to the kitchen. Total: $${total.toFixed(2)}.`);
                window.clearCart();
                tableIdInput.value = '';
            } catch (error) {
                console.error("Error placing order: ", error);
                showModal("Order Error", "Failed to place order. Please try again.");
            }
        };

        // --- CHEF KDS FUNCTIONS ---

        window.renderChefOrders = (orders) => {
            chefContent.innerHTML = '';
            
            // Sort: New first, then Preparing, then by oldest (createdAt)
            const sortedOrders = orders.sort((a, b) => {
                const statusOrder = { 'New': 1, 'Preparing': 2, 'Ready': 3 };
                
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                
                // Sort by time (oldest first for the same status)
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeA - timeB;
            });

            chefOrdersEmpty.classList.toggle('hidden', orders.length > 0);

            sortedOrders.forEach(order => {
                let statusColor, nextStatus, nextBtnText;

                switch (order.status) {
                    case 'New':
                        statusColor = 'bg-status-new border-status-new';
                        nextStatus = 'Preparing';
                        nextBtnText = 'Start Preparing';
                        break;
                    case 'Preparing':
                        statusColor = 'bg-status-progress border-status-progress';
                        nextStatus = 'Ready';
                        nextBtnText = 'Mark as Ready';
                        break;
                    case 'Ready':
                        statusColor = 'bg-status-ready border-status-ready';
                        nextStatus = 'Done';
                        nextBtnText = 'Clear (Served)';
                        break;
                    default:
                        statusColor = 'bg-gray-500 border-gray-500';
                        nextStatus = 'New';
                        nextBtnText = 'Reset Status';
                }

                const orderTime = order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString() : 'N/A';
                
                const orderEl = document.createElement('div');
                orderEl.className = `p-5 rounded-xl shadow-lg border-t-8 ${statusColor} bg-white flex flex-col justify-between`;
                orderEl.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-3xl font-extrabold text-primary-dark">#${order.tableId}</span>
                            <span class="text-sm font-medium text-gray-500">${orderTime}</span>
                        </div>
                        <div class="mb-4">
                            <span class="inline-block text-xl font-bold px-3 py-1 rounded-full text-white ${statusColor.replace('border', 'bg')}">${order.status}</span>
                        </div>
                        <ul class="space-y-2 border-t pt-4 border-gray-200">
                            ${order.items.map(item => `
                                <li class="flex justify-between text-base">
                                    <span class="font-semibold text-primary-dark">${item.name}</span>
                                    <span class="font-bold text-accent-gold">${item.quantity}x</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="mt-6 pt-4 border-t border-gray-200">
                        <p class="text-xl font-bold text-gray-800 mb-2">Total: $${order.total.toFixed(2)}</p>
                        ${order.status !== 'Done' ? `
                            <button onclick="window.updateOrderStatus('${order.id}', '${nextStatus}')" class="w-full text-white py-3 rounded-lg font-bold text-lg transition duration-150 shadow-md ${statusColor.replace('border', 'bg') === 'bg-gray-500' ? 'bg-gray-600 hover:bg-gray-700' : statusColor.replace('border', 'bg') + ' hover:opacity-90'}">
                                ${nextBtnText}
                            </button>
                        ` : `
                            <button onclick="window.updateOrderStatus('${order.id}', 'delete')" class="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition duration-150 shadow-md">
                                Clear Order (Served)
                            </button>
                        `}
                    </div>
                `;
                chefContent.appendChild(orderEl);
            });
        };

        window.updateOrderStatus = async (orderId, newStatus) => {
            if (!db) return showModal("Database Error", "Cannot update status. Firebase is not initialized due to missing configuration.");

            try {
                if (newStatus === 'Done' || newStatus === 'delete') {
                    // Permanently delete the order (mark as served/complete)
                    await deleteDoc(doc(db, ORDERS_COLLECTION_PATH, orderId));
                } else {
                    await updateDoc(doc(db, ORDERS_COLLECTION_PATH, orderId), {
                        status: newStatus,
                        updatedAt: serverTimestamp()
                    });
                }
            } catch (error) {
                console.error("Error updating order status: ", error);
                showModal("Error", `Failed to update order status to ${newStatus}.`);
            }
        };

        // --- QR CODE GENERATION ---
        
        function generateQRCode(url) {
            const container = document.getElementById('qrcode-container');
            const qrLink = document.getElementById('qr-link');
            qrLink.href = url;
            
            // Clear previous QR code if exists
            container.innerHTML = ''; 

            if (typeof QRCode !== 'undefined') {
                 new QRCode(container, {
                    text: url,
                    width: 200,
                    height: 200,
                    colorDark : "#1f2937", // primary-dark
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            } else {
                container.innerHTML = '<p class="text-red-500">QR Code library not loaded.</p>';
            }
        }

        // --- INITIALIZATION ---
        
        window.onload = () => {
            loadingIndicator.classList.remove('hidden');
            setupFirebase();
            window.updateCartDisplay(); // Initialize cart display
        };
    </script>
</body>
</html>
