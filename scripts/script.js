/**
 * Bravartis - Core Logic (Carrito y Drawer)
 */

// --- Application State ---
let cart = JSON.parse(localStorage.getItem('cart_items')) || [];

// --- DOM Elements ---
const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartBadge = document.getElementById('cart-badge');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Currency Formatter (Pesos Chilenos / CLP)
function formatPrice(amount) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
}

// Render Cart Drawer
function renderCart() {
    if (!cartItemsContainer || !cartBadge || !cartTotalPrice) return;

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;
    if (totalCount > 0) {
        cartBadge.classList.remove('opacity-0', 'scale-75');
        cartBadge.classList.add('opacity-100', 'scale-100');
    } else {
        cartBadge.classList.remove('opacity-100', 'scale-100');
        cartBadge.classList.add('opacity-0', 'scale-75');
    }

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <i data-lucide="shopping-bag" class="w-16 h-16 mb-4 stroke-1"></i>
                <p class="text-lg font-medium text-gray-600">Tu carrito está vacío</p>
                <p class="text-sm">Agrega algunas creaciones para comenzar</p>
            </div>
        `;
        cartTotalPrice.textContent = formatPrice(0);
        if (window.lucide) lucide.createIcons();
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center gap-4 p-3 bg-pink-50/40 rounded-xl border border-pink-100">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg flex-shrink-0">
            <div class="flex-grow">
                <h4 class="font-bold text-gray-800 text-sm leading-tight">${item.name}</h4>
                <p class="text-xs text-gray-500 mt-0.5">$${Number(item.price).toLocaleString('es-CL')}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
                <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
                <div class="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                    <button onclick="updateQuantity(${item.id}, -1)" class="px-2 py-0.5 text-gray-600 hover:bg-gray-100">-</button>
                    <span class="px-2 text-xs font-bold text-gray-800">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="px-2 py-0.5 text-gray-600 hover:bg-gray-100">+</button>
                </div>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = formatPrice(total);

    if (window.lucide) lucide.createIcons();
}

// Cart Actions
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem('cart_items', JSON.stringify(cart));
}

// UI Controls
function toggleCart(open) {
    if (!cartDrawerOverlay || !cartDrawer) return;
    if (open) {
        cartDrawerOverlay.classList.remove('opacity-0', 'pointer-events-none');
        cartDrawer.classList.remove('translate-x-full');
    } else {
        cartDrawerOverlay.classList.add('opacity-0', 'pointer-events-none');
        cartDrawer.classList.add('translate-x-full');
    }
}

function showToast(message) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}

// Event Listeners
if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => toggleCart(true));
if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
        if (e.target === cartDrawerOverlay) toggleCart(false);
    });
}

// Global Hook para sincronizar carrito desde catalog.js
window.actualizarCarritoGlobal = function() {
    cart = JSON.parse(localStorage.getItem('cart_items')) || [];
    renderCart();
};

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    if (window.lucide) lucide.createIcons();
});