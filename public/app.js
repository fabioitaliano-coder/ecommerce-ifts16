const CART_STORAGE_KEY = 'ifts16-cart';
const AUTH_TOKEN_KEY = 'ifts16-auth-token';
const AUTH_USER_KEY = 'ifts16-auth-user';
const ADMIN_PAGE_SIZE = 5;

let products = [];
let categories = [];
let clients = [];
let discounts = [];
let cart = [];
let currentUser = null;

let editingProductId = null;
let editingCategoryId = null;
let editingClientId = null;
let editingDiscountId = null;

const adminState = {
  activeTab: 'products',
  products: { items: [], pagination: emptyPagination() },
  categories: { items: [], pagination: emptyPagination() },
  clients: { items: [], pagination: emptyPagination() },
  discounts: { items: [], pagination: emptyPagination() }
};

const adminCatalogState = {
  products: {
    search: '',
    sortBy: 'id',
    sortOrder: 'asc',
    filters: { name: '', category: '', stock: '' },
    formOpen: false
  },
  categories: {
    search: '',
    sortBy: 'id',
    sortOrder: 'asc',
    filters: { name: '' },
    formOpen: false
  },
  clients: {
    search: '',
    sortBy: 'id',
    sortOrder: 'asc',
    filters: { name: '', email: '' },
    formOpen: false
  },
  discounts: {
    search: '',
    sortBy: 'id',
    sortOrder: 'asc',
    filters: { code: '', percent: '' },
    formOpen: false
  }
};
const adminSearchTimers = {};

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
const authPanel = document.getElementById('auth-panel');
const adminPanelButton = document.getElementById('admin-panel-button');
const adminPanel = document.getElementById('admin-panel');
const adminPanelClose = document.getElementById('admin-panel-close');
const storefrontView = document.getElementById('storefront-view');

const adminFeedback = document.getElementById('admin-feedback');
const adminTabButtons = Array.from(document.querySelectorAll('[data-admin-tab]'));
const adminSections = Array.from(document.querySelectorAll('[data-admin-section]'));
const adminProductsStatus = document.getElementById('admin-products-status');
const adminCategoriesStatus = document.getElementById('admin-categories-status');
const adminClientsStatus = document.getElementById('admin-clients-status');
const adminDiscountsStatus = document.getElementById('admin-discounts-status');
const adminProductsList = document.getElementById('admin-products-list');
const adminCategoriesList = document.getElementById('admin-categories-list');
const adminClientsList = document.getElementById('admin-clients-list');
const adminDiscountsList = document.getElementById('admin-discounts-list');
const adminProductsPageInfo = document.getElementById('admin-products-page-info');
const adminCategoriesPageInfo = document.getElementById('admin-categories-page-info');
const adminClientsPageInfo = document.getElementById('admin-clients-page-info');
const adminDiscountsPageInfo = document.getElementById('admin-discounts-page-info');
const adminProductsPrev = document.getElementById('admin-products-prev');
const adminProductsNext = document.getElementById('admin-products-next');
const adminProductsExport = document.getElementById('admin-products-export');
const adminProductsNew = document.getElementById('admin-products-new');
const adminProductsSearch = document.getElementById('admin-products-search');
const adminProductsFilterName = document.getElementById('admin-products-filter-name');
const adminProductsFilterCategory = document.getElementById('admin-products-filter-category');
const adminProductsFilterStock = document.getElementById('admin-products-filter-stock');
const adminProductsSortBy = document.getElementById('admin-products-sort-by');
const adminProductsSortOrder = document.getElementById('admin-products-sort-order');
const adminProductsClearFilters = document.getElementById('admin-products-clear-filters');
const adminCategoriesPrev = document.getElementById('admin-categories-prev');
const adminCategoriesNext = document.getElementById('admin-categories-next');
const adminCategoriesExport = document.getElementById('admin-categories-export');
const adminCategoriesNew = document.getElementById('admin-categories-new');
const adminCategoriesSearch = document.getElementById('admin-categories-search');
const adminCategoriesFilterName = document.getElementById('admin-categories-filter-name');
const adminCategoriesSortBy = document.getElementById('admin-categories-sort-by');
const adminCategoriesSortOrder = document.getElementById('admin-categories-sort-order');
const adminCategoriesClearFilters = document.getElementById('admin-categories-clear-filters');
const adminClientsPrev = document.getElementById('admin-clients-prev');
const adminClientsNext = document.getElementById('admin-clients-next');
const adminClientsExport = document.getElementById('admin-clients-export');
const adminClientsNew = document.getElementById('admin-clients-new');
const adminClientsSearch = document.getElementById('admin-clients-search');
const adminClientsFilterName = document.getElementById('admin-clients-filter-name');
const adminClientsFilterEmail = document.getElementById('admin-clients-filter-email');
const adminClientsSortBy = document.getElementById('admin-clients-sort-by');
const adminClientsSortOrder = document.getElementById('admin-clients-sort-order');
const adminClientsClearFilters = document.getElementById('admin-clients-clear-filters');
const adminDiscountsPrev = document.getElementById('admin-discounts-prev');
const adminDiscountsNext = document.getElementById('admin-discounts-next');
const adminDiscountsExport = document.getElementById('admin-discounts-export');
const adminDiscountsNew = document.getElementById('admin-discounts-new');
const adminDiscountsSearch = document.getElementById('admin-discounts-search');
const adminDiscountsFilterCode = document.getElementById('admin-discounts-filter-code');
const adminDiscountsFilterPercent = document.getElementById('admin-discounts-filter-percent');
const adminDiscountsSortBy = document.getElementById('admin-discounts-sort-by');
const adminDiscountsSortOrder = document.getElementById('admin-discounts-sort-order');
const adminDiscountsClearFilters = document.getElementById('admin-discounts-clear-filters');

const adminProductForm = document.getElementById('admin-product-form');
const adminProductIdInput = document.getElementById('admin-product-id');
const adminProductNameInput = document.getElementById('admin-product-name');
const adminProductPriceInput = document.getElementById('admin-product-price');
const adminProductStockInput = document.getElementById('admin-product-stock');
const adminProductCategoryInput = document.getElementById('admin-product-category');
const adminProductValidFromInput = document.getElementById('admin-product-valid-from');
const adminProductValidToInput = document.getElementById('admin-product-valid-to');
const adminProductSubmit = document.getElementById('admin-product-submit');
const adminProductCancel = document.getElementById('admin-product-cancel');

