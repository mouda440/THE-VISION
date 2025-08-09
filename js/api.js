// API utility for backend integration
const API_BASE = 'https://back-end-vision.onrender.com/api';

// --- Admin Auth ---
let adminToken = localStorage.getItem('adminToken') || '';
function setAdminToken(token) {
    adminToken = token;
    localStorage.setItem('adminToken', token);
}
function clearAdminToken() {
    adminToken = '';
    localStorage.removeItem('adminToken');
}
async function adminLoginAPI(username, password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (result.success && result.token) setAdminToken(result.token);
    return result;
}
async function changeAdminCredentialsAPI(username, password) {
    const res = await fetch(`${API_BASE}/admin/change-credentials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ username, password })
    });
    return await res.json();
}

// Stocks
async function fetchStocks() {
    const res = await fetch(`${API_BASE}/stocks`);
    return await res.json();
}
async function setStocksAPI(stocks) {
    const res = await fetch(`${API_BASE}/stocks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify(stocks)
    });
    return await res.json();
}

// Orders
async function fetchOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    return await res.json();
}
async function addOrderAPI(order) {
    const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    return await res.json();
}
async function deleteOrderAPI(index) {
    const res = await fetch(`${API_BASE}/orders/${index}`, {
        method: 'DELETE',
        headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    });
    return await res.json();
}

// Products
async function fetchProducts() {
    const res = await fetch(`${API_BASE}/products`);
    return await res.json();
}
async function saveProductAPI(product) {
    const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify(product)
    });
    const result = await res.json();

    // --- Sync stocks for new/updated products ---
    if (result.success && product.stock) {
        // Fetch current stocks
        let stocks = await fetchStocks();
        if (!stocks) stocks = {};

        // Use the returned id for new products
        let prodId = product.id || result.id;

        // --- Patch: Remove old stock for this product if it exists ---
        // Remove old stock for this product id (for non-tshirt/jort)
        if (prodId && stocks[prodId]) {
            delete stocks[prodId];
        }

        if (product.type === 'tshirt') {
            if (!stocks.tshirt) stocks.tshirt = {};
            // Remove styles not present anymore
            for (const style in stocks.tshirt) {
                if (!product.stock[style]) delete stocks.tshirt[style];
            }
            for (const style in product.stock) {
                stocks.tshirt[style] = { ...product.stock[style] };
            }
        } else if (product.type === 'jort') {
            if (!stocks.jort) stocks.jort = {};
            // Remove sizes not present anymore
            for (const size in stocks.jort) {
                if (!product.stock[size]) delete stocks.jort[size];
            }
            for (const size in product.stock) {
                stocks.jort[size] = product.stock[size];
            }
        } else {
            // For other products, store by product id
            if (!prodId) {
                prodId = Math.random().toString(36).slice(2, 10);
            }
            stocks[prodId] = { ...product.stock };
        }

        await setStocksAPI(stocks);
    }
    return result;
}
async function deleteProductAPI(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    });
    return await res.json();
}

// Expose API functions to window for global access
window.fetchStocks = fetchStocks;
window.setStocksAPI = setStocksAPI;
window.fetchOrders = fetchOrders;
window.addOrderAPI = addOrderAPI;
window.deleteOrderAPI = deleteOrderAPI;
window.fetchProducts = fetchProducts;
window.saveProductAPI = saveProductAPI;
window.deleteProductAPI = deleteProductAPI;
window.adminLoginAPI = adminLoginAPI;
window.changeAdminCredentialsAPI = changeAdminCredentialsAPI;
window.setAdminToken = setAdminToken;
window.clearAdminToken = clearAdminToken;
window.deleteOrderAPI = deleteOrderAPI;
window.fetchProducts = fetchProducts;
window.saveProductAPI = saveProductAPI;
window.deleteProductAPI = deleteProductAPI;
window.adminLoginAPI = adminLoginAPI;
window.changeAdminCredentialsAPI = changeAdminCredentialsAPI;
window.setAdminToken = setAdminToken;
window.clearAdminToken = clearAdminToken;
window.fetchAuditLogsAPI = fetchAuditLogsAPI;
