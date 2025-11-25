const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let currentUser = null;
let isLoginMode = true;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    loadUserData();
  } else {
    showPage('auth');
  }

  // Auth form handler
  document.getElementById('auth-form').addEventListener('submit', handleAuth);
  document.getElementById('profile-form').addEventListener('submit', updateProfile);
  document.getElementById('add-product-form').addEventListener('submit', addProduct);
});

// Auth functions
function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  const title = document.getElementById('auth-title');
  const submit = document.getElementById('auth-submit');
  const toggle = document.getElementById('auth-toggle');

  if (isLoginMode) {
    title.textContent = 'Bejelentkezés';
    submit.textContent = 'Bejelentkezés';
    toggle.innerHTML = 'Nincs fiókod? <a href="#" onclick="toggleAuthMode()">Regisztráció</a>';
  } else {
    title.textContent = 'Regisztráció';
    submit.textContent = 'Regisztráció';
    toggle.innerHTML = 'Van már fiókod? <a href="#" onclick="toggleAuthMode()">Bejelentkezés</a>';
  }
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

  try {
    const response = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      currentUser = data.user;
      showMessage('auth-message', data.message, 'success');
      setTimeout(() => {
        loadProducts();
        showPage('products');
      }, 1000);
    } else {
      showMessage('auth-message', data.error, 'error');
    }
  } catch (error) {
    showMessage('auth-message', 'Hálózati hiba történt', 'error');
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  showPage('auth');
  document.getElementById('auth-form').reset();
}

async function loadUserData() {
  try {
    const response = await fetch(API_URL + '/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      currentUser = await response.json();
      
      // Show admin link if user is admin
      if (currentUser.is_admin) {
        document.getElementById('admin-link').style.display = 'inline';
      }
      
      loadProducts();
      showPage('products');
    } else {
      logout();
    }
  } catch (error) {
    logout();
  }
}

async function updateProfile(e) {
  e.preventDefault();
  const email = document.getElementById('profile-email').value;

  try {
    const response = await fetch(API_URL + '/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      currentUser.email = email;
      showMessage('profile-message', data.message, 'success');
    } else {
      showMessage('profile-message', data.error, 'error');
    }
  } catch (error) {
    showMessage('profile-message', 'Hálózati hiba történt', 'error');
  }
}

// Products functions
async function loadProducts() {
  try {
    const response = await fetch(API_URL + '/products');
    const products = await response.json();

    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    products.forEach(product => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });

    loadCartCount();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  const stockClass = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : '';
  const stockText = product.stock === 0 ? 'Nincs raktáron' : `Raktáron: ${product.stock} db`;

  card.innerHTML = `
    <h3>${product.name}</h3>
    <p>${product.description || ''}</p>
    <div class="product-price">${product.price.toLocaleString('hu-HU')} Ft</div>
    <div class="product-stock ${stockClass}">${stockText}</div>
    <div class="product-actions">
      <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" ${product.stock === 0 ? 'disabled' : ''}>
      <button onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
        Kosárba
      </button>
    </div>
  `;

  return card;
}

async function addToCart(productId) {
  const quantity = parseInt(document.getElementById(`qty-${productId}`).value);

  try {
    const response = await fetch(API_URL + '/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity })
    });

    const data = await response.json();

    if (response.ok) {
      loadCartCount();
      alert('Termék hozzáadva a kosárhoz!');
    } else {
      alert(data.error || 'Hiba történt');
    }
  } catch (error) {
    alert('Hálózati hiba történt');
  }
}