const adminCategoryForm = document.getElementById('admin-category-form');
const adminCategoryIdInput = document.getElementById('admin-category-id');
const adminCategoryNameInput = document.getElementById('admin-category-name');
const adminCategoryDescriptionInput = document.getElementById('admin-category-description');
const adminCategorySubmit = document.getElementById('admin-category-submit');
const adminCategoryCancel = document.getElementById('admin-category-cancel');

const adminClientForm = document.getElementById('admin-client-form');
const adminClientIdInput = document.getElementById('admin-client-id');
const adminClientNameInput = document.getElementById('admin-client-name');
const adminClientEmailInput = document.getElementById('admin-client-email');
const adminClientSubmit = document.getElementById('admin-client-submit');
const adminClientCancel = document.getElementById('admin-client-cancel');

const adminDiscountForm = document.getElementById('admin-discount-form');
const adminDiscountIdInput = document.getElementById('admin-discount-id');
const adminDiscountCodeInput = document.getElementById('admin-discount-code');
const adminDiscountPercentInput = document.getElementById('admin-discount-percent');
const adminDiscountMinTotalInput = document.getElementById('admin-discount-min-total');
const adminDiscountSubmit = document.getElementById('admin-discount-submit');
const adminDiscountCancel = document.getElementById('admin-discount-cancel');

function emptyPagination() {
  return {
    page: 1,
    limit: ADMIN_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
  };
}

function normalizeAdminResponse(data) {
  const normalizedInput = unwrapDataEnvelope(data);

  // Defensa importante:
  // el panel admin espera { items, pagination }.
  // Si por algun motivo llega un array plano desde la API
  // no rompemos la pantalla: lo convertimos a un formato consistente.
  if (Array.isArray(normalizedInput)) {
    return {
      items: normalizedInput,
      pagination: {
        page: 1,
        limit: normalizedInput.length || ADMIN_PAGE_SIZE,
        totalItems: normalizedInput.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      }
    };
  }

  if (!normalizedInput || !Array.isArray(normalizedInput.items)) {
    return {
      items: [],
      pagination: emptyPagination()
    };
  }

  return {
    items: normalizedInput.items,
    pagination: {
      ...emptyPagination(),
      ...(normalizedInput.pagination || {})
    }
  };
}

function normalizePaginatedResponse(data) {
  const normalizedInput = unwrapDataEnvelope(data);

  // Compatibilidad defensiva:
  // si el backend viejo o una instancia no reiniciada devuelve un array plano,
  // no rompemos el catalogo. Lo convertimos a una pagina unica.
  if (Array.isArray(normalizedInput)) {
    return {
      items: normalizedInput,
      pagination: {
        page: 1,
        limit: normalizedInput.length || ADMIN_PAGE_SIZE,
        totalItems: normalizedInput.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      }
    };
  }

  if (!normalizedInput || normalizedInput.success === false || !Array.isArray(normalizedInput.items) || !normalizedInput.pagination) {
    throw new Error('La API respondió sin el formato paginado esperado.');
  }

  return normalizedInput;
}

function unwrapDataEnvelope(data) {
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data;
  }

  return data;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function isAdminUser() {
  return currentUser?.role === 'admin';
}

function showAuthFeedback(message, type) {
  authFeedback.textContent = message;
  authFeedback.className = `alert alert-${type} mt-3`;
  authFeedback.classList.remove('d-none');
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

function showAdminFeedback(message, type) {
  adminFeedback.textContent = message;
  adminFeedback.className = `alert alert-${type} mb-4`;
  adminFeedback.classList.remove('d-none');
}

function hideAdminFeedback() {
  adminFeedback.classList.add('d-none');
}

function setAdminStatus(element, message, type = 'light') {
  element.textContent = message;
  element.className = `badge text-bg-${type}`;
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

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function updateSessionUI() {
  const isLoggedIn = Boolean(currentUser);
  const admin = isAdminUser();

  sessionStatus.textContent = isLoggedIn ? `${currentUser.name} (${currentUser.role})` : 'Invitado';
  sessionStatus.className = isLoggedIn ? 'badge text-bg-success' : 'badge text-bg-secondary';

  authPanel.classList.toggle('d-none', isLoggedIn);
  logoutButton.classList.toggle('d-none', !isLoggedIn);
  adminPanelButton.classList.toggle('d-none', !admin);

  if (!admin) {
    adminPanel.classList.add('d-none');
    hideAdminFeedback();
    storefrontView.classList.remove('d-none');
  }
}

function openAdminWorkspace() {
  adminPanel.classList.remove('d-none');
  storefrontView.classList.add('d-none');
}

function closeAdminWorkspace() {
  adminPanel.classList.add('d-none');
  storefrontView.classList.remove('d-none');
}

function renderClients() {
  clientsList.innerHTML = '<p class="text-secondary mb-0">La lista de clientes está restringida al panel administrador.</p>';
}

function renderDiscounts() {
  discountsList.innerHTML = '<p class="text-secondary mb-0">Los descuentos disponibles están restringidos al panel administrador.</p>';
}

function renderCategoryFilter() {
  categoryFilter.innerHTML =
    '<option value="">Todas las categorías</option>' +
    categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('');
}

function renderAdminCategoryOptions() {
  adminProductCategoryInput.innerHTML = categories
    .map(category => `<option value="${category.id}">${category.name}</option>`)
    .join('');
}

function getVisibleProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  return products.filter(product => !searchTerm || product.name.toLowerCase().includes(searchTerm));
}

function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-secondary mb-0">Todavía no hay productos en el carrito.</p>';
  } else {
    cartItems.innerHTML = cart
      .map(item => `
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
      `)
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
            <img src="${placeholderImage}" class="card-img-top" alt="Imagen genérica del producto" loading="lazy" />
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
                <button class="btn btn-primary" data-action="add-to-cart" data-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}>
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

function renderAdminTabs() {
  adminTabButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.adminTab === adminState.activeTab);
  });

  adminSections.forEach(section => {
    section.classList.toggle('d-none', section.dataset.adminSection !== adminState.activeTab);
  });
}

