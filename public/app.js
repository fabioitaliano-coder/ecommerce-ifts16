const CART_STORAGE_KEY = 'ifts16-cart';
const AUTH_TOKEN_KEY = 'ifts16-auth-token';
const AUTH_USER_KEY = 'ifts16-auth-user';

// products contiene el catálogo completo desde la API.
let products = [];

// categories, clients y discounts alimentan los paneles auxiliares.
let categories = [];
let clients = [];
let discounts = [];

// cart persiste en localStorage para no perderse al recargar.
let cart = [];

// currentUser representa al usuario autenticado en el frontend.
// Si vale null, la UI debe comportarse como invitado.
let currentUser = null;

// Referencias a nodos del DOM.
const productsGrid = document.getElementById('products-grid');
const productsStatus = document.getElementById('products-status');
const cartStorageStatus = document.getElementById('cart-storage-status');
const productsFeedback = document.getElementById('products-feedback');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const checkoutFeedback = document.getElementById('checkout-feedback');
const clientIdInput = document.getElementById('client-id');
const discountCodeInput = document.getElementById('discount-code');
const reloadProductsButton = document.getElementById('reload-products');
const clearCartButton = document.getElementById('clear-cart');
const checkoutButton = document.getElementById('checkout-button');
const categoryFilter = document.getElementById('category-filter');
const searchInput = document.getElementById('search-input');
const clientsList = document.getElementById('clients-list');
const discountsList = document.getElementById('discounts-list');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const sessionStatus = document.getElementById('session-status');
const authFeedback = document.getElementById('auth-feedback');
const adminPanelButton = document.getElementById('admin-panel-button');
const adminPanel = document.getElementById('admin-panel');
const adminPanelClose = document.getElementById('admin-panel-close');

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function showAuthFeedback(message, type) {
  authFeedback.textContent = message;
  authFeedback.className = `alert alert-${type} mt-3`;
  authFeedback.classList.remove('d-none');
}

function hideAuthFeedback() {
  authFeedback.classList.add('d-none');
}

function showProductsFeedback(message, type) {
  productsFeedback.textContent = message;
  productsFeedback.className = `alert alert-${type}`;
  productsFeedback.classList.remove('d-none');
}

function hideProductsFeedback() {
  productsFeedback.classList.add('d-none');
}

function showCheckoutFeedback(message, type) {
  checkoutFeedback.textContent = message;
  checkoutFeedback.className = `alert alert-${type} mt-3`;
  checkoutFeedback.classList.remove('d-none');
}

function hideCheckoutFeedback() {
  checkoutFeedback.classList.add('d-none');
}

function getCartSubtotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  cartStorageStatus.textContent = 'Carrito local: guardado';
}

function saveAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  currentUser = null;
}

function loadAuthSession() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    currentUser = null;
    return;
  }

  try {
    currentUser = JSON.parse(rawUser);
  } catch (error) {
    currentUser = null;
    clearAuthSession();
  }
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function updateSessionUI() {
  const isAdmin = currentUser?.role === 'admin';
  const isLoggedIn = Boolean(currentUser);

  sessionStatus.textContent = isLoggedIn
    ? `${currentUser.name} (${currentUser.role})`
    : 'Invitado';
  sessionStatus.className = isLoggedIn
    ? 'badge text-bg-success'
    : 'badge text-bg-secondary';

  logoutButton.classList.toggle('d-none', !isLoggedIn);
  adminPanelButton.classList.toggle('d-none', !isAdmin);

  if (!isAdmin) {
    adminPanel.classList.add('d-none');
  }
}

function loadCartFromStorage() {
  const rawCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!rawCart) {
    cart = [];
    return;
  }

  try {
    cart = JSON.parse(rawCart);
    cartStorageStatus.textContent = 'Carrito local: recuperado';
  } catch (error) {
    cart = [];
    cartStorageStatus.textContent = 'Carrito local: reiniciado';
  }
}

function renderClients() {
  if (clients.length === 0) {
    clientsList.innerHTML = '<p class="text-secondary mb-0">No hay clientes disponibles.</p>';
    clientIdInput.innerHTML = '<option value="">Sin clientes</option>';
    return;
  }

  clientIdInput.innerHTML = clients
    .map(client => `<option value="${client.id}">${client.id} - ${client.name}</option>`)
    .join('');

  clientsList.innerHTML = clients
    .map(
      client => `
        <div class="support-item py-2">
          <strong>${client.name}</strong>
          <div class="small text-secondary">ID ${client.id} | ${client.email}</div>
        </div>
      `
    )
    .join('');
}

function renderDiscounts() {
  if (discounts.length === 0) {
    discountsList.innerHTML = '<p class="text-secondary mb-0">No hay descuentos disponibles.</p>';
    return;
  }

  discountsList.innerHTML = discounts
    .map(
      discount => `
        <div class="support-item py-2">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <strong>${discount.code}</strong>
              <div class="small text-secondary">
                ${discount.percent}% de descuento desde ${formatCurrency(discount.minTotal)}
              </div>
            </div>
            <button
              class="btn btn-sm btn-outline-primary"
              data-action="use-discount"
              data-code="${discount.code}"
            >
              Usar
            </button>
          </div>
        </div>
      `
    )
    .join('');
}

