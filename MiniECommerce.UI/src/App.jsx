import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import {
  addToCart,
  cancelOrderRequest,
  checkoutOrder,
  clearCart,
  createProduct,
  deleteProduct as deleteProductRequest,
  getCart,
  getCategories,
  getOrders,
  getProducts,
  getProfile,
  loginUser,
  registerUser,
  removeFromCart,
  updateProduct,
} from './services/api'

const sortOptions = [
  { value: '', label: 'Default' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'nameAsc', label: 'Name: A-Z' },
  { value: 'nameDesc', label: 'Name: Z-A' },
]

const getStoredAuth = () => ({
  token: localStorage.getItem('token') || '',
  email: localStorage.getItem('email') || '',
  role: localStorage.getItem('role') || '',
})

const formatCurrency = (value) => `${value ?? 0} TL`

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString('tr-TR')
}

const getOrderStatusLabel = (status) => {
  if (status === 'IptalEdildi') {
    return 'Iptal edildi'
  }

  return 'Siparis alindi'
}

function App() {
  const [products, setProducts] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [authMode, setAuthMode] = useState('login')
  const [authState, setAuthState] = useState(getStoredAuth)
  const [profile, setProfile] = useState(null)
  const [authForm, setAuthForm] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [editingProductId, setEditingProductId] = useState('')
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Telefon',
  })

  const [cart, setCart] = useState(null)
  const [orders, setOrders] = useState([])

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
  })

  const isLoggedIn = Boolean(authState.token)
  const isAdmin = (profile?.role || authState.role) === 'Admin'
  const cartItems = cart?.items ?? []
  const location = useLocation()
  const navigate = useNavigate()
  const activeView = location.pathname.startsWith('/my-space') ? 'dashboard' : 'products'

  const buildProductsUrl = () => {
    const params = new URLSearchParams()

    params.append('pageNumber', '1')
    params.append('pageSize', '20')

    if (filters.search.trim()) params.append('search', filters.search.trim())
    if (filters.category) params.append('category', filters.category)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.inStock) params.append('inStock', 'true')

    return params.toString()
  }

  const getAuthHeaders = (includeJson = true) => {
    const headers = {
      Authorization: `Bearer ${authState.token}`,
    }

    if (includeJson) {
      headers['Content-Type'] = 'application/json'
    }

    return headers
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const queryString = buildProductsUrl()
      const data = await getProducts(queryString)
      setProducts(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategoryOptions(data ?? [])
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchProfile = async (token) => {
    const data = await getProfile(token)

    setProfile(data)

    if (data?.email || data?.role) {
      const nextAuthState = {
        token,
        email: data?.email || authState.email,
        role: data?.role || authState.role,
      }

      localStorage.setItem('token', nextAuthState.token)
      localStorage.setItem('email', nextAuthState.email)
      localStorage.setItem('role', nextAuthState.role)
      setAuthState(nextAuthState)
    }
  }

  const fetchCart = async () => {
    if (!authState.token) return
    const data = await getCart(getAuthHeaders(false))
    setCart(data)
  }

  const fetchOrders = async () => {
    if (!authState.token) return
    const data = await getOrders(getAuthHeaders(false))
    setOrders(data ?? [])
  }

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!authState.token) {
      setProfile(null)
      setCart(null)
      setOrders([])
      return
    }

    const bootstrapUser = async () => {
      try {
        setError('')
        await fetchProfile(authState.token)
        await fetchCart()
        await fetchOrders()
      } catch (err) {
        setError(err.message)
      }
    }

    bootstrapUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.token])

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target

    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    fetchProducts()
  }

  const handleFilterReset = () => {
    setFilters({
      search: '',
      category: '',
      sortBy: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
    })

    setTimeout(() => {
      fetchProducts()
    }, 0)
  }

  const handleAuthFormChange = (event) => {
    const { name, value } = event.target

    setAuthForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProductFormChange = (event) => {
    const { name, value } = event.target

    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetProductForm = () => {
    setEditingProductId('')
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: 'Telefon',
    })
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const endpoint =
        authMode === 'register' ? '/api/auth/register' : '/api/auth/login'

      const payload =
        authMode === 'register'
          ? {
              fullName: authForm.fullName,
              email: authForm.email,
              password: authForm.password,
            }
          : {
              email: authForm.email,
              password: authForm.password,
            }

      const data =
        authMode === 'register'
          ? await registerUser(payload)
          : await loginUser(payload)

      if (authMode === 'register') {
        setMessage('Registration successful. You can log in now.')
        setAuthMode('login')
        setAuthForm((prev) => ({
          ...prev,
          password: '',
        }))
        return
      }

      const nextAuth = {
        token: data.token,
        email: data.email,
        role: data.role,
      }

      localStorage.setItem('token', nextAuth.token)
      localStorage.setItem('email', nextAuth.email)
      localStorage.setItem('role', nextAuth.role)

      setAuthState(nextAuth)
      setMessage('Login successful.')
      setAuthForm({
        fullName: '',
        email: '',
        password: '',
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    setAuthState({
      token: '',
      email: '',
      role: '',
    })
    setProfile(null)
    setCart(null)
    setOrders([])
    setMessage('You have been logged out.')
  }

  const handleAddToCart = async (productId) => {
    if (!authState.token) {
      setError('Please log in before adding products to cart.')
      return
    }

    setError('')
    setMessage('')

    try {
      const data = await addToCart(getAuthHeaders(), {
        productId,
        quantity: 1,
      })
      setMessage(data?.message || 'Product added to cart.')
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateOrUpdateProduct = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const isEditing = Boolean(editingProductId)
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category: productForm.category,
      }

      if (isEditing) {
        await updateProduct(editingProductId, getAuthHeaders(), payload)
      } else {
        await createProduct(getAuthHeaders(), payload)
      }

      setMessage(isEditing ? 'Product updated successfully.' : 'Product created successfully.')
      resetProductForm()
      await fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product.id)
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
    })
    setMessage(`Editing: ${product.name}`)
    setError('')
    navigate('/my-space')
  }

  const handleDeleteProduct = async (productId) => {
    setError('')
    setMessage('')

    try {
      await deleteProductRequest(productId, getAuthHeaders(false))
      setMessage('Product deleted successfully.')
      await fetchProducts()
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveFromCart = async (cartItemId) => {
    setError('')
    setMessage('')

    try {
      await removeFromCart(cartItemId, getAuthHeaders(false))
      setMessage('Product removed from cart.')
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleClearCart = async () => {
    setError('')
    setMessage('')

    try {
      await clearCart(getAuthHeaders(false))
      setMessage('Cart cleared.')
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCheckout = async () => {
    if (!authState.token) return

    setError('')
    setMessage('')

    try {
      const data = await checkoutOrder(getAuthHeaders(false))
      setMessage(`Order created successfully: ${data.orderId}`)
      await fetchCart()
      await fetchOrders()
      await fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRefreshCart = async () => {
    try {
      setError('')
      await fetchCart()
      setMessage('Cart refreshed.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRefreshOrders = async () => {
    try {
      setError('')
      await fetchOrders()
      setMessage('Orders refreshed.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancelOrder = async (orderId) => {
    setError('')
    setMessage('')

    try {
      await cancelOrderRequest(orderId, getAuthHeaders(false))
      setMessage('Order cancelled successfully.')
      await fetchOrders()
      await fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <nav className="topbar">
        <div className="brand-block">
          <p className="brand-title">MiniECommerce</p>
          <p className="brand-subtitle">Store dashboard</p>
        </div>

        <div className="topbar-links">
          <button
            type="button"
            className={activeView === 'products' ? 'nav-link active' : 'nav-link'}
            onClick={() => navigate('/products')}
          >
            Products
          </button>
          <button
            type="button"
            className={activeView === 'dashboard' ? 'nav-link active' : 'nav-link'}
            onClick={() => navigate('/my-space')}
          >
            My Space
          </button>
        </div>

        <div className="topbar-user">
          {isLoggedIn ? (
            <>
              <span>{profile?.email || authState.email}</span>
              <span className="role-badge">{profile?.role || authState.role}</span>
            </>
          ) : (
            <span>Guest mode</span>
          )}
        </div>
      </nav>

      <header className="hero">
        <p className="eyebrow">MiniECommerce</p>
        {activeView === 'products' ? (
          <>
            <h1>Products</h1>
            <p className="subtitle">
              Search, filter, and sort products from your backend API.
            </p>
          </>
        ) : (
          <>
            <h1>Account Hub</h1>
            <p className="subtitle">
              Manage your account, cart, orders, and admin tools in one place.
            </p>
          </>
        )}
      </header>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/products" replace />}
        />
        <Route
          path="/products"
          element={
            <>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}

              <form className="filters" onSubmit={handleFilterSubmit}>
                <input
                  name="search"
                  type="text"
                  placeholder="Search by name or description"
                  value={filters.search}
                  onChange={handleFilterChange}
                />

                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  {categoryOptions.map((category) => (
                    <option
                      key={
                        typeof category === 'string'
                          ? category || 'all'
                          : category?.value ?? 'all'
                      }
                      value={typeof category === 'string' ? category : category?.name ?? ''}
                    >
                      {typeof category === 'string'
                        ? category || 'All Categories'
                        : category?.name || 'All Categories'}
                    </option>
                  ))}
                </select>

                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                  {sortOptions.map((option) => (
                    <option key={option.value || 'default'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <input
                  name="minPrice"
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />

                <input
                  name="maxPrice"
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />

                <label className="checkbox">
                  <input
                    name="inStock"
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={handleFilterChange}
                  />
                  In stock only
                </label>

                <div className="filter-actions">
                  <button type="submit">Apply</button>
                  <button type="button" className="secondary" onClick={handleFilterReset}>
                    Reset
                  </button>
                </div>
              </form>

              {loading && <p className="info">Loading products...</p>}

              <section className="products-section" id="products">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Catalog</p>
                    <h2>All Products</h2>
                  </div>
                  <p className="muted-text">Browse, add to cart, or manage products as admin.</p>
                </div>

                <div className="grid">
                  {products.map((product) => (
                    <article key={product.id} className="card">
                      <span className="category">{product.category}</span>
                      <h2>{product.name}</h2>
                      <p className="description">{product.description}</p>
                      <p className="price">{formatCurrency(product.price)}</p>
                      <p className={`stock ${product.stock <= 0 ? 'stock-out' : ''}`}>
                        {product.stock <= 0 ? 'Out of stock' : `Stock: ${product.stock}`}
                      </p>
                      <button
                        className={`primary-button ${product.stock <= 0 ? 'disabled-button' : ''}`}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock <= 0}
                      >
                        {product.stock <= 0 ? 'Unavailable' : 'Add to cart'}
                      </button>

                      {isAdmin && (
                        <div className="card-actions">
                          <button
                            className="ghost-button full-width"
                            onClick={() => {
                              handleEditProduct(product)
                            }}
                          >
                            Edit product
                          </button>
                          <button
                            className="danger-button full-width"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete product
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </>
          }
        />
        <Route
          path="/my-space"
          element={
            <>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}

              <section className="dashboard" id="overview">
            <div className="panel auth-panel">
              <div className="panel-header">
                <h2>Account</h2>
                {isLoggedIn ? (
                  <button className="ghost-button" onClick={handleLogout}>
                    Logout
                  </button>
                ) : (
                  <div className="mode-switch">
                    <button
                      className={authMode === 'login' ? 'active' : ''}
                      onClick={() => setAuthMode('login')}
                      type="button"
                    >
                      Login
                    </button>
                    <button
                      className={authMode === 'register' ? 'active' : ''}
                      onClick={() => setAuthMode('register')}
                      type="button"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>

              {isLoggedIn ? (
                <div className="profile-box">
                  <p>
                    <strong>Email:</strong> {profile?.email || authState.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {profile?.role || authState.role}
                  </p>
                  <p>
                    <strong>User Id:</strong> {profile?.userId || 'Loading...'}
                  </p>
                </div>
              ) : (
                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === 'register' && (
                    <input
                      name="fullName"
                      type="text"
                      placeholder="Full name"
                      value={authForm.fullName}
                      onChange={handleAuthFormChange}
                    />
                  )}

                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={authForm.email}
                    onChange={handleAuthFormChange}
                  />

                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={authForm.password}
                    onChange={handleAuthFormChange}
                  />

                  <button type="submit">
                    {authMode === 'register' ? 'Create account' : 'Login'}
                  </button>
                </form>
              )}
            </div>

            <div className="panel side-panel">
              <div className="panel-header">
                <h2>Cart</h2>
                {isLoggedIn && (
                  <button className="ghost-button" onClick={handleRefreshCart}>
                    Refresh
                  </button>
                )}
              </div>

              {isLoggedIn ? (
                <>
                  <p className="summary-line">
                    Items: <strong>{cartItems.length}</strong>
                  </p>
                  <p className="summary-line">
                    Total: <strong>{formatCurrency(cart?.totalAmount)}</strong>
                  </p>

                  <div className="stack-actions">
                    <button
                      className="primary-button"
                      onClick={handleCheckout}
                      disabled={!cartItems.length}
                    >
                      Checkout
                    </button>
                    <button
                      className="ghost-button full-width"
                      onClick={handleClearCart}
                      disabled={!cartItems.length}
                    >
                      Clear cart
                    </button>
                  </div>

                  <div className="item-list">
                    {cartItems.length ? (
                      cartItems.map((item) => (
                        <article key={item.cartItemId} className="mini-card">
                          <div>
                            <h3>{item.productName}</h3>
                            <p>Quantity: {item.quantity}</p>
                            <p>Total: {formatCurrency(item.totalPrice)}</p>
                          </div>
                          <button
                            className="danger-button"
                            onClick={() => handleRemoveFromCart(item.cartItemId)}
                          >
                            Remove
                          </button>
                        </article>
                      ))
                    ) : (
                      <p className="muted-text">Your cart is empty.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="muted-text">Log in to manage your cart.</p>
              )}
            </div>

            <div className="panel side-panel">
              <div className="panel-header">
                <h2>Orders</h2>
                {isLoggedIn && (
                  <button className="ghost-button" onClick={handleRefreshOrders}>
                    Refresh
                  </button>
                )}
              </div>

              {isLoggedIn ? (
                <>
                  <p className="summary-line">
                    Total orders: <strong>{orders.length}</strong>
                  </p>
                  {orders[0] && (
                    <p className="summary-line">
                      Last order total: <strong>{formatCurrency(orders[0].totalAmount)}</strong>
                    </p>
                  )}

                  <div className="item-list">
                    {orders.length ? (
                      orders.map((order) => (
                        <article key={order.orderId} className="mini-card order-card">
                          <div className="order-meta">
                            <div className="order-title-row">
                              <h3>Order #{order.orderId.slice(0, 8)}</h3>
                              <span
                                className={`status-badge ${
                                  order.status === 'IptalEdildi' ? 'status-cancelled' : ''
                                }`}
                              >
                                {getOrderStatusLabel(order.status)}
                              </span>
                            </div>
                            <p>Date: {formatDate(order.orderDate)}</p>
                            <p>Total: {formatCurrency(order.totalAmount)}</p>
                          </div>

                          <div className="order-items">
                            {order.items.map((item) => (
                              <div key={item.orderItemId} className="order-item-row">
                                <span>{item.productName}</span>
                                <span>
                                  {item.quantity} x {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.status !== 'IptalEdildi' && (
                            <button
                              className="danger-button"
                              onClick={() => handleCancelOrder(order.orderId)}
                            >
                              Cancel order
                            </button>
                          )}
                        </article>
                      ))
                    ) : (
                      <p className="muted-text">No orders yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="muted-text">Log in to see your orders.</p>
              )}
            </div>
          </section>

          {isAdmin && (
            <section className="panel admin-panel" id="admin-panel">
              <div className="panel-header">
                <h2>{editingProductId ? 'Edit Product' : 'Admin Product Panel'}</h2>
                {editingProductId && (
                  <button className="ghost-button" type="button" onClick={resetProductForm}>
                    Cancel edit
                  </button>
                )}
              </div>

              <form className="admin-form" onSubmit={handleCreateOrUpdateProduct}>
                <input
                  name="name"
                  type="text"
                  placeholder="Product name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                />

                <input
                  name="description"
                  type="text"
                  placeholder="Description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                />

                <input
                  name="price"
                  type="number"
                  min="0"
                  placeholder="Price"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                />

                <input
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={handleProductFormChange}
                />

                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                >
                  {categoryOptions
                    .filter((category) => category)
                    .map((category) => (
                      <option
                        key={typeof category === 'string' ? category : category.value}
                        value={typeof category === 'string' ? category : category.name}
                      >
                        {typeof category === 'string' ? category : category.name}
                      </option>
                    ))}
                </select>

                <button type="submit">
                  {editingProductId ? 'Update product' : 'Create product'}
                </button>
              </form>
            </section>
          )}
            </>
          }
        />
        <Route
          path="*"
          element={<Navigate to="/products" replace />}
        />
      </Routes>
    </div>
  )
}

export default App