function setAdminFormVisibility(resource, isVisible) {
  adminCatalogState[resource].formOpen = isVisible;

  const formMap = {
    products: adminProductForm,
    categories: adminCategoryForm,
    clients: adminClientForm,
    discounts: adminDiscountForm
  };

  formMap[resource].classList.toggle('d-none', !isVisible);
}

function renderPaginationInfo(target, pagination) {
  target.textContent = `Página ${pagination.page} de ${pagination.totalPages} | ${pagination.totalItems} registros`;
}

function renderPagerButtons(prevButton, nextButton, pagination) {
  prevButton.disabled = !pagination.hasPreviousPage;
  nextButton.disabled = !pagination.hasNextPage;
}

function getSortIndicator(resource, field) {
  const state = adminCatalogState[resource];
  if (state.sortBy !== field) {
    return '';
  }

  return state.sortOrder === 'asc' ? ' ↑' : ' ↓';
}

function renderAdminHeaderRow(resource, columns) {
  return `
    <div class="admin-list-item py-2 border-bottom">
      <div class="row g-2 align-items-center fw-semibold small text-secondary">
        ${columns.map(column => `
          <div class="${column.width}">
            ${column.sortable
              ? `<button
                  class="btn btn-link btn-sm p-0 text-decoration-none"
                  type="button"
                  data-admin-sort-resource="${resource}"
                  data-admin-sort-field="${column.field}"
                >${column.label}${getSortIndicator(resource, column.field)}</button>`
              : column.label}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAdminProducts() {
  const { items, pagination } = adminState.products;

  renderPaginationInfo(adminProductsPageInfo, pagination);
  renderPagerButtons(adminProductsPrev, adminProductsNext, pagination);

  if (items.length === 0) {
    adminProductsList.innerHTML = '<p class="text-secondary mb-0">No hay productos cargados para esta página.</p>';
    return;
  }

  adminProductsList.innerHTML = renderAdminHeaderRow('products', [
    { label: 'Nombre', field: 'name', width: 'col-md-4', sortable: true },
    { label: 'Precio', field: 'price', width: 'col-md-2', sortable: true },
    { label: 'Stock', field: 'stock', width: 'col-md-2', sortable: true },
    { label: 'Categoría', field: 'category', width: 'col-md-2', sortable: false },
    { label: 'Acciones', field: 'actions', width: 'col-md-2', sortable: false }
  ]) + items
    .map(product => `
      <div class="admin-list-item py-3">
        <div class="row g-3 align-items-start">
          <div class="col-md-4">
            <strong>${product.name}</strong>
            <div class="small text-secondary">ID ${product.id}</div>
            <div class="small text-secondary">Vigencia: ${product.validFrom} a ${product.validTo}</div>
          </div>
          <div class="col-md-2">${formatCurrency(product.price)}</div>
          <div class="col-md-2">Stock ${product.stock}</div>
          <div class="col-md-2">${product.category?.name || 'Sin categoría'}</div>
          <div class="col-md-2">
            <div class="d-flex gap-2 justify-content-md-end">
              <button class="btn btn-sm btn-outline-primary" data-entity="product" data-action="edit" data-id="${product.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger" data-entity="product" data-action="delete" data-id="${product.id}">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function renderAdminCategories() {
  const { items, pagination } = adminState.categories;

  renderPaginationInfo(adminCategoriesPageInfo, pagination);
  renderPagerButtons(adminCategoriesPrev, adminCategoriesNext, pagination);

  if (items.length === 0) {
    adminCategoriesList.innerHTML = '<p class="text-secondary mb-0">No hay categorías cargadas para esta página.</p>';
    return;
  }

  adminCategoriesList.innerHTML = renderAdminHeaderRow('categories', [
    { label: 'Nombre', field: 'name', width: 'col-md-4', sortable: true },
    { label: 'Descripción', field: 'description', width: 'col-md-4', sortable: true },
    { label: 'Productos', field: 'id', width: 'col-md-2', sortable: true },
    { label: 'Acciones', field: 'actions', width: 'col-md-2', sortable: false }
  ]) + items
    .map(category => `
      <div class="admin-list-item py-3">
        <div class="row g-3 align-items-start">
          <div class="col-md-4">
            <strong>${category.name}</strong>
          </div>
          <div class="col-md-4 small text-secondary">${category.description || 'Sin descripción'}</div>
          <div class="col-md-2">${category.products?.length || 0}</div>
          <div class="col-md-2">
            <div class="d-flex gap-2 justify-content-md-end">
              <button class="btn btn-sm btn-outline-primary" data-entity="category" data-action="edit" data-id="${category.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger" data-entity="category" data-action="delete" data-id="${category.id}">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function renderAdminClients() {
  const { items, pagination } = adminState.clients;

  renderPaginationInfo(adminClientsPageInfo, pagination);
  renderPagerButtons(adminClientsPrev, adminClientsNext, pagination);

  if (items.length === 0) {
    adminClientsList.innerHTML = '<p class="text-secondary mb-0">No hay clientes cargados para esta página.</p>';
    return;
  }

  adminClientsList.innerHTML = renderAdminHeaderRow('clients', [
    { label: 'Nombre', field: 'name', width: 'col-md-4', sortable: true },
    { label: 'Email', field: 'email', width: 'col-md-4', sortable: true },
    { label: 'ID', field: 'id', width: 'col-md-2', sortable: true },
    { label: 'Acciones', field: 'actions', width: 'col-md-2', sortable: false }
  ]) + items
    .map(client => `
      <div class="admin-list-item py-3">
        <div class="row g-3 align-items-start">
          <div class="col-md-4">
            <strong>${client.name}</strong>
          </div>
          <div class="col-md-4">${client.email}</div>
          <div class="col-md-2">${client.id}</div>
          <div class="col-md-2">
            <div class="d-flex gap-2 justify-content-md-end">
              <button class="btn btn-sm btn-outline-primary" data-entity="client" data-action="edit" data-id="${client.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger" data-entity="client" data-action="delete" data-id="${client.id}">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function renderAdminDiscounts() {
  const { items, pagination } = adminState.discounts;

  renderPaginationInfo(adminDiscountsPageInfo, pagination);
  renderPagerButtons(adminDiscountsPrev, adminDiscountsNext, pagination);

  if (items.length === 0) {
    adminDiscountsList.innerHTML = '<p class="text-secondary mb-0">No hay descuentos cargados para esta página.</p>';
    return;
  }

  adminDiscountsList.innerHTML = renderAdminHeaderRow('discounts', [
    { label: 'Código', field: 'code', width: 'col-md-4', sortable: true },
    { label: 'Porcentaje', field: 'percent', width: 'col-md-2', sortable: true },
    { label: 'Mínimo', field: 'minTotal', width: 'col-md-2', sortable: true },
    { label: 'ID', field: 'id', width: 'col-md-2', sortable: true },
    { label: 'Acciones', field: 'actions', width: 'col-md-2', sortable: false }
  ]) + items
    .map(discount => `
      <div class="admin-list-item py-3">
        <div class="row g-3 align-items-start">
          <div class="col-md-4">
            <strong>${discount.code}</strong>
          </div>
          <div class="col-md-2">${discount.percent}%</div>
          <div class="col-md-2">${formatCurrency(discount.minTotal)}</div>
          <div class="col-md-2">${discount.id}</div>
          <div class="col-md-2">
            <div class="d-flex gap-2 justify-content-md-end">
              <button class="btn btn-sm btn-outline-primary" data-entity="discount" data-action="edit" data-id="${discount.id}">Editar</button>
              <button class="btn btn-sm btn-outline-danger" data-entity="discount" data-action="delete" data-id="${discount.id}">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function renderAdminPanel() {
  renderAdminTabs();
  renderAdminCategoryOptions();
  syncAdminControls();
  renderAdminProducts();
  renderAdminCategories();
  renderAdminClients();
  renderAdminDiscounts();
}

function syncAdminControls() {
  adminProductsSearch.value = adminCatalogState.products.search;
  adminProductsFilterName.value = adminCatalogState.products.filters.name;
  adminProductsFilterCategory.value = adminCatalogState.products.filters.category;
  adminProductsFilterStock.value = adminCatalogState.products.filters.stock;
  adminProductsSortBy.value = adminCatalogState.products.sortBy;
  adminProductsSortOrder.value = adminCatalogState.products.sortOrder;

  adminCategoriesSearch.value = adminCatalogState.categories.search;
  adminCategoriesFilterName.value = adminCatalogState.categories.filters.name;
  adminCategoriesSortBy.value = adminCatalogState.categories.sortBy;
  adminCategoriesSortOrder.value = adminCatalogState.categories.sortOrder;

  adminClientsSearch.value = adminCatalogState.clients.search;
  adminClientsFilterName.value = adminCatalogState.clients.filters.name;
  adminClientsFilterEmail.value = adminCatalogState.clients.filters.email;
  adminClientsSortBy.value = adminCatalogState.clients.sortBy;
  adminClientsSortOrder.value = adminCatalogState.clients.sortOrder;

  adminDiscountsSearch.value = adminCatalogState.discounts.search;
  adminDiscountsFilterCode.value = adminCatalogState.discounts.filters.code;
  adminDiscountsFilterPercent.value = adminCatalogState.discounts.filters.percent;
  adminDiscountsSortBy.value = adminCatalogState.discounts.sortBy;
  adminDiscountsSortOrder.value = adminCatalogState.discounts.sortOrder;
}

function resetProductForm() {
  editingProductId = null;
  adminProductIdInput.value = '';
  adminProductForm.reset();
  adminProductValidFromInput.value = getTodayDate();
  adminProductValidToInput.value = '2099-12-31';

  if (categories.length > 0) {
    adminProductCategoryInput.value = String(categories[0].id);
  }

  adminProductSubmit.textContent = 'Guardar producto';
  adminProductCancel.classList.add('d-none');
  setAdminFormVisibility('products', false);
}

function resetCategoryForm() {
  editingCategoryId = null;
  adminCategoryIdInput.value = '';
  adminCategoryForm.reset();
  adminCategorySubmit.textContent = 'Guardar categoría';
  adminCategoryCancel.classList.add('d-none');
  setAdminFormVisibility('categories', false);
}

function resetClientForm() {
  editingClientId = null;
  adminClientIdInput.value = '';
  adminClientForm.reset();
  adminClientSubmit.textContent = 'Guardar cliente';
  adminClientCancel.classList.add('d-none');
  setAdminFormVisibility('clients', false);
}

function resetDiscountForm() {
  editingDiscountId = null;
  adminDiscountIdInput.value = '';
  adminDiscountForm.reset();
  adminDiscountSubmit.textContent = 'Guardar descuento';
  adminDiscountCancel.classList.add('d-none');
  setAdminFormVisibility('discounts', false);
}

function populateProductForm(product) {
  editingProductId = product.id;
  adminProductIdInput.value = product.id;
  adminProductNameInput.value = product.name;
  adminProductPriceInput.value = product.price;
  adminProductStockInput.value = product.stock;
  adminProductCategoryInput.value = String(product.categoryId);
  adminProductValidFromInput.value = product.validFrom;
  adminProductValidToInput.value = product.validTo;
  adminProductSubmit.textContent = 'Actualizar producto';
  adminProductCancel.classList.remove('d-none');
  setAdminFormVisibility('products', true);
}

function populateCategoryForm(category) {
  editingCategoryId = category.id;
  adminCategoryIdInput.value = category.id;
  adminCategoryNameInput.value = category.name;
  adminCategoryDescriptionInput.value = category.description || '';
  adminCategorySubmit.textContent = 'Actualizar categoría';
  adminCategoryCancel.classList.remove('d-none');
  setAdminFormVisibility('categories', true);
}

function populateClientForm(client) {
  editingClientId = client.id;
  adminClientIdInput.value = client.id;
  adminClientNameInput.value = client.name;
  adminClientEmailInput.value = client.email;
  adminClientSubmit.textContent = 'Actualizar cliente';
  adminClientCancel.classList.remove('d-none');
  setAdminFormVisibility('clients', true);
}

function populateDiscountForm(discount) {
  editingDiscountId = discount.id;
  adminDiscountIdInput.value = discount.id;
  adminDiscountCodeInput.value = discount.code;
  adminDiscountPercentInput.value = discount.percent;
  adminDiscountMinTotalInput.value = discount.minTotal;
  adminDiscountSubmit.textContent = 'Actualizar descuento';
  adminDiscountCancel.classList.remove('d-none');
  setAdminFormVisibility('discounts', true);
}

async function fetchJson(url, errorMessage, options = {}) {
  const response = await fetch(url, options);

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const rawText = await response.text();

    if (rawText.trim().startsWith('<!doctype html') || rawText.trim().startsWith('<html')) {
      throw new Error('El backend activo devolvió HTML en lugar de JSON. Probablemente falta reiniciar el servidor.');
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.join(' ')
      : data.detail;
    throw new Error(detail ? `${data.error || errorMessage} ${detail}` : (data.error || errorMessage));
  }

  return data;
}

async function fetchJsonWithFallback(primaryUrl, fallbackUrl, errorMessage, options = {}) {
  try {
    return await fetchJson(primaryUrl, errorMessage, options);
  } catch (error) {
    // Compatibilidad transitoria:
    // si el frontend nuevo apunta a /api/admin/... pero el server activo
    // todavía no fue reiniciado y no conoce esa ruta, intentamos el endpoint legado.
    if (!fallbackUrl || !error.message.includes('devolvió HTML')) {
      throw error;
    }

    return fetchJson(fallbackUrl, errorMessage, options);
  }
}

async function fetchAllPages(baseUrl, errorMessage, limit = 50) {
  // Para combos y paneles auxiliares a veces necesitamos "todo",
  // pero no lo pedimos en un solo viaje.
  // Recorremos pagina por pagina hasta completar la coleccion.
  let page = 1;
  let items = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    const data = normalizePaginatedResponse(
      await fetchJson(
        `${baseUrl}${separator}page=${page}&limit=${limit}`,
        errorMessage
      )
    );

    items = items.concat(data.items);
    hasNextPage = data.pagination.hasNextPage;
    page += 1;
  }

  return items;
}

async function downloadFile(url, filename) {
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const fallbackMessage = 'No se pudo descargar el archivo.';
    let detail = fallbackMessage;

    try {
      const data = await response.json();
      detail = data.error || fallbackMessage;
    } catch (error) {
      detail = fallbackMessage;
    }

    throw new Error(detail);
  }

  if (contentType.includes('application/json')) {
    const data = await response.json();
    throw new Error(data.error || 'La exportación no devolvió un archivo CSV válido.');
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
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
    const data = await fetchJson('/api/auth/login', 'No se pudo iniciar sesión.', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

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
    const categoriesData = await fetchAllPages('/api/categorias', 'No se pudieron cargar las categorías.');

    categories = categoriesData;
    clients = [];
    discounts = [];

    renderCategoryFilter();
    renderClients();
    renderDiscounts();
    renderAdminCategoryOptions();
  } catch (error) {
    showCheckoutFeedback(error.message, 'danger');
  }
}

async function loadProducts(categoryId = categoryFilter.value) {
  reloadProductsButton.disabled = true;
  productsStatus.textContent = 'Cargando...';

  try {
    const query = new URLSearchParams({
      page: '1',
      limit: '24'
    });

    if (categoryId) {
      query.set('categoryId', categoryId);
    }

    const data = normalizePaginatedResponse(
      await fetchJson(`/api/productos?${query.toString()}`, 'No se pudo obtener el listado de productos.')
    );

    products = data.items;
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

async function loadAdminResource(resource, page = 1) {
  // Clase 11:
  // para el panel admin pedimos solo una pagina por vez.
  // El backend responde:
  // - items: los registros de esa pagina
  // - pagination: metadata para saber si hay anterior o siguiente
  //
  // Esto hace mas clara la UI y ademas enseña un patron real de backoffice.
  const endpoints = {
    products: {
      primary: '/api/admin/productos',
      fallback: '/api/productos'
    },
    categories: {
      primary: '/api/admin/categorias',
      fallback: '/api/categorias'
    },
    clients: {
      primary: '/api/admin/clientes',
      fallback: '/api/clientes'
    },
    discounts: {
      primary: '/api/admin/descuentos',
      fallback: '/api/descuentos'
    }
  };

  const statusMap = {
    products: adminProductsStatus,
    categories: adminCategoriesStatus,
    clients: adminClientsStatus,
    discounts: adminDiscountsStatus
  };

  setAdminStatus(statusMap[resource], 'Cargando...', 'warning');

  try {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(ADMIN_PAGE_SIZE)
    });

    if (adminCatalogState[resource].search.trim()) {
      query.set('search', adminCatalogState[resource].search.trim());
    }

    query.set('sortBy', adminCatalogState[resource].sortBy);
    query.set('sortOrder', adminCatalogState[resource].sortOrder);

    const filterEntries = Object.entries(adminCatalogState[resource].filters || {});
    filterEntries.forEach(([key, value]) => {
      if (String(value).trim()) {
        query.set(`filter${key.charAt(0).toUpperCase()}${key.slice(1)}`, String(value).trim());
      }
    });

    const data = await fetchJsonWithFallback(
      `${endpoints[resource].primary}?${query.toString()}`,
      `${endpoints[resource].fallback}?${query.toString()}`,
      'No se pudo cargar el bloque administrativo.'
      ,
      {
        headers: getAuthHeaders()
      }
    );

    adminState[resource] = normalizeAdminResponse(data);
    renderAdminPanel();
    setAdminStatus(statusMap[resource], 'Actualizado', 'success');
  } catch (error) {
    showAdminFeedback(error.message, 'danger');
    setAdminStatus(statusMap[resource], 'Error', 'danger');
  }
}

async function loadAllAdminPages() {
  await Promise.all([
    loadAdminResource('products', adminState.products.pagination.page),
    loadAdminResource('categories', adminState.categories.pagination.page),
    loadAdminResource('clients', adminState.clients.pagination.page),
    loadAdminResource('discounts', adminState.discounts.pagination.page)
  ]);
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
    const data = await fetchJson('/api/checkout', 'No se pudo completar la compra.', {
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

    const payload = unwrapDataEnvelope(data);

    showCheckoutFeedback(
      `Compra registrada. Subtotal: ${formatCurrency(payload.order.subtotal)} | Descuento: ${formatCurrency(payload.order.discount)} | Total: ${formatCurrency(payload.order.total)}`,
      'success'
    );

    cart = [];
    saveCart();
    renderCart();
    await loadProducts();
    await loadAdminResource('products', adminState.products.pagination.page);
  } catch (error) {
    showCheckoutFeedback(error.message, 'danger');
  } finally {
    checkoutButton.disabled = false;
    checkoutButton.textContent = 'Confirmar compra';
  }
}

async function refreshAdminAfterMutation(resource) {
  await loadSupportData();
  await loadProducts(categoryFilter.value);
  await loadAdminResource(resource, adminState[resource].pagination.page);

  if (resource === 'categories') {
    await loadAdminResource('products', adminState.products.pagination.page);
  }
}

async function submitProductForm(event) {
  event.preventDefault();

  if (!isAdminUser()) {
    showAdminFeedback('Solo un administrador autenticado puede guardar productos.', 'danger');
    return;
  }

  const payload = {
    name: adminProductNameInput.value.trim(),
    price: Number(adminProductPriceInput.value),
    stock: Number(adminProductStockInput.value),
    categoryId: Number(adminProductCategoryInput.value),
    validFrom: adminProductValidFromInput.value,
    validTo: adminProductValidToInput.value
  };

  if (payload.validFrom > payload.validTo) {
    showAdminFeedback('La fecha "válido desde" no puede ser mayor que "válido hasta".', 'warning');
    return;
  }

  adminProductSubmit.disabled = true;
  setAdminStatus(adminProductsStatus, 'Guardando...', 'warning');

  try {
    const isEditing = Boolean(editingProductId);
    await fetchJson(
      isEditing ? `/api/productos/${editingProductId}` : '/api/productos',
      'No se pudo guardar el producto.',
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      }
    );

    showAdminFeedback(isEditing ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', 'success');
    resetProductForm();
    await refreshAdminAfterMutation('products');
    setAdminStatus(adminProductsStatus, 'Actualizado', 'success');
  } catch (error) {
    showAdminFeedback(error.message, 'danger');
    setAdminStatus(adminProductsStatus, 'Error', 'danger');
  } finally {
    adminProductSubmit.disabled = false;
  }
}

async function submitCategoryForm(event) {
  event.preventDefault();

  if (!isAdminUser()) {
    showAdminFeedback('Solo un administrador autenticado puede guardar categorías.', 'danger');
    return;
  }

  const payload = {
    name: adminCategoryNameInput.value.trim(),
    description: adminCategoryDescriptionInput.value.trim()
  };

  adminCategorySubmit.disabled = true;
  setAdminStatus(adminCategoriesStatus, 'Guardando...', 'warning');

  try {
    const isEditing = Boolean(editingCategoryId);
    await fetchJson(
      isEditing ? `/api/categorias/${editingCategoryId}` : '/api/categorias',
      'No se pudo guardar la categoría.',
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      }
    );

    showAdminFeedback(isEditing ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.', 'success');
    resetCategoryForm();
    await refreshAdminAfterMutation('categories');
    setAdminStatus(adminCategoriesStatus, 'Actualizado', 'success');
  } catch (error) {
    showAdminFeedback(error.message, 'danger');
    setAdminStatus(adminCategoriesStatus, 'Error', 'danger');
  } finally {
    adminCategorySubmit.disabled = false;
  }
}

async function submitClientForm(event) {
  event.preventDefault();

  if (!isAdminUser()) {
    showAdminFeedback('Solo un administrador autenticado puede guardar clientes.', 'danger');
    return;
  }

  const payload = {
    name: adminClientNameInput.value.trim(),
    email: adminClientEmailInput.value.trim()
  };

  adminClientSubmit.disabled = true;
  setAdminStatus(adminClientsStatus, 'Guardando...', 'warning');

  try {
    const isEditing = Boolean(editingClientId);
    await fetchJson(
      isEditing ? `/api/clientes/${editingClientId}` : '/api/clientes',
      'No se pudo guardar el cliente.',
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      }
    );

    showAdminFeedback(isEditing ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.', 'success');
    resetClientForm();
    await refreshAdminAfterMutation('clients');
    setAdminStatus(adminClientsStatus, 'Actualizado', 'success');
  } catch (error) {
    showAdminFeedback(error.message, 'danger');
    setAdminStatus(adminClientsStatus, 'Error', 'danger');
  } finally {
    adminClientSubmit.disabled = false;
  }
}

async function submitDiscountForm(event) {
  event.preventDefault();

  if (!isAdminUser()) {
    showAdminFeedback('Solo un administrador autenticado puede guardar descuentos.', 'danger');
    return;
  }

  const payload = {
    code: adminDiscountCodeInput.value.trim(),
    percent: Number(adminDiscountPercentInput.value),
    minTotal: Number(adminDiscountMinTotalInput.value)
  };

  adminDiscountSubmit.disabled = true;
  setAdminStatus(adminDiscountsStatus, 'Guardando...', 'warning');

  try {
    const isEditing = Boolean(editingDiscountId);
    await fetchJson(
      isEditing ? `/api/descuentos/${editingDiscountId}` : '/api/descuentos',
      'No se pudo guardar el descuento.',
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      }
    );

    showAdminFeedback(isEditing ? 'Descuento actualizado correctamente.' : 'Descuento creado correctamente.', 'success');
    resetDiscountForm();
    await refreshAdminAfterMutation('discounts');
    setAdminStatus(adminDiscountsStatus, 'Actualizado', 'success');
  } catch (error) {
    showAdminFeedback(error.message, 'danger');
    setAdminStatus(adminDiscountsStatus, 'Error', 'danger');
  } finally {
    adminDiscountSubmit.disabled = false;
  }
}

function editAdminEntity(entity, id) {
  const stateItemsMap = {
    product: adminState.products.items,
    category: adminState.categories.items,
    client: adminState.clients.items,
    discount: adminState.discounts.items
  };

  const item = stateItemsMap[entity].find(entry => entry.id === id);

  if (!item) {
    return;
  }

  if (entity === 'product') populateProductForm(item);
  if (entity === 'category') populateCategoryForm(item);
  if (entity === 'client') populateClientForm(item);
  if (entity === 'discount') populateDiscountForm(item);
}

async function deleteAdminEntity(entity, id) {
  if (!isAdminUser()) {
    showAdminFeedback('Solo un administrador autenticado puede eliminar registros.', 'danger');
    return;
  }

  const config = {
    product: { endpoint: '/api/productos', label: 'producto', resource: 'products', status: adminProductsStatus },
    category: { endpoint: '/api/categorias', label: 'categoría', resource: 'categories', status: adminCategoriesStatus },
    client: { endpoint: '/api/clientes', label: 'cliente', resource: 'clients', status: adminClientsStatus },
    discount: { endpoint: '/api/descuentos', label: 'descuento', resource: 'discounts', status: adminDiscountsStatus }
  }[entity];

  if (!window.confirm(`¿Querés eliminar este ${config.label}?`)) {
    return;
  }

  setAdminStatus(config.status, 'Eliminando...', 'warning');

  try {
    await fetchJson(`${config.endpoint}/${id}`, `No se pudo eliminar el ${config.label}.`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    showAdminFeedback(`${config.label[0].toUpperCase()}${config.label.slice(1)} eliminado correctamente.`, 'success');

    if (entity === 'product' && editingProductId === id) resetProductForm();
    if (entity === 'category' && editingCategoryId === id) resetCategoryForm();
    if (entity === 'client' && editingClientId === id) resetClientForm();
    if (entity === 'discount' && editingDiscountId === id) resetDiscountForm();

    await refreshAdminAfterMutation(config.resource);
    setAdminStatus(config.status, 'Actualizado', 'success');
  } catch (error) {
    showAdminFeedback(error.message, 'danger');
    setAdminStatus(config.status, 'Error', 'danger');
  }
}

function changeAdminTab(tab) {
  adminState.activeTab = tab;
  renderAdminTabs();
}

async function changeAdminPage(resource, direction) {
  const currentPage = adminState[resource].pagination.page;
  const nextPage = currentPage + direction;

  if (nextPage < 1) {
    return;
  }

  await loadAdminResource(resource, nextPage);
}

function scheduleAdminSearch(resource, delay = 0) {
  clearTimeout(adminSearchTimers[resource]);
  adminSearchTimers[resource] = window.setTimeout(() => {
    loadAdminResource(resource, 1);
  }, delay);
}

function toggleAdminSort(resource, field) {
  const state = adminCatalogState[resource];

  if (state.sortBy === field) {
    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortBy = field;
    state.sortOrder = 'asc';
  }

  scheduleAdminSearch(resource);
}

function resetAdminCatalogFilters(resource) {
  const state = adminCatalogState[resource];
  state.search = '';
  state.sortBy = 'id';
  state.sortOrder = 'asc';

  if (resource === 'products') {
    state.filters = { name: '', category: '', stock: '' };
  }

  if (resource === 'categories') {
    state.filters = { name: '' };
  }

  if (resource === 'clients') {
    state.filters = { name: '', email: '' };
  }

  if (resource === 'discounts') {
    state.filters = { code: '', percent: '' };
  }

  syncAdminControls();
  scheduleAdminSearch(resource);
}

async function exportAdminResource(resource) {
  if (!isAdminUser()) {
    showAdminFeedback('Solo un administrador autenticado puede exportar información.', 'danger');
    return;
  }

  const endpoints = {
    products: {
      primaryUrl: '/api/admin/productos?format=csv',
      fallbackUrl: '/api/productos?format=csv',
      filename: 'productos.csv'
    },
    categories: {
      primaryUrl: '/api/admin/categorias?format=csv',
      fallbackUrl: '/api/categorias?format=csv',
      filename: 'categorias.csv'
    },
    clients: {
      primaryUrl: '/api/admin/clientes?format=csv',
      fallbackUrl: '/api/clientes?format=csv',
      filename: 'clientes.csv'
    },
    discounts: {
      primaryUrl: '/api/admin/descuentos?format=csv',
      fallbackUrl: '/api/descuentos?format=csv',
      filename: 'descuentos.csv'
    }
  };

  try {
    // Aunque el boton diga "Bajar Excel", tecnicamente descargamos CSV.
    // Eso es intencional: Excel lo abre sin problema y la implementacion
    // queda didactica, sin sumar librerias extras solo para exportar.
    try {
      await downloadFile(endpoints[resource].primaryUrl, endpoints[resource].filename);
    } catch (error) {
      if (!error.message.includes('HTML') && !error.message.includes('JSON')) {
        throw error;
      }

      await downloadFile(endpoints[resource].fallbackUrl, endpoints[resource].filename);
    }
    showAdminFeedback('Archivo exportado correctamente.', 'success');
  } catch (error) {
    showAdminFeedback(error.message, 'danger');
  }
}

productsGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-action="add-to-cart"]');
  if (!button) return;
  addToCart(Number(button.dataset.id));
});

cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  updateCartItem(Number(button.dataset.id), button.dataset.action);
});

