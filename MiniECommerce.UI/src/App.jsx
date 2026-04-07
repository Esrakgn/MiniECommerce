import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import { translations } from './i18n'
import {
  addToCart,
  addFavoriteRequest,
  cancelOrderRequest,
  checkoutOrder,
  clearCart,
  createProduct,
  deleteProduct as deleteProductRequest,
  getCart,
  getCategories,
  getFavorites,
  getProductById,
  getOrders,
  getProducts,
  getProfile,
  loginUser,
  removeFavoriteRequest,
  registerUser,
  removeFromCart,
  updateCartItemQuantity as updateCartItemQuantityRequest,
  updateProduct,
} from './services/api'

const PRODUCTS_PAGE_SIZE = 20
const MAX_COMPARE_ITEMS = 10

const getStoredAuth = () => ({
  token: localStorage.getItem('token') || '',
  email: localStorage.getItem('email') || '',
  role: localStorage.getItem('role') || '',
})

const getStoredLanguage = () => localStorage.getItem('language') || 'tr'

const getStoredCompareIds = () => {
  const storedValue = localStorage.getItem('compareProductIds')

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

const formatCurrency = (value) => `${value ?? 0} TL`

const formatDate = (value, language = 'tr') => {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')
}

const normalizeText = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9ığüşöç]/gi, '')

const getProductImageUrl = (product) => {
  if (product?.imageUrl) {
    return product.imageUrl
  }

  const normalizedName = normalizeText(product?.name)
  const normalizedCategory = normalizeText(product?.category)

  const productImageMap = [
    { match: 'iphone15', image: '/images/phones/iphone15.png' },
    { match: 'iphone17', image: '/images/phones/iphone-17.webp' },
    { match: 'samsunggalaxys24', image: '/images/phones/Samsung-Galaxy-S25.jpg' },
    { match: 'samsunggalaxys25', image: '/images/phones/Samsung-Galaxy-S25.jpg' },
    { match: 'xiaomi14', image: '/images/phones/Xiaomi14.png' },
    { match: 'ipadair', image: '/images/tablets/ipadair.jpg' },
    { match: 'ipadpro', image: '/images/tablets/ipadpro.jpg' },
    { match: 'galaxytabs9', image: '/images/tablets/samsungtabs9.jpg' },
    { match: 'tabs9', image: '/images/tablets/samsungtabs9.jpg' },
    { match: 'tabs10', image: '/images/tablets/samsungtabs10.jfif' },
    { match: 'lenovothinkpade14', image: '/images/laptops/LenovoThinkPadE14.jpg' },
    { match: 'lenovoyogaslim7', image: '/images/laptops/LenovoYogaSlim7.webp' },
    { match: 'macbookair', image: '/images/laptops/MacBookAirM4.jfif' },
    { match: 'monsterabraa5', image: '/images/laptops/MonsterAbraA5.webp' },
    { match: 'airpods', image: '/images/headphones/airpods3.webp' },
    { match: 'applewatchseries9', image: '/images/accessories/AppleWatchSeries9.jfif' },
    { match: 'applemagsafecharger', image: '/images/accessories/AppleMagSafeCharger.jfif' },
    { match: 'jbltune770nc', image: '/images/headphones/jbltune770nc.jpg' },
    { match: 'keychronk2', image: '/images/keyboards/keychronk2.jpg' },
    { match: 'keychronk8pro', image: '/images/keyboards/KeychronK8Pro.webp' },
    { match: 'logitechgproxtkl', image: '/images/keyboards/LogitechGProXTKL.jpg' },
    { match: 'logitechmxmaster3s', image: '/images/mice/LogitechMXMaster3S.jpg' },
    { match: 'logitechmxmaster4', image: '/images/mice/LogitechMXMaster4.jfif' },
    { match: 'razerbasiliskv4', image: '/images/mice/RazerBasiliskV4.jfif' },
    { match: 'razerdeathadderv3', image: '/images/mice/RazerDeathAdderV3.jpg' },
    { match: 'samsunggalaxybudsfe', image: '/images/headphones/samsunggalaxybudsfe.webp' },
    { match: 'sonywh1000xm5', image: '/images/headphones/SonyWH1000XM5.jfif' },
    { match: 'xiaomipowerbank20000', image: '/images/accessories/XiaomiPowerbank20000.png' },
    { match: 'xiaomismartband10', image: '/images/accessories/XiaomiSmartBand10.jpg' },
    { match: 'dellultrasharp27', image: '/images/monitors/DellUltraSharp27.jfif' },
    { match: 'lgultragear32', image: '/images/monitors/LGUltraGear32.jfif' },
  ]
  //üründe özel imageUrl yoksa önce ada göre hazır resmi arıyoz

  const matchedProductImage = productImageMap.find((item) => normalizedName.includes(item.match))

  if (matchedProductImage) {
    return matchedProductImage.image
  }

  if (normalizedCategory.includes('telefon')) {
    return '/images/phones/iphone15.png'
  }

  if (normalizedCategory.includes('tablet')) {
    return '/images/tablets/ipadair.jpg'
  }

  if (normalizedCategory.includes('bilgisayar') || normalizedCategory.includes('laptop')) {
    return '/images/laptops/MacBookAirM4.jfif'
  }

  if (normalizedCategory.includes('aksesuar')) {
    return '/images/accessories/AppleWatchSeries9.jfif'
  }

  return ''
}
//adı ya da kategoriyi baz alıp ekranda boş kart kalmasını engelliyoz

const getOrderStatusLabel = (status, t) => {
  if (status === 'IptalEdildi') {
    return t.orderCancelledLabel
  }

  return t.orderReceivedLabel
}

const CartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="panel-title-icon">
    <path
      d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.7L21 7H7.1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="19" r="1.6" fill="currentColor" />
    <circle cx="17" cy="19" r="1.6" fill="currentColor" />
  </svg>
)

const OrderIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="panel-title-icon">
    <path
      d="M7 3.5h10a2 2 0 0 1 2 2v13l-3-1.8-3 1.8-3-1.8-3 1.8v-13a2 2 0 0 1 2-2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 8.5h5M9.5 12h5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const HeartIcon = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`favorite-icon ${filled ? 'filled' : ''}`}>
    <path
      d="M12 20.4 4.9 13.7a4.8 4.8 0 0 1 6.8-6.8L12 7.2l.3-.3a4.8 4.8 0 0 1 6.8 6.8Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CompareIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="compare-icon">
    <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" />
    <path
      d="M10 8h4M10 16h4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

function ProductDetailsPage({
  isLoggedIn,
  t,
  onAddToCart,
  onToggleFavorite,
  onToggleCompare,
  isFavoriteProduct,
  isComparedProduct,
  favoriteActionProductId,
  addToFavoritesLabel,
  removeFromFavoritesLabel,
  addToCompareLabel,
  removeFromCompareLabel,
}) {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      try {
        setLoadingDetail(true)
        setDetailError('')

        const data = await getProductById(productId)

        if (isMounted) {
          setProduct(data)
        }
      } catch (err) {
        if (isMounted) {
          setDetailError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoadingDetail(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  if (loadingDetail) {
    return <p className="info">{t.loadingProductDetails}</p>
  }

  if (detailError) {
    return (
      <section className="detail-page">
        <div className="panel detail-panel">
          <p className="error detail-inline-message">{detailError}</p>
          <button type="button" className="ghost-button" onClick={() => navigate('/products')}>
            {t.backToProducts}
          </button>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="detail-page">
        <div className="panel detail-panel">
          <p className="muted-text">{t.productNotFound}</p>
        </div>
      </section>
    )
  }

  const isOutOfStock = product.stock <= 0
  const productImageUrl = getProductImageUrl(product)
  const isFavorite = isFavoriteProduct(product.id)
  const isCompared = isComparedProduct(product.id)
  const isFavoriteLoading = favoriteActionProductId === product.id

  return (
    <section className="detail-page">
      <div className="panel detail-visual-panel">
        <button type="button" className="ghost-button detail-back-button" onClick={() => navigate('/products')}>
          {t.backToProducts}
        </button>
        <div className="detail-visual-card">
          {productImageUrl && (
            <img
              src={productImageUrl}
              alt={product.name}
              className="detail-product-image"
            />
          )}
          <div className="detail-visual-top">
            <span className="category">{product.category}</span>
            <button
              type="button"
              className={`favorite-toggle-button ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(product.id)}
              disabled={isFavoriteLoading}
              aria-label={isFavorite ? removeFromFavoritesLabel : addToFavoritesLabel}
              title={isFavorite ? removeFromFavoritesLabel : addToFavoritesLabel}
            >
              <HeartIcon filled={isFavorite} />
            </button>
          </div>
          <h2 className="detail-visual-title">{product.name}</h2>
          <p className="detail-visual-copy">
            {t.detailIntro}
          </p>
        </div>
      </div>

      <div className="panel detail-panel">
        <p className="eyebrow">{t.productDetailsEyebrow}</p>
        <h2 className="detail-title">{product.name}</h2>
        <p className="detail-description">{product.description}</p>
        <p className="detail-price">{formatCurrency(product.price)}</p>

        <div className="detail-meta-list">
          <div className="detail-meta-row">
            <span>{t.category}</span>
            <strong>{product.category}</strong>
          </div>
          <div className="detail-meta-row">
            <span>{t.stock}</span>
            <strong className={isOutOfStock ? 'detail-stock-out' : 'detail-stock-in'}>
              {isOutOfStock ? t.outOfStock : t.availableCount(product.stock)}
            </strong>
          </div>
          <div className="detail-meta-row">
            <span>{t.status}</span>
            <strong>{isLoggedIn ? t.readyToOrder : t.loginRequiredForCart}</strong>
          </div>
        </div>

        <div className="detail-actions">
          <button
            type="button"
            className={`primary-button ${isOutOfStock ? 'disabled-button' : ''}`}
            onClick={() => onAddToCart(product.id)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? t.unavailable : t.addToCart}
          </button>
          <button type="button" className="ghost-button" onClick={() => navigate('/my-space')}>
            {t.viewCart}
          </button>
          <button
            type="button"
            className={`ghost-button compare-detail-button ${isCompared ? 'active-compare-button' : ''}`}
            onClick={() => onToggleCompare(product)}
          >
            {isCompared ? removeFromCompareLabel : addToCompareLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: PRODUCTS_PAGE_SIZE,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  const [categoryOptions, setCategoryOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [language, setLanguage] = useState(getStoredLanguage)

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
    imageUrl: '',
  })

  const [cart, setCart] = useState(null)
  const [orders, setOrders] = useState([])
  const [favorites, setFavorites] = useState([])
  const [compareProductIds, setCompareProductIds] = useState(getStoredCompareIds)
  const [compareProducts, setCompareProducts] = useState([])
  const [cartItemActionId, setCartItemActionId] = useState('')
  const [cartSummaryAction, setCartSummaryAction] = useState('')
  const [favoriteActionProductId, setFavoriteActionProductId] = useState('')

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
  const t = translations[language] ?? translations.tr
  const addToFavoritesLabel = t.addToFavorites ?? (language === 'tr' ? 'Favorilere ekle' : 'Add to favorites')
  const removeFromFavoritesLabel =
    t.removeFromFavorites ?? (language === 'tr' ? 'Favorilerden çıkar' : 'Remove from favorites')
  const loginBeforeFavoriteMessage =
    t.loginBeforeFavorite ?? (language === 'tr' ? 'Favorilere eklemeden önce giriş yapmalısınız.' : 'Please log in before adding products to favorites.')
  const favoriteAddedMessage =
    t.favoriteAddedSuccess ?? (language === 'tr' ? 'Ürün favorilere eklendi.' : 'Product added to favorites.')
  const favoriteRemovedMessage =
    t.favoriteRemovedSuccess ?? (language === 'tr' ? 'Ürün favorilerden kaldırıldı.' : 'Product removed from favorites.')
  const checkoutLabel = language === 'tr' ? 'Siparişi tamamla' : (t.checkout ?? 'Checkout')
  const navFavoritesLabel = t.navFavorites ?? (language === 'tr' ? 'Favoriler' : 'Favorites')
  const favoritesTitle = t.favoritesTitle ?? (language === 'tr' ? 'Favorilerim' : 'My Favorites')
  const favoritesSubtitle =
    t.favoritesSubtitle ?? (language === 'tr' ? 'BeÄŸendiÄŸin Ã¼rÃ¼nleri kaydet, sonra tekrar kolayca gÃ¶z at.' : 'Save the products you like and come back to them anytime.')
  const favoritesPanelTitle = t.favoritesPanelTitle ?? (language === 'tr' ? 'Favori ÃœrÃ¼nler' : 'Favorite Products')
  const noFavoritesYetText =
    t.noFavoritesYet ?? (language === 'tr' ? 'HenÃ¼z favori Ã¼rÃ¼nÃ¼n yok.' : 'You do not have any favorite products yet.')
  const loginToSeeFavoritesText =
    t.loginToSeeFavorites ?? (language === 'tr' ? 'Favorilerini gÃ¶rmek iÃ§in giriÅŸ yap.' : 'Log in to see your favorites.')
  const sortOptions = [
    { value: '', label: t.sortDefault },
    { value: 'priceAsc', label: t.sortPriceAsc },
    { value: 'priceDesc', label: t.sortPriceDesc },
    { value: 'nameAsc', label: t.sortNameAsc },
    { value: 'nameDesc', label: t.sortNameDesc },
  ]
  const resolvedFavoritesSubtitle =
    t.favoritesSubtitle ?? (language === 'tr' ? 'Be\u011fendi\u011fin \u00fcr\u00fcnleri kaydet, sonra tekrar kolayca g\u00f6z at.' : 'Save the products you like and come back to them anytime.')
  const resolvedFavoritesPanelTitle =
    t.favoritesPanelTitle ?? (language === 'tr' ? 'Favori \u00dcr\u00fcnler' : 'Favorite Products')
  const resolvedNoFavoritesYetText =
    t.noFavoritesYet ?? (language === 'tr' ? 'Hen\u00fcz favori \u00fcr\u00fcn\u00fcn yok.' : 'You do not have any favorite products yet.')
  const resolvedLoginToSeeFavoritesText =
    t.loginToSeeFavorites ?? (language === 'tr' ? 'Favorilerini g\u00f6rmek i\u00e7in giri\u015f yap.' : 'Log in to see your favorites.')
  const navCompareLabel = t.navCompare ?? (language === 'tr' ? 'Kar\u015f\u0131la\u015ft\u0131r' : 'Compare')
  const compareTitle = t.compareTitle ?? (language === 'tr' ? '\u00dcr\u00fcn Kar\u015f\u0131la\u015ft\u0131rma' : 'Product Comparison')
  const compareSubtitle =
    t.compareSubtitle ?? (language === 'tr' ? 'Se\u00e7ti\u011fin \u00fcr\u00fcnleri yan yana inceleyip daha kolay karar ver.' : 'Review your selected products side by side and decide faster.')
  const addToCompareLabel = t.addToCompare ?? (language === 'tr' ? 'Kar\u015f\u0131la\u015ft\u0131r' : 'Compare')
  const removeFromCompareLabel = t.removeFromCompare ?? (language === 'tr' ? 'Listeden \u00e7\u0131kar' : 'Remove from compare')
  const compareLimitMessage =
    t.compareLimitMessage ?? (language === 'tr' ? `En fazla ${MAX_COMPARE_ITEMS} \u00fcr\u00fcn kar\u015f\u0131la\u015ft\u0131rabilirsin.` : `You can compare up to ${MAX_COMPARE_ITEMS} products.`)
  const compareEmptyText =
    t.compareEmptyText ?? (language === 'tr' ? 'Kar\u015f\u0131la\u015ft\u0131rma listesinde hen\u00fcz \u00fcr\u00fcn yok.' : 'Your comparison list is empty.')
  const compareHintText =
    t.compareHintText ?? (language === 'tr' ? 'En iyi sonucu almak i\u00e7in en az 2 \u00fcr\u00fcn se\u00e7.' : 'Pick at least 2 products for the best comparison.')
  const clearCompareLabel = t.clearCompare ?? (language === 'tr' ? 'Kar\u015f\u0131la\u015ft\u0131rmay\u0131 temizle' : 'Clear comparison')
  const cheapestLabel = t.cheapestLabel ?? (language === 'tr' ? 'En uygun fiyat' : 'Best price')
  const cartItems = cart?.items ?? []
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cart?.totalAmount ?? 0
  const favoriteProductIds = new Set((favorites ?? []).map((product) => product.id))
  const compareProductIdSet = new Set(compareProductIds)
  const sortedCompareProducts = [...compareProducts].sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0))
  const cheapestCompareProduct = sortedCompareProducts[0] ?? null
  const location = useLocation()
  const navigate = useNavigate()
  const isProductDetailView = location.pathname.startsWith('/products/')
  const activeView = location.pathname.startsWith('/account')
    ? 'account'
    : location.pathname.startsWith('/favorites')
      ? 'favorites'
    : location.pathname.startsWith('/compare')
      ? 'compare'
    : location.pathname.startsWith('/my-space')
      ? 'shopping'
      : 'products'

  const buildProductsUrl = (pageNumber = pagination.pageNumber, activeFilters = filters) => {
    const params = new URLSearchParams()

    params.append('pageNumber', String(pageNumber))
    params.append('pageSize', String(PRODUCTS_PAGE_SIZE))

    if (activeFilters.search.trim()) params.append('search', activeFilters.search.trim())
    if (activeFilters.category) params.append('category', activeFilters.category)
    if (activeFilters.sortBy) params.append('sortBy', activeFilters.sortBy)
    if (activeFilters.minPrice) params.append('minPrice', activeFilters.minPrice)
    if (activeFilters.maxPrice) params.append('maxPrice', activeFilters.maxPrice)
    if (activeFilters.inStock) params.append('inStock', 'true')

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

  const fetchProducts = async (pageNumber = pagination.pageNumber, activeFilters = filters) => {
    try {
      setLoading(true)
      setError('')

      const queryString = buildProductsUrl(pageNumber, activeFilters)
      const data = await getProducts(queryString)
      const items = Array.isArray(data) ? data : (data?.items ?? [])
      setProducts(items)
      setPagination({
        pageNumber: data?.pageNumber ?? pageNumber,
        pageSize: data?.pageSize ?? PRODUCTS_PAGE_SIZE,
        totalCount: data?.totalCount ?? items.length,
        totalPages: data?.totalPages ?? (items.length ? pageNumber : 0),
        hasPreviousPage: data?.hasPreviousPage ?? pageNumber > 1,
        hasNextPage: data?.hasNextPage ?? false,
      })
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

  const fetchFavorites = async () => {
    if (!authState.token) return
    const data = await getFavorites(getAuthHeaders(false))
    setFavorites(data ?? [])
  }

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('compareProductIds', JSON.stringify(compareProductIds))
  }, [compareProductIds])

  useEffect(() => {
    if (!compareProductIds.length) {
      setCompareProducts([])
      return
    }

    let isMounted = true

    const loadCompareProducts = async () => {
      const comparedProducts = await Promise.all(
        compareProductIds.map(async (productId) => {
          try {
            return await getProductById(productId)
          } catch {
            return null
          }
        }),
      )

      if (isMounted) {
        setCompareProducts(comparedProducts.filter(Boolean))
      }
    }

    loadCompareProducts()

    return () => {
      isMounted = false
    }
  }, [compareProductIds])

  useEffect(() => {
    if (!authState.token) {
      setProfile(null)
      setCart(null)
      setOrders([])
      setFavorites([])
      return
    }

    const bootstrapUser = async () => {
      try {
        setError('')
        await fetchProfile(authState.token)
        await fetchCart()
        await fetchOrders()
        await fetchFavorites()
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
    setPagination((prev) => ({
      ...prev,
      pageNumber: 1,
    }))
    fetchProducts(1)
  }

  const handleFilterReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      sortBy: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
    }

    setFilters(resetFilters)
    setPagination((prev) => ({
      ...prev,
      pageNumber: 1,
    }))
    fetchProducts(1, resetFilters)
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
      imageUrl: '',
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
        setMessage(t.registrationSuccess)
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
      setMessage(t.loginSuccess)
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
    setFavorites([])
    setMessage(t.logoutSuccess)
  }

  const handleAddToCart = async (productId) => {
    if (!authState.token) {
      setError(t.loginBeforeCart)
      return
    }

    setError('')
    setMessage('')

    try {
      const data = await addToCart(getAuthHeaders(), {
        productId,
        quantity: 1,
      })
      setMessage(data?.message || t.productAddedToCart)
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }

  const isFavoriteProduct = (productId) => favoriteProductIds.has(productId)
  const isComparedProduct = (productId) => compareProductIdSet.has(productId)

  const handleToggleCompare = (product) => {
    const productId = typeof product === 'string' ? product : product?.id

    if (!productId) {
      return
    }

    setError('')
    setMessage('')

    setCompareProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      }

      if (prev.length >= MAX_COMPARE_ITEMS) {
        setMessage(compareLimitMessage)
        return prev
      }

      return [...prev, productId]
    })
  }

  const handleClearCompare = () => {
    setCompareProductIds([])
  }

  const handleToggleFavorite = async (productId) => {
    if (!authState.token) {
      setError(loginBeforeFavoriteMessage)
      return
    }

    setError('')
    setMessage('')
    setFavoriteActionProductId(productId)

    try {
      if (isFavoriteProduct(productId)) {
        await removeFavoriteRequest(productId, getAuthHeaders(false))
        setMessage(favoriteRemovedMessage)
      } else {
        await addFavoriteRequest(productId, getAuthHeaders(false))
        setMessage(favoriteAddedMessage)
      }

      await fetchFavorites()
    } catch (err) {
      setError(err.message)
    } finally {
      setFavoriteActionProductId('')
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
        imageUrl: productForm.imageUrl,
      }

      if (isEditing) {
        await updateProduct(editingProductId, getAuthHeaders(), payload)
      } else {
        await createProduct(getAuthHeaders(), payload)
      }

      setMessage(isEditing ? t.productUpdatedSuccess : t.productCreatedSuccess)
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
      imageUrl: product.imageUrl || '',
    })
    setMessage(t.editingProduct(product.name))
    setError('')
    navigate('/account')
  }

  const handleDeleteProduct = async (productId) => {
    setError('')
    setMessage('')

    try {
      await deleteProductRequest(productId, getAuthHeaders(false))
      setMessage(t.productDeletedSuccess)
      await fetchProducts()
      await fetchCart()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveFromCart = async (cartItemId) => {
    setError('')
    setMessage('')
    setCartItemActionId(cartItemId)

    try {
      await removeFromCart(cartItemId, getAuthHeaders(false))
      await fetchCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setCartItemActionId('')
    }
  }

  const handleUpdateCartItemQuantity = async (cartItemId, nextQuantity) => {
    if (nextQuantity < 1) {
      return
    }

    setError('')
    setMessage('')
    setCartItemActionId(cartItemId)

    try {
      await updateCartItemQuantityRequest(cartItemId, getAuthHeaders(), {
        quantity: nextQuantity,
      })
      await fetchCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setCartItemActionId('')
    }
  }

  const handleClearCart = async () => {
    setError('')
    setMessage('')
    setCartSummaryAction('clear')

    try {
      await clearCart(getAuthHeaders(false))
      await fetchCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setCartSummaryAction('')
    }
  }

  const handleCheckout = async () => {
    if (!authState.token) return

    setError('')
    setMessage('')
    setCartSummaryAction('checkout')

    try {
      const data = await checkoutOrder(getAuthHeaders(false))
      setMessage(t.orderCreatedSuccess(data.orderId))
      await fetchCart()
      await fetchOrders()
      await fetchProducts()
    } catch (err) {
      setError(err.message)
    } finally {
      setCartSummaryAction('')
    }
  }

  const handleRefreshCart = async () => {
    try {
      setError('')
      await fetchCart()
      setMessage(t.cartRefreshed)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRefreshOrders = async () => {
    try {
      setError('')
      await fetchOrders()
      setMessage(t.ordersRefreshed)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancelOrder = async (orderId) => {
    setError('')
    setMessage('')

    try {
      await cancelOrderRequest(orderId, getAuthHeaders(false))
      setMessage(t.orderCancelledSuccess)
      await fetchOrders()
      await fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || (pagination.totalPages > 0 && nextPage > pagination.totalPages)) {
      return
    }

    fetchProducts(nextPage)
  }

  return (
    <div className="page">
      <nav className="topbar">
        <div className="brand-block">
          <p className="brand-title">MiniECommerce</p>
          <p className="brand-subtitle">{t.appSubtitle}</p>
        </div>

        <div className="topbar-links">
          <button
            type="button"
            className={activeView === 'products' ? 'nav-link active' : 'nav-link'}
            onClick={() => navigate('/products')}
          >
            {t.navProducts}
          </button>
          <button
            type="button"
            className={activeView === 'shopping' ? 'nav-link active' : 'nav-link'}
            onClick={() => navigate('/my-space')}
          >
            <span className="nav-link-content">
              <span>{t.navShopping}</span>
              <span className="topbar-cart-icon" aria-hidden="true">
                <CartIcon />
                <span className="cart-badge">{cartItemCount}</span>
              </span>
            </span>
          </button>
          <button
            type="button"
            className={activeView === 'account' ? 'nav-link active' : 'nav-link'}
            onClick={() => navigate('/account')}
          >
            {t.navAccount}
          </button>
          <button
            type="button"
            className={activeView === 'compare' ? 'nav-link active' : 'nav-link'}
            onClick={() => navigate('/compare')}
          >
            <span className="nav-link-content">
              <span>{navCompareLabel}</span>
              <span className="topbar-compare-icon" aria-hidden="true">
                <CompareIcon />
                <span className="cart-badge">{compareProductIds.length}</span>
              </span>
            </span>
          </button>
          <button
            type="button"
            className={activeView === 'favorites' ? 'nav-link active' : 'nav-link'}
            onClick={() => navigate('/favorites')}
          >
            <span className="nav-link-content">
              <span>{navFavoritesLabel}</span>
              <span className="topbar-favorite-icon" aria-hidden="true">
                <HeartIcon filled={activeView === 'favorites'} />
                <span className="cart-badge">{favorites.length}</span>
              </span>
            </span>
          </button>
        </div>

        <div className="language-switch" role="group" aria-label="Language switcher">
          <button
            type="button"
            className={language === 'tr' ? 'language-button active' : 'language-button'}
            onClick={() => setLanguage('tr')}
          >
            {t.tr}
          </button>
          <button
            type="button"
            className={language === 'en' ? 'language-button active' : 'language-button'}
            onClick={() => setLanguage('en')}
          >
            {t.en}
          </button>
        </div>

        <div className="topbar-user">
          {isLoggedIn ? (
            <>
              <span>{profile?.email || authState.email}</span>
              <span className="role-badge">{profile?.role || authState.role}</span>
            </>
          ) : (
            <span>{t.guestMode}</span>
          )}
        </div>
      </nav>

      <header className="hero">
        <p className="eyebrow">MiniECommerce</p>
        {activeView === 'products' ? (
          <>
            <h1>{isProductDetailView ? t.detailTitle : t.productsTitle}</h1>
            <p className="subtitle">{isProductDetailView ? t.detailSubtitle : t.productsSubtitle}</p>
          </>
        ) : activeView === 'account' ? (
          <>
            <h1>{t.accountTitle}</h1>
            <p className="subtitle">{t.accountSubtitle}</p>
          </>
        ) : activeView === 'favorites' ? (
          <>
            <h1>{favoritesTitle}</h1>
            <p className="subtitle">{resolvedFavoritesSubtitle}</p>
          </>
        ) : activeView === 'compare' ? (
          <>
            <h1>{compareTitle}</h1>
            <p className="subtitle">{compareSubtitle}</p>
          </>
        ) : (
          <>
            <h1>{t.shoppingTitle}</h1>
            <p className="subtitle">{t.shoppingSubtitle}</p>
          </>
        )}
      </header>

      {!!compareProductIds.length && activeView !== 'compare' && (
        <section className="compare-strip panel">
          <div>
            <p className="eyebrow compare-strip-eyebrow">{navCompareLabel}</p>
            <p className="muted-text">
              {compareProductIds.length} / {MAX_COMPARE_ITEMS}
            </p>
          </div>
          <div className="compare-strip-actions">
            <button type="button" className="ghost-button" onClick={() => navigate('/compare')}>
              {navCompareLabel}
            </button>
            <button type="button" className="ghost-button" onClick={handleClearCompare}>
              {clearCompareLabel}
            </button>
          </div>
        </section>
      )}

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
                  placeholder={t.filterSearchPlaceholder}
                  value={filters.search}
                  onChange={handleFilterChange}
                />

                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">{t.allCategories}</option>
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
                        ? category || t.allCategories
                        : category?.name || t.allCategories}
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
                  placeholder={t.minPrice}
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />

                <input
                  name="maxPrice"
                  type="number"
                  placeholder={t.maxPrice}
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
                  {t.inStockOnly}
                </label>

                <div className="filter-actions">
                  <button type="submit">{t.apply}</button>
                  <button type="button" className="secondary" onClick={handleFilterReset}>
                    {t.reset}
                  </button>
                </div>
              </form>

              {loading && <p className="info">{t.loadingProducts}</p>}

              <section className="products-section" id="products">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t.catalog}</p>
                    <h2>{t.allProducts}</h2>
                  </div>
                  <p className="muted-text">
                    {t.productsHint}
                    {pagination.totalCount > 0 && ` ${t.totalProducts(pagination.totalCount)}`}
                  </p>
                </div>

                <div className="grid">
                  {products.map((product) => {
                    const productImageUrl = getProductImageUrl(product)
                    const isFavorite = isFavoriteProduct(product.id)
                    const isFavoriteLoading = favoriteActionProductId === product.id

                    return (
                      <article
                        key={product.id}
                        className="card clickable-card"
                        onClick={() => navigate(`/products/${product.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            navigate(`/products/${product.id}`)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {productImageUrl && (
                          <img
                            src={productImageUrl}
                            alt={product.name}
                            className="product-image"
                          />
                        )}
                        <div className="card-top-row">
                          <span className="category">{product.category}</span>
                          <button
                            type="button"
                            className={`favorite-toggle-button ${isFavorite ? 'active' : ''}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              handleToggleFavorite(product.id)
                            }}
                            disabled={isFavoriteLoading}
                            aria-label={isFavorite ? removeFromFavoritesLabel : addToFavoritesLabel}
                            title={isFavorite ? removeFromFavoritesLabel : addToFavoritesLabel}
                          >
                            <HeartIcon filled={isFavorite} />
                          </button>
                        </div>
                        <h2>{product.name}</h2>
                        <p className="description">{product.description}</p>
                        <p className="price">{formatCurrency(product.price)}</p>
                        <p className={`stock ${product.stock <= 0 ? 'stock-out' : ''}`}>
                          {product.stock <= 0 ? t.outOfStock : t.stockLabel(product.stock)}
                        </p>
                        <button
                          className={`primary-button ${product.stock <= 0 ? 'disabled-button' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            handleAddToCart(product.id)
                          }}
                          disabled={product.stock <= 0}
                        >
                          {product.stock <= 0 ? t.unavailable : t.addToCart}
                        </button>
                        <button
                          type="button"
                          className={`ghost-button full-width compare-inline-button ${isComparedProduct(product.id) ? 'active-compare-button' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            handleToggleCompare(product)
                          }}
                        >
                          {isComparedProduct(product.id) ? removeFromCompareLabel : addToCompareLabel}
                        </button>

                        {isAdmin && (
                          <div className="card-actions">
                            <button
                              className="ghost-button full-width"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleEditProduct(product)
                              }}
                            >
                              {t.editProduct}
                            </button>
                            <button
                              className="danger-button full-width"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteProduct(product.id)
                              }}
                            >
                              {t.deleteProduct}
                            </button>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>

                {!loading && !products.length && (
                  <p className="muted-text empty-products">{t.noProductsForPage}</p>
                )}

                <div className="pagination-bar">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={!pagination.hasPreviousPage}
                  >
                    {t.previous}
                  </button>

                  <p className="pagination-info">
                    {t.page} <strong>{pagination.pageNumber}</strong>
                    {pagination.totalPages > 0 && (
                      <>
                        {' '}
                        / <strong>{pagination.totalPages}</strong>
                      </>
                    )}
                  </p>

                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    {t.next}
                  </button>
                </div>
              </section>
            </>
          }
        />
        <Route
          path="/products/:productId"
          element={
            <>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}
              <ProductDetailsPage
                isLoggedIn={isLoggedIn}
                t={t}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                onToggleCompare={handleToggleCompare}
                isFavoriteProduct={isFavoriteProduct}
                isComparedProduct={isComparedProduct}
                favoriteActionProductId={favoriteActionProductId}
                addToFavoritesLabel={addToFavoritesLabel}
                removeFromFavoritesLabel={removeFromFavoritesLabel}
                addToCompareLabel={addToCompareLabel}
                removeFromCompareLabel={removeFromCompareLabel}
              />
            </>
          }
        />
        <Route
          path="/my-space"
          element={
            <>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}

              <section className="shopping-layout" id="overview">

            <div className="panel side-panel">
              <div className="panel-header">
                <h2 className="panel-title-with-icon">
                  <CartIcon />
                  <span>{t.myCart}</span>
                </h2>
                {isLoggedIn && (
                  <button className="ghost-button" onClick={handleRefreshCart}>
                    {t.refresh}
                  </button>
                )}
              </div>

              {isLoggedIn ? (
                <>
                  <div className="cart-overview">
                    <div className="cart-stat">
                      <span className="cart-stat-label">{t.cartProducts}</span>
                      <strong>{cartItems.length}</strong>
                    </div>
                    <div className="cart-stat">
                      <span className="cart-stat-label">{t.totalPieces}</span>
                      <strong>{cartItemCount}</strong>
                    </div>
                    <div className="cart-stat">
                      <span className="cart-stat-label">{t.subtotal}</span>
                      <strong>{formatCurrency(cartSubtotal)}</strong>
                    </div>
                  </div>

                  <div className="item-list cart-item-list">
                    {cartItems.length ? (
                      cartItems.map((item) => {
                        const isUpdatingItem = cartItemActionId === item.cartItemId

                        return (
                          <article key={item.cartItemId} className="mini-card cart-item-card">
                            <div className="cart-item-main">
                              <div className="cart-item-copy">
                                <span className="cart-item-tag">{t.inYourCart}</span>
                                <h3>{item.productName}</h3>
                                <p>{t.unitPrice}: {formatCurrency(item.unitPrice)}</p>
                              </div>
                              <p className="cart-line-total">{formatCurrency(item.totalPrice)}</p>
                            </div>

                            <div className="cart-item-actions">
                              <div className="quantity-stepper">
                                <button
                                  type="button"
                                  className="quantity-button"
                                  onClick={() =>
                                    handleUpdateCartItemQuantity(item.cartItemId, item.quantity - 1)
                                  }
                                  disabled={isUpdatingItem || item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="quantity-value">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="quantity-button"
                                  onClick={() =>
                                    handleUpdateCartItemQuantity(item.cartItemId, item.quantity + 1)
                                  }
                                  disabled={isUpdatingItem}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                className="danger-button"
                                onClick={() => handleRemoveFromCart(item.cartItemId)}
                                disabled={isUpdatingItem}
                              >
                                {t.remove}
                              </button>
                            </div>
                          </article>
                        )
                      })
                    ) : (
                      <div className="cart-empty-state">
                        <p className="muted-text">{t.yourCartEmpty}</p>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => navigate('/products')}
                        >
                          {t.continueShopping}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="cart-summary-card">
                    <div className="cart-summary-row">
                      <span>{t.itemsTotal}</span>
                      <strong>{formatCurrency(cartSubtotal)}</strong>
                    </div>
                    <div className="cart-summary-row">
                      <span>{t.shipping}</span>
                      <span>{t.shippingAtCheckout}</span>
                    </div>
                    <div className="cart-summary-row total-row">
                      <span>{t.orderTotal}</span>
                      <strong>{formatCurrency(cartSubtotal)}</strong>
                    </div>
                    <p className="cart-summary-note">{t.cartSummaryNote}</p>

                    <div className="stack-actions">
                      <button
                        className="primary-button"
                        onClick={handleCheckout}
                        disabled={!cartItems.length || cartSummaryAction === 'checkout'}
                      >
                        {cartSummaryAction === 'checkout' ? t.processing : checkoutLabel}
                      </button>
                      <button
                        className="ghost-button full-width"
                        onClick={handleClearCart}
                        disabled={!cartItems.length || cartSummaryAction === 'clear'}
                      >
                        {cartSummaryAction === 'clear' ? t.clearing : t.clearCart}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="muted-text">{t.loginToManageCart}</p>
              )}
            </div>

            <div className="panel side-panel">
              <div className="panel-header">
                <h2 className="panel-title-with-icon">
                  <OrderIcon />
                  <span>{t.myOrders}</span>
                </h2>
              </div>

              {isLoggedIn ? (
                <>
                  <p className="summary-line">
                    {t.totalOrders}: <strong>{orders.length}</strong>
                  </p>
                  {orders[0] && (
                    <p className="summary-line">
                      {t.lastOrderTotal}: <strong>{formatCurrency(orders[0].totalAmount)}</strong>
                    </p>
                  )}

                  <div className="item-list">
                    {orders.length ? (
                      orders.map((order) => (
                        <article key={order.orderId} className="mini-card order-card">
                          <div className="order-meta">
                            <div className="order-title-row">
                              <h3>{t.orderPrefix}{order.orderId.slice(0, 8)}</h3>
                              <span
                                className={`status-badge ${
                                  order.status === 'IptalEdildi' ? 'status-cancelled' : ''
                                }`}
                              >
                                {getOrderStatusLabel(order.status, t)}
                              </span>
                            </div>
                            <p>{t.date}: {formatDate(order.orderDate, language)}</p>
                            <p>{t.total}: {formatCurrency(order.totalAmount)}</p>
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
                                {t.cancelOrder}
                              </button>
                            )}
                          </article>
                        ))
                      ) : (
                        <p className="muted-text">{t.noOrdersYet}</p>
                      )}
                    </div>
                </>
              ) : (
                <p className="muted-text">{t.loginToSeeOrders}</p>
              )}
            </div>
              </section>
            </>
          }
        />
        <Route
          path="/favorites"
          element={
            <>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}

              <section className="account-layout" id="favorites-overview">
                <div className="panel">
                  <div className="panel-header">
                    <h2 className="panel-title-with-icon">
                      <HeartIcon filled />
                      <span>{resolvedFavoritesPanelTitle}</span>
                    </h2>
                    {isLoggedIn && <p className="muted-text">{favorites.length}</p>}
                  </div>

                  {isLoggedIn ? (
                    favorites.length ? (
                      <div className="grid favorites-grid">
                        {favorites.map((product) => {
                          const productImageUrl = getProductImageUrl(product)
                          const isFavoriteLoading = favoriteActionProductId === product.id

                          return (
                            <article
                              key={product.id}
                              className="card clickable-card"
                              onClick={() => navigate(`/products/${product.id}`)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault()
                                  navigate(`/products/${product.id}`)
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              {productImageUrl && (
                                <img
                                  src={productImageUrl}
                                  alt={product.name}
                                  className="product-image"
                                />
                              )}
                              <div className="card-top-row">
                                <span className="category">{product.category}</span>
                                <button
                                  type="button"
                                  className="favorite-toggle-button active"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleToggleFavorite(product.id)
                                  }}
                                  disabled={isFavoriteLoading}
                                  aria-label={removeFromFavoritesLabel}
                                  title={removeFromFavoritesLabel}
                                >
                                  <HeartIcon filled />
                                </button>
                              </div>
                              <h2>{product.name}</h2>
                              <p className="description">{product.description}</p>
                              <p className="price">{formatCurrency(product.price)}</p>
                              <p className={`stock ${product.stock <= 0 ? 'stock-out' : ''}`}>
                                {product.stock <= 0 ? t.outOfStock : t.stockLabel(product.stock)}
                              </p>
                              <button
                                className={`primary-button ${product.stock <= 0 ? 'disabled-button' : ''}`}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleAddToCart(product.id)
                                }}
                                disabled={product.stock <= 0}
                              >
                                {product.stock <= 0 ? t.unavailable : t.addToCart}
                              </button>
                            </article>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="cart-empty-state">
                        <p className="muted-text">{resolvedNoFavoritesYetText}</p>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => navigate('/products')}
                        >
                          {t.continueShopping}
                        </button>
                      </div>
                    )
                  ) : (
                    <p className="muted-text">{resolvedLoginToSeeFavoritesText}</p>
                  )}
                </div>
              </section>
            </>
          }
        />
        <Route
          path="/compare"
          element={
            <>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}

              <section className="compare-page">
                <div className="panel compare-summary-panel">
                  <div className="panel-header">
                    <h2 className="panel-title-with-icon">
                      <CompareIcon />
                      <span>{compareTitle}</span>
                    </h2>
                    {!!compareProductIds.length && (
                      <button type="button" className="ghost-button" onClick={handleClearCompare}>
                        {clearCompareLabel}
                      </button>
                    )}
                  </div>

                  {!compareProductIds.length ? (
                    <div className="cart-empty-state">
                      <p className="muted-text">{compareEmptyText}</p>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => navigate('/products')}
                      >
                        {t.continueShopping}
                      </button>
                    </div>
                  ) : (
                    <div className="compare-summary-copy">
                      <p className="muted-text">{compareHintText}</p>
                      {cheapestCompareProduct && (
                        <div className="compare-highlight">
                          <span className="compare-highlight-label">{cheapestLabel}</span>
                          <strong>{cheapestCompareProduct.name}</strong>
                          <span>{formatCurrency(cheapestCompareProduct.price)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!!sortedCompareProducts.length && (
                  <div className="compare-grid">
                    {sortedCompareProducts.map((product) => {
                      const productImageUrl = getProductImageUrl(product)
                      const isCheapestProduct = cheapestCompareProduct?.id === product.id

                      return (
                        <article key={product.id} className={`panel compare-card ${isCheapestProduct ? 'best-price-card' : ''}`}>
                          {productImageUrl && (
                            <img
                              src={productImageUrl}
                              alt={product.name}
                              className="product-image"
                            />
                          )}
                          <div className="card-top-row">
                            <span className="category">{product.category}</span>
                            <button
                              type="button"
                              className="ghost-button compare-remove-button"
                              onClick={() => handleToggleCompare(product)}
                            >
                              {removeFromCompareLabel}
                            </button>
                          </div>
                          {isCheapestProduct && (
                            <span className="best-price-badge">{cheapestLabel}</span>
                          )}
                          <h2>{product.name}</h2>
                          <p className="description">{product.description}</p>

                          <div className="compare-meta-list">
                            <div className="detail-meta-row">
                              <span>{t.price}</span>
                              <strong>{formatCurrency(product.price)}</strong>
                            </div>
                            <div className="detail-meta-row">
                              <span>{t.stock}</span>
                              <strong className={product.stock <= 0 ? 'detail-stock-out' : 'detail-stock-in'}>
                                {product.stock <= 0 ? t.outOfStock : t.stockLabel(product.stock)}
                              </strong>
                            </div>
                            <div className="detail-meta-row">
                              <span>{t.category}</span>
                              <strong>{product.category}</strong>
                            </div>
                          </div>

                          <div className="compare-card-actions">
                            <button
                              type="button"
                              className={`primary-button ${product.stock <= 0 ? 'disabled-button' : ''}`}
                              onClick={() => handleAddToCart(product.id)}
                              disabled={product.stock <= 0}
                            >
                              {product.stock <= 0 ? t.unavailable : t.addToCart}
                            </button>
                            <button
                              type="button"
                              className="ghost-button full-width"
                              onClick={() => navigate(`/products/${product.id}`)}
                            >
                              {t.detailTitle}
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            </>
          }
        />
        <Route
          path="/account"
          element={
            <>
              {message && <p className="success">{message}</p>}
              {error && <p className="error">{error}</p>}

              <section className="account-layout" id="account-overview">
                <div className="panel auth-panel">
                  <div className="panel-header">
                    <h2>{t.account}</h2>
                    {isLoggedIn ? (
                      <button className="ghost-button" onClick={handleLogout}>
                        {t.logout}
                      </button>
                    ) : (
                      <div className="mode-switch">
                        <button
                          className={authMode === 'login' ? 'active' : ''}
                          onClick={() => setAuthMode('login')}
                          type="button"
                        >
                          {t.login}
                        </button>
                        <button
                          className={authMode === 'register' ? 'active' : ''}
                          onClick={() => setAuthMode('register')}
                          type="button"
                        >
                          {t.register}
                        </button>
                      </div>
                    )}
                  </div>

                  {isLoggedIn ? (
                    <div className="profile-box">
                      <p>
                        <strong>{t.email}:</strong> {profile?.email || authState.email}
                      </p>
                      <p>
                        <strong>{t.role}:</strong> {profile?.role || authState.role}
                      </p>
                      <p>
                        <strong>{t.userId}:</strong> {profile?.userId || t.loadingText}
                      </p>
                    </div>
                  ) : (
                    <form className="auth-form" onSubmit={handleAuthSubmit}>
                      {authMode === 'register' && (
                        <input
                          name="fullName"
                          type="text"
                          placeholder={t.fullName}
                          value={authForm.fullName}
                          onChange={handleAuthFormChange}
                        />
                      )}

                      <input
                        name="email"
                        type="email"
                        placeholder={t.email}
                        value={authForm.email}
                        onChange={handleAuthFormChange}
                      />

                      <input
                        name="password"
                        type="password"
                        placeholder={t.password}
                        value={authForm.password}
                        onChange={handleAuthFormChange}
                      />

                      <button type="submit">
                        {authMode === 'register' ? t.createAccount : t.login}
                      </button>
                    </form>
                  )}
                </div>

                {isAdmin && (
                  <section className="panel admin-panel" id="admin-panel">
                    <div className="panel-header">
                      <h2>{editingProductId ? t.editProduct : t.adminProductPanel}</h2>
                      {editingProductId && (
                        <button className="ghost-button" type="button" onClick={resetProductForm}>
                          {t.cancelEdit}
                        </button>
                      )}
                    </div>

                    <form className="admin-form" onSubmit={handleCreateOrUpdateProduct}>
                      <input
                        name="name"
                        type="text"
                        placeholder={t.productName}
                        value={productForm.name}
                        onChange={handleProductFormChange}
                      />

                      <input
                        name="description"
                        type="text"
                        placeholder={t.description}
                        value={productForm.description}
                        onChange={handleProductFormChange}
                      />

                      <input
                        name="price"
                        type="number"
                        min="0"
                        placeholder={t.price}
                        value={productForm.price}
                        onChange={handleProductFormChange}
                      />

                      <input
                        name="stock"
                        type="number"
                        min="0"
                        placeholder={t.stock}
                        value={productForm.stock}
                        onChange={handleProductFormChange}
                      />

                      <input
                        name="imageUrl"
                        type="text"
                        placeholder="Image URL"
                        value={productForm.imageUrl}
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
                        {editingProductId ? t.updateProduct : t.createProduct}
                      </button>
                    </form>
                  </section>
                )}
              </section>
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