function renderCategoryFilter() {
  categoryFilter.innerHTML =
    '<option value="">Todas las categorías</option>' +
    categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('');
}

function getVisibleProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return products.filter(product => {
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm);
    return matchesSearch;
  });
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-secondary mb-0">Todavía no hay productos en el carrito.</p>';
  } else {
    cartItems.innerHTML = cart
      .map(
        item => `
          <div class="cart-item py-3">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h3 class="h6 mb-1">${item.name}</h3>
                <p class="small text-secondary mb-2">${formatCurrency(item.price)} x ${item.quantity}</p>
                <div class="btn-group btn-group-sm" role="group" aria-label="Cantidad">
                  <button class="btn btn-outline-secondary" data-action="decrease" data-id="${item.productId}">-</button>
                  <button class="btn btn-outline-secondary" disabled>${item.quantity}</button>
                  <button class="btn btn-outline-secondary" data-action="increase" data-id="${item.productId}">+</button>
                </div>
              </div>
              <div class="text-end">
                <strong>${formatCurrency(item.price * item.quantity)}</strong>
                <div>
                  <button class="btn btn-link btn-sm text-danger p-0 mt-2" data-action="remove" data-id="${item.productId}">
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        `
      )
      .join('');
  }

  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  cartSubtotal.textContent = formatCurrency(getCartSubtotal());
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  if (visibleProducts.length === 0) {
    productsGrid.innerHTML = '';
    showProductsFeedback('No hay productos que coincidan con la búsqueda o el filtro.', 'warning');
    productsStatus.textContent = '0 productos';
    return;
  }

  hideProductsFeedback();
  productsStatus.textContent = `${visibleProducts.length} productos`;

  productsGrid.innerHTML = visibleProducts
    .map(product => {
      const stockClass = product.stock <= 3 ? 'stock-badge-low' : 'stock-badge-ok';
      const stockLabel = product.stock <= 3 ? 'Stock bajo' : 'Stock disponible';
      const placeholderImage = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'>
          <rect width='640' height='360' fill='#c9ced6'/>
          <rect x='40' y='40' width='560' height='280' rx='16' fill='none' stroke='#9aa3b2' stroke-width='4'/>
          <circle cx='220' cy='165' r='50' fill='#8f98a8'/>
          <rect x='300' y='125' width='150' height='20' rx='10' fill='#8f98a8'/>
          <rect x='300' y='165' width='220' height='16' rx='8' fill='#a8b0bd'/>
        </svg>`
      )}`;

      return `
        <div class="col-md-6">
          <article class="card product-card">
            <img
              src="${placeholderImage}"
              class="card-img-top"
              alt="Imagen genérica del producto"
              loading="lazy"
            />
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <span class="badge category-pill mb-2">${product.category?.name || 'Sin categoría'}</span>
                  <h3 class="h4 mb-1">${product.name}</h3>
                  <p class="text-secondary mb-0">ID ${product.id}</p>
                </div>
                <span class="badge ${stockClass}">${stockLabel}: ${product.stock}</span>
              </div>

              <p class="display-6 fw-semibold mb-3">${formatCurrency(product.price)}</p>
              <p class="text-secondary flex-grow-1">
                Producto obtenido desde la API. La categoría y el stock reflejan la base real.
              </p>

              <div class="d-grid gap-2">
                <button
                  class="btn btn-primary"
                  data-action="add-to-cart"
                  data-id="${product.id}"
                  ${product.stock <= 0 ? 'disabled' : ''}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </article>
        </div>
      `;
    })
    .join('');
}

async function fetchJson(url, errorMessage) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

async function login() {
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  if (!email || !password) {
    showAuthFeedback('Completá email y contraseña antes de iniciar sesión.', 'warning');
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = 'Ingresando...';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo iniciar sesión.');
    }

    currentUser = data.user;
    saveAuthSession(data.token, data.user);
    updateSessionUI();
    showAuthFeedback(`Sesión iniciada como ${data.user.name} (${data.user.role}).`, 'success');
    loginPasswordInput.value = '';
  } catch (error) {
    showAuthFeedback(error.message, 'danger');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Iniciar sesión';
  }
}

async function loadSupportData() {
  try {
    const [categoriesData, clientsData, discountsData] = await Promise.all([
      fetchJson('/api/categorias', 'No se pudieron cargar las categorías.'),
      fetchJson('/api/clientes', 'No se pudieron cargar los clientes.'),
      fetchJson('/api/descuentos', 'No se pudieron cargar los descuentos.')
    ]);

    categories = categoriesData;
    clients = clientsData;
    discounts = discountsData;

    renderCategoryFilter();
    renderClients();
    renderDiscounts();
  } catch (error) {
    showCheckoutFeedback(error.message, 'danger');
  }
}