adminPanel.addEventListener('click', event => {
  const actionButton = event.target.closest('[data-entity][data-action]');
  if (actionButton) {
    const entity = actionButton.dataset.entity;
    const action = actionButton.dataset.action;
    const id = Number(actionButton.dataset.id);

    if (action === 'edit') editAdminEntity(entity, id);
    if (action === 'delete') deleteAdminEntity(entity, id);
    return;
  }

  const tabButton = event.target.closest('[data-admin-tab]');
  if (tabButton) {
    changeAdminTab(tabButton.dataset.adminTab);
    return;
  }

  const sortButton = event.target.closest('[data-admin-sort-resource][data-admin-sort-field]');
  if (sortButton) {
    toggleAdminSort(sortButton.dataset.adminSortResource, sortButton.dataset.adminSortField);
  }
});

reloadProductsButton.addEventListener('click', async () => {
  await loadSupportData();
  await loadProducts();
  await loadAllAdminPages();
});

loginButton.addEventListener('click', login);

logoutButton.addEventListener('click', () => {
  clearAuthSession();
  closeAdminWorkspace();
  updateSessionUI();
  hideCheckoutFeedback();
  resetProductForm();
  resetCategoryForm();
  resetClientForm();
  resetDiscountForm();
  showAuthFeedback('Sesión cerrada.', 'info');
});

