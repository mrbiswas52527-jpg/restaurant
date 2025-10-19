import { db, appId } from './firebase-setup.js';
import { collection, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { menuItems } from './state-management.js';
import { renderAdminView } from './ui-updates.js';

// Define the name of the public collection for menu items
const MENU_COLLECTION_NAME = 'menu_items';

/**
 * Gets the Firestore collection reference for menu items.
 * @returns {object} The Firestore Collection Reference.
 */
const getMenuCollection = () => {
    // Path: /artifacts/{appId}/public/data/menu_items
    return collection(db, `artifacts/${appId}/public/data/${MENU_COLLECTION_NAME}`);
}

// --- Form Element References ---
const adminForm = document.getElementById('menu-item-form');
const itemNameInput = document.getElementById('admin-name');
const itemDescInput = document.getElementById('admin-description');
const itemPriceInput = document.getElementById('admin-price');
const itemCategoryInput = document.getElementById('admin-category');
const saveButton = document.getElementById('admin-form-submit-btn');

// State to track the currently edited document ID
let editingItemId = null;

// --- EVENT LISTENERS ---

/**
 * Handles the submit event for both saving a new item and updating an existing one.
 * @param {Event} e The submit event.
 */
adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = itemNameInput.value.trim();
    const description = itemDescInput.value.trim();
    const price = parseFloat(itemPriceInput.value);
    const category = itemCategoryInput.value;

    if (!name || isNaN(price) || price <= 0) {
        // REPLACED alert() with showModal()
        window.showModal('Input Error', 'Please enter a valid name and price greater than zero.');
        return;
    }

    // Prepare base item data without client-side timestamp
    const itemData = {
        name: name,
        description: description,
        price: price,
        category: category,
        // Removed: createdAt: new Date().toISOString() - Now added via serverTimestamp()
    };

    if (editingItemId) {
        // If we are editing, update the item
        await updateItem(editingItemId, itemData);
    } else {
        // Otherwise, save a new item
        await saveNewItem(itemData);
    }
});


// --- PUBLIC FUNCTIONS ---

/**
 * Saves a brand new menu item to Firestore.
 * @param {object} itemData The data object for the new item.
 */
export async function saveNewItem(itemData) {
    try {
        // ADDED serverTimestamp() for createdAt
        const finalItemData = { ...itemData, createdAt: serverTimestamp() };
        await addDoc(getMenuCollection(), finalItemData);
        console.log("New item saved successfully.");
        // REPLACED alert() with showModal() for confirmation
        window.showModal('Success', `${itemData.name} was successfully added to the menu.`);
        resetAdminForm();
    } catch (e) {
        console.error("Error adding document: ", e);
        window.showModal('Error', 'Failed to add item. Please try again.');
    }
}

/**
 * Loads an existing item's data into the form for editing.
 * @param {string} itemId The ID of the document to edit.
 */
export function editItem(itemId) {
    // Find the item in the current local state
    const itemToEdit = menuItems.find(item => item.id === itemId);
    if (itemToEdit) {
        // 1. Load data into the form fields
        itemNameInput.value = itemToEdit.name;
        itemDescInput.value = itemToEdit.description;
        itemPriceInput.value = itemToEdit.price;
        itemCategoryInput.value = itemToEdit.category;

        // 2. Set the state to 'editing' mode
        editingItemId = itemId;
        // 3. Update the button text to 'Update Item'
        saveButton.textContent = 'Update Item';
        saveButton.classList.remove('bg-gray-800');
        saveButton.classList.add('bg-blue-600');
        
        // Update form title
        document.getElementById('admin-form-title').textContent = `Edit Item: ${itemToEdit.name}`;
    }
}

/**
 * Updates an existing menu item in Firestore.
 * @param {string} itemId The ID of the document to update.
 * @param {object} itemData The new data object.
 */
export async function updateItem(itemId, itemData) {
    try {
        const itemRef = doc(db, getMenuCollection().path, itemId);
        // Add updatedAt timestamp to the update payload for tracking
        const updatePayload = { ...itemData, updatedAt: serverTimestamp() };
        await setDoc(itemRef, updatePayload, { merge: true }); 
        console.log(`Item ${itemId} updated successfully.`);
        // REPLACED alert() with showModal() for confirmation
        window.showModal('Success', `${itemData.name} was updated successfully.`);
        resetAdminForm();
    } catch (e) {
        console.error("Error updating document: ", e);
        window.showModal('Error', 'Failed to update item. Please try again.');
    }
}

/**
 * Deletes a menu item from Firestore.
 * @param {string} itemId The ID of the document to delete.
 */
export async function deleteMenuItem(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const isConfirmed = await window.showModal(
        "Confirm Deletion", 
        `Are you sure you want to permanently delete '${item ? item.name : 'this item'}'? This action is permanent.`, 
        true
    );
    
    if (isConfirmed) {
        try {
            const itemRef = doc(db, getMenuCollection().path, itemId);
            await deleteDoc(itemRef);
            console.log(`Item ${itemId} deleted successfully.`);
            window.showModal('Success', `${item ? item.name : 'Item'} deleted successfully.`);
        } catch (e) {
            console.error("Error deleting document: ", e);
            window.showModal('Error', 'Failed to delete item. Please try again.');
        }
    }
}

/**
 * Resets the form and returns it to 'save new item' mode.
 */
export function resetAdminForm() {
    adminForm.reset();
    editingItemId = null;
    // Restore the button text and style
    saveButton.textContent = 'Save Item';
    saveButton.classList.remove('bg-blue-600');
    saveButton.classList.add('bg-gray-800');
    
    // Restore form title
    document.getElementById('admin-form-title').textContent = 'Add New Item';
}

// Attach public functions to the window object so they can be called from dynamically
// created HTML elements in ui-updates.js
window.saveMenuItem = saveNewItem;
window.deleteMenuItem = deleteMenuItem;
window.editItem = editItem;
window.resetAdminForm = resetAdminForm;