// Cart functions
async function loadCart() {
  try {
    const response = await fetch(API_URL + '/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const container = document.getElementById('cart-items');
    const totalDiv = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (data.items.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>A kosár üres</h3><p>Böngéssz a termékeink között!</p></div>';
      totalDiv.innerHTML = '';
      checkoutBtn.disabled = true;
      return;
    }

    container.innerHTML = '';
    data.items.forEach(item => {
      const itemDiv = createCartItem(item);
      container.appendChild(itemDiv);
    });

    totalDiv.innerHTML = `<h3>Összesen: ${data.total.toLocaleString('hu-HU')} Ft</h3>`;
    checkoutBtn.disabled = false;
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}

function createCartItem(item) {
  const div = document.createElement('div');
  div.className = 'cart-item';

  div.innerHTML = `
    <div class="cart-item-info">
      <h3>${item.name}</h3>
      <p>Egységár: ${item.price.toLocaleString('hu-HU')} Ft</p>
      <p>Részösszeg: ${item.subtotal.toLocaleString('hu-HU')} Ft</p>
    </div>
    <div class="cart-item-actions">
      <input type="number" id="cart-qty-${item.product_id}" value="${item.quantity}" min="0" max="${item.stock}">
      <button onclick="updateCartItem(${item.product_id})">Frissít</button>
      <button class="btn-remove" onclick="removeFromCart(${item.product_id})">Törlés</button>
    </div>
  `;

  return div;
}

async function updateCartItem(productId) {
  const quantity = parseInt(document.getElementById(`cart-qty-${productId}`).value);

  try {
    const response = await fetch(API_URL + `/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });

    const data = await response.json();

    if (response.ok) {
      loadCart();
      loadCartCount();
    } else {
      alert(data.error || 'Hiba történt');
    }
  } catch (error) {
    alert('Hálózati hiba történt');
  }
}

async function removeFromCart(productId) {
  if (!confirm('Biztosan törölni szeretnéd ezt a terméket?')) return;

  try {
    const response = await fetch(API_URL + `/cart/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      loadCart();
      loadCartCount();
    }
  } catch (error) {
    alert('Hálózati hiba történt');
  }
}

async function loadCartCount() {
  try {
    const response = await fetch(API_URL + '/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    const count = data.items.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
  } catch (error) {
    console.error('Error loading cart count:', error);
  }
}

// Checkout
async function checkout() {
  if (!confirm('Biztosan le szeretnéd adni a rendelést?')) return;

  try {
    const response = await fetch(API_URL + '/checkout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (response.ok) {
      showMessage('cart-message', 'Rendelés sikeresen leadva!', 'success');
      setTimeout(() => {
        loadProducts();
        showPage('orders');
        loadOrders();
      }, 1500);
    } else {
      showMessage('cart-message', data.error || 'Hiba történt', 'error');
    }
  } catch (error) {
    showMessage('cart-message', 'Hálózati hiba történt', 'error');
  }
}

// Orders
async function loadOrders() {
  try {
    const response = await fetch(API_URL + '/checkout/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = await response.json();
    const container = document.getElementById('orders-list');

    if (orders.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>Még nincs rendelésed</h3></div>';
      return;
    }

    container.innerHTML = '';
    orders.forEach(order => {
      const card = createOrderCard(order);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function createOrderCard(order) {
  const card = document.createElement('div');
  card.className = 'order-card';

  const date = new Date(order.created_at).toLocaleString('hu-HU');

  card.innerHTML = `
    <h3>Rendelés #${order.id}</h3>
    <p><strong>Dátum:</strong> ${date}</p>
    <p><strong>Termékek:</strong> ${order.items || 'Nincs adat'}</p>
    <div class="order-total">Összesen: ${order.total.toLocaleString('hu-HU')} Ft</div>
  `;

  return card;
}

// Navigation
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.style.display = 'none';
  });

  // Hide navbar for auth page
  const navbar = document.getElementById('navbar');
  if (pageName === 'auth') {
    navbar.style.display = 'none';
    document.getElementById('auth-page').style.display = 'block';
    return;
  }

  navbar.style.display = 'block';

  // Show selected page
  switch(pageName) {
    case 'products':
      document.getElementById('products-page').style.display = 'block';
      loadProducts();
      break;
    case 'cart':
      document.getElementById('cart-page').style.display = 'block';
      loadCart();
      break;
    case 'orders':
      document.getElementById('orders-page').style.display = 'block';
      loadOrders();
      break;
    case 'profile':
      document.getElementById('profile-page').style.display = 'block';
      if (currentUser) {
        document.getElementById('profile-email').value = currentUser.email;
      }
      break;
    case 'admin':
      document.getElementById('admin-page').style.display = 'block';
      loadAdminStats();
      loadAdminProducts();
      break;
  }
}

// Helper function
function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `message ${type}`;
  setTimeout(() => {
    element.className = 'message';
  }, 5000);
}

// Admin functions
async function loadAdminStats() {
  try {
    const response = await fetch(API_URL + '/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) return;

    const stats = await response.json();
    const container = document.getElementById('admin-stats');
    
    container.innerHTML = `
      <div class="stat-card">
        <h3>Felhasználók</h3>
        <div class="stat-value">${stats.total_users}</div>
      </div>
      <div class="stat-card">
        <h3>Termékek</h3>
        <div class="stat-value">${stats.total_products}</div>
      </div>
      <div class="stat-card">
        <h3>Rendelések</h3>
        <div class="stat-value">${stats.total_orders}</div>
      </div>
      <div class="stat-card">
        <h3>Bevétel</h3>
        <div class="stat-value">${stats.total_revenue.toLocaleString('hu-HU')} Ft</div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadAdminProducts() {
  try {
    const response = await fetch(API_URL + '/products');
    const products = await response.json();
    
    const container = document.getElementById('admin-products-list');
    container.innerHTML = '';
    
    products.forEach(product => {
      const item = createAdminProductItem(product);
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function createAdminProductItem(product) {
  const div = document.createElement('div');
  div.className = 'admin-product-item';
  div.id = `admin-product-${product.id}`;
  
  div.innerHTML = `
    <div class="admin-product-info">
      <h4>${product.name}</h4>
      <p><strong>Ár:</strong> ${product.price.toLocaleString('hu-HU')} Ft</p>
      <p><strong>Készlet:</strong> ${product.stock} db</p>
      <p><strong>Leírás:</strong> ${product.description || 'Nincs'}</p>
    </div>
    <div class="admin-product-actions">
      <button class="btn-edit" onclick="editProduct(${product.id})">Szerkesztés</button>
      <button class="btn-delete" onclick="deleteProduct(${product.id})">Törlés</button>
    </div>
  `;
  
  return div;
}

async function addProduct(e) {
  e.preventDefault();
  
  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const stock = parseInt(document.getElementById('product-stock').value);
  const description = document.getElementById('product-description').value;
  
  try {
    const response = await fetch(API_URL + '/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, stock, description })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage('admin-message', 'Termék sikeresen hozzáadva!', 'success');
      document.getElementById('add-product-form').reset();
      loadAdminProducts();
      loadAdminStats();
    } else {
      showMessage('admin-message', data.error || 'Hiba történt', 'error');
    }
  } catch (error) {
    showMessage('admin-message', 'Hálózati hiba történt', 'error');
  }
}

function editProduct(productId) {
  const productItem = document.getElementById(`admin-product-${productId}`);
  const info = productItem.querySelector('.admin-product-info');
  
  // Get current values
  const name = info.querySelector('h4').textContent;
  const priceText = info.querySelectorAll('p')[0].textContent;
  const price = priceText.match(/\d+/g).join('');
  const stockText = info.querySelectorAll('p')[1].textContent;
  const stock = stockText.match(/\d+/)[0];
  const descText = info.querySelectorAll('p')[2].textContent;
  const description = descText.replace('Leírás: ', '').replace('Nincs', '');
  
  // Create edit form
  productItem.innerHTML = `
    <div class="edit-form">
      <input type="text" id="edit-name-${productId}" value="${name}">
      <input type="number" id="edit-price-${productId}" value="${price}" min="0">
      <input type="number" id="edit-stock-${productId}" value="${stock}" min="0">
      <textarea id="edit-desc-${productId}" rows="2">${description}</textarea>
      <div class="edit-form-actions">
        <button class="btn-save" onclick="saveProduct(${productId})">Mentés</button>
        <button class="btn-cancel" onclick="loadAdminProducts()">Mégse</button>
      </div>
    </div>
  `;
}

async function saveProduct(productId) {
  const name = document.getElementById(`edit-name-${productId}`).value;
  const price = parseFloat(document.getElementById(`edit-price-${productId}`).value);
  const stock = parseInt(document.getElementById(`edit-stock-${productId}`).value);
  const description = document.getElementById(`edit-desc-${productId}`).value;
  
  try {
    const response = await fetch(API_URL + `/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, stock, description })
    });
    
    if (response.ok) {
      loadAdminProducts();
      loadAdminStats();
    } else {
      const data = await response.json();
      alert(data.error || 'Hiba történt');
    }
  } catch (error) {
    alert('Hálózati hiba történt');
  }
}

async function deleteProduct(productId) {
  if (!confirm('Biztosan törölni szeretnéd ezt a terméket?')) return;
  
  try {
    const response = await fetch(API_URL + `/admin/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      loadAdminProducts();
      loadAdminStats();
    } else {
      const data = await response.json();
      alert(data.error || 'Hiba történt');
    }
  } catch (error) {
    alert('Hálózati hiba történt');
  }
}