adminPanelButton.addEventListener('click', async () => {
  openAdminWorkspace();
  renderAdminTabs();
  await loadAdminResource(adminState.activeTab, adminState[adminState.activeTab].pagination.page);
});

adminPanelClose.addEventListener('click', () => {
  closeAdminWorkspace();
});

clearCartButton.addEventListener('click', () => {
  cart = [];
  saveCart();
  hideCheckoutFeedback();
  renderCart();
});

checkoutButton.addEventListener('click', checkout);

categoryFilter.addEventListener('change', () => {
  loadProducts(categoryFilter.value);
});

searchInput.addEventListener('input', renderProducts);

adminProductForm.addEventListener('submit', submitProductForm);
adminCategoryForm.addEventListener('submit', submitCategoryForm);
adminClientForm.addEventListener('submit', submitClientForm);
adminDiscountForm.addEventListener('submit', submitDiscountForm);

adminProductCancel.addEventListener('click', resetProductForm);
adminCategoryCancel.addEventListener('click', resetCategoryForm);
adminClientCancel.addEventListener('click', resetClientForm);
adminDiscountCancel.addEventListener('click', resetDiscountForm);

adminProductsNew.addEventListener('click', () => {
  resetProductForm();
  setAdminFormVisibility('products', true);
});
adminCategoriesNew.addEventListener('click', () => {
  resetCategoryForm();
  setAdminFormVisibility('categories', true);
});
adminClientsNew.addEventListener('click', () => {
  resetClientForm();
  setAdminFormVisibility('clients', true);
});
adminDiscountsNew.addEventListener('click', () => {
  resetDiscountForm();
  setAdminFormVisibility('discounts', true);
});