async function loadProducts(categoryId = categoryFilter.value) {
  // Clase 9:
  // categoryId llega desde el select de categorias.
  // Si viene vacio, se consulta el catalogo completo.
  // Si viene con valor, armamos query parameter ?categoria=ID
  // para que el backend filtre desde la base.
  reloadProductsButton.disabled = true;
  productsStatus.textContent = 'Cargando...';

  try {
    const query = categoryId ? `?categoria=${encodeURIComponent(categoryId)}` : '';
    products = await fetchJson(`/api/productos${query}`, 'No se pudo obtener el listado de productos.');
    renderProducts();
    renderCart();
  } catch (error) {
    products = [];
    renderProducts();
    productsStatus.textContent = 'Error';
    showProductsFeedback(error.message, 'danger');
  } finally {
    reloadProductsButton.disabled = false;
  }
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);

  if (!product) {
    showCheckoutFeedback('El producto seleccionado ya no existe en el listado actual.', 'warning');
    return;
  }

  const existingItem = cart.find(item => item.productId === productId);
  const currentQuantity = existingItem ? existingItem.quantity : 0;

  if (currentQuantity >= product.stock) {
    showCheckoutFeedback('No podés agregar más unidades que el stock disponible.', 'warning');
    return;
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveCart();
  hideCheckoutFeedback();
  renderCart();
}

function updateCartItem(productId, action) {
  const item = cart.find(entry => entry.productId === productId);
  const product = products.find(entry => entry.id === productId);

  if (!item || !product) {
    return;
  }

  if (action === 'increase') {
    if (item.quantity >= product.stock) {
      showCheckoutFeedback('No hay más stock disponible para aumentar la cantidad.', 'warning');
      return;
    }
    item.quantity += 1;
  }

  if (action === 'decrease') {
    item.quantity -= 1;
  }

  if (action === 'remove' || item.quantity <= 0) {
    cart = cart.filter(entry => entry.productId !== productId);
  }

  saveCart();
  hideCheckoutFeedback();
  renderCart();
}

async function checkout() {
  hideCheckoutFeedback();

  const clientId = Number(clientIdInput.value);
  const discountCode = discountCodeInput.value.trim();

  if (!clientId) {
    showCheckoutFeedback('Seleccioná un cliente válido antes de confirmar.', 'warning');
    return;
  }

  if (cart.length === 0) {
    showCheckoutFeedback('El carrito está vacío.', 'warning');
    return;
  }

  checkoutButton.disabled = true;
  checkoutButton.textContent = 'Procesando...';

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        discountCode: discountCode || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo completar la compra.');
    }

    showCheckoutFeedback(
      `Compra registrada. Subtotal: ${formatCurrency(data.order.subtotal)} | Descuento: ${formatCurrency(data.order.discount)} | Total: ${formatCurrency(data.order.total)}`,
      'success'
    );

    cart = [];
    saveCart();
    renderCart();
    await loadProducts();
  } catch (error) {
    showCheckoutFeedback(error.message, 'danger');
  } finally {
    checkoutButton.disabled = false;
    checkoutButton.textContent = 'Confirmar compra';
  }
}

productsGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-action="add-to-cart"]');
  if (!button) {
    return;
  }

  addToCart(Number(button.dataset.id));
});

cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }

  updateCartItem(Number(button.dataset.id), button.dataset.action);
});

discountsList.addEventListener('click', event => {
  const button = event.target.closest('[data-action="use-discount"]');
  if (!button) {
    return;
  }

  discountCodeInput.value = button.dataset.code;
  showCheckoutFeedback(`Se cargó el código ${button.dataset.code} en el formulario.`, 'info');
});

reloadProductsButton.addEventListener('click', async () => {
  await loadSupportData();
  await loadProducts();
});

loginButton.addEventListener('click', login);

logoutButton.addEventListener('click', () => {
  clearAuthSession();
  updateSessionUI();
  hideCheckoutFeedback();
  showAuthFeedback('Sesión cerrada.', 'info');
});

adminPanelButton.addEventListener('click', () => {
  adminPanel.classList.remove('d-none');
});

adminPanelClose.addEventListener('click', () => {
  adminPanel.classList.add('d-none');
});

clearCartButton.addEventListener('click', () => {
  cart = [];
  saveCart();
  hideCheckoutFeedback();
  renderCart();
});

checkoutButton.addEventListener('click', checkout);

categoryFilter.addEventListener('change', () => {
  // Cada cambio de categoria dispara una nueva consulta HTTP.
  // Esto evita recargar la pagina y muestra un catalogo dinamico.
  loadProducts(categoryFilter.value);
});
searchInput.addEventListener('input', renderProducts);

async function initializeScreen() {
  loadAuthSession();
  updateSessionUI();
  loadCartFromStorage();
  renderCart();
  await loadSupportData();
  await loadProducts();
}

initializeScreen();