adminProductsSearch.addEventListener('input', event => {
  adminCatalogState.products.search = event.target.value;
  scheduleAdminSearch('products', 300);
});
adminProductsSortBy.addEventListener('change', event => {
  adminCatalogState.products.sortBy = event.target.value;
  scheduleAdminSearch('products');
});
adminProductsSortOrder.addEventListener('change', event => {
  adminCatalogState.products.sortOrder = event.target.value;
  scheduleAdminSearch('products');
});
adminCategoriesSearch.addEventListener('input', event => {
  adminCatalogState.categories.search = event.target.value;
  scheduleAdminSearch('categories', 300);
});
adminCategoriesSortBy.addEventListener('change', event => {
  adminCatalogState.categories.sortBy = event.target.value;
  scheduleAdminSearch('categories');
});
adminCategoriesSortOrder.addEventListener('change', event => {
  adminCatalogState.categories.sortOrder = event.target.value;
  scheduleAdminSearch('categories');
});
adminClientsSearch.addEventListener('input', event => {
  adminCatalogState.clients.search = event.target.value;
  scheduleAdminSearch('clients', 300);
});
adminClientsSortBy.addEventListener('change', event => {
  adminCatalogState.clients.sortBy = event.target.value;
  scheduleAdminSearch('clients');
});
adminClientsSortOrder.addEventListener('change', event => {
  adminCatalogState.clients.sortOrder = event.target.value;
  scheduleAdminSearch('clients');
});
adminDiscountsSearch.addEventListener('input', event => {
  adminCatalogState.discounts.search = event.target.value;
  scheduleAdminSearch('discounts', 300);
});
adminDiscountsSortBy.addEventListener('change', event => {
  adminCatalogState.discounts.sortBy = event.target.value;
  scheduleAdminSearch('discounts');
});
adminDiscountsSortOrder.addEventListener('change', event => {
  adminCatalogState.discounts.sortOrder = event.target.value;
  scheduleAdminSearch('discounts');
});

adminProductsFilterName.addEventListener('input', event => {
  adminCatalogState.products.filters.name = event.target.value;
  scheduleAdminSearch('products', 300);
});
adminProductsFilterCategory.addEventListener('input', event => {
  adminCatalogState.products.filters.category = event.target.value;
  scheduleAdminSearch('products', 300);
});
adminProductsFilterStock.addEventListener('input', event => {
  adminCatalogState.products.filters.stock = event.target.value;
  scheduleAdminSearch('products', 300);
});
adminCategoriesFilterName.addEventListener('input', event => {
  adminCatalogState.categories.filters.name = event.target.value;
  scheduleAdminSearch('categories', 300);
});
adminClientsFilterName.addEventListener('input', event => {
  adminCatalogState.clients.filters.name = event.target.value;
  scheduleAdminSearch('clients', 300);
});
adminClientsFilterEmail.addEventListener('input', event => {
  adminCatalogState.clients.filters.email = event.target.value;
  scheduleAdminSearch('clients', 300);
});
adminDiscountsFilterCode.addEventListener('input', event => {
  adminCatalogState.discounts.filters.code = event.target.value;
  scheduleAdminSearch('discounts', 300);
});
adminDiscountsFilterPercent.addEventListener('input', event => {
  adminCatalogState.discounts.filters.percent = event.target.value;
  scheduleAdminSearch('discounts', 300);
});

adminProductsClearFilters.addEventListener('click', () => resetAdminCatalogFilters('products'));
adminCategoriesClearFilters.addEventListener('click', () => resetAdminCatalogFilters('categories'));
adminClientsClearFilters.addEventListener('click', () => resetAdminCatalogFilters('clients'));
adminDiscountsClearFilters.addEventListener('click', () => resetAdminCatalogFilters('discounts'));

adminProductsPrev.addEventListener('click', () => changeAdminPage('products', -1));
adminProductsNext.addEventListener('click', () => changeAdminPage('products', 1));
adminCategoriesPrev.addEventListener('click', () => changeAdminPage('categories', -1));
adminCategoriesNext.addEventListener('click', () => changeAdminPage('categories', 1));
adminClientsPrev.addEventListener('click', () => changeAdminPage('clients', -1));
adminClientsNext.addEventListener('click', () => changeAdminPage('clients', 1));
adminDiscountsPrev.addEventListener('click', () => changeAdminPage('discounts', -1));
adminDiscountsNext.addEventListener('click', () => changeAdminPage('discounts', 1));

adminProductsExport.addEventListener('click', () => exportAdminResource('products'));
adminCategoriesExport.addEventListener('click', () => exportAdminResource('categories'));
adminClientsExport.addEventListener('click', () => exportAdminResource('clients'));
adminDiscountsExport.addEventListener('click', () => exportAdminResource('discounts'));

async function initializeScreen() {
  loadAuthSession();
  closeAdminWorkspace();
  updateSessionUI();
  loadCartFromStorage();
  renderCart();
  resetProductForm();
  resetCategoryForm();
  resetClientForm();
  resetDiscountForm();
  renderAdminPanel();
  await loadSupportData();
  await loadProducts();
  if (isAdminUser()) {
    await loadAllAdminPages();
  }
}

initializeScreen();
