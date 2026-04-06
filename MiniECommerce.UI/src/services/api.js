const API_BASE_URL = 'https://localhost:44317'

const readResponseData = async (response) => {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const getErrorMessage = (data, fallbackMessage) => {
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data?.message) {
    return data.message
  }

  return fallbackMessage
}

const request = async (path, options = {}, fallbackMessage = 'Request failed.') => {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const data = await readResponseData(response)

  if (!response.ok) {
    throw new Error(getErrorMessage(data, fallbackMessage))
  }

  return data
}

export const getProducts = async (queryString) =>
  request(`/api/products?${queryString}`, {}, 'Products could not be loaded.')

export const getCategories = async () =>
  request('/api/products/categories', {}, 'Categories could not be loaded.')

export const loginUser = async (payload) =>
  request(
    '/api/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    'Authentication failed.',
  )

export const registerUser = async (payload) =>
  request(
    '/api/auth/register',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    'Authentication failed.',
  )

export const getProfile = async (token) =>
  request(
    '/api/auth/me',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    'User profile could not be loaded.',
  )

export const getCart = async (headers) =>
  request(
    '/api/cart',
    {
      headers,
    },
    'Cart could not be loaded.',
  )

export const getOrders = async (headers) =>
  request(
    '/api/order',
    {
      headers,
    },
    'Orders could not be loaded.',
  )

export const addToCart = async (headers, payload) =>
  request(
    '/api/cart/items',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    },
    'Product could not be added to cart.',
  )

export const createProduct = async (headers, payload) =>
  request(
    '/api/products',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    },
    'Product could not be created.',
  )

export const updateProduct = async (productId, headers, payload) =>
  request(
    `/api/products/${productId}`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    },
    'Product could not be updated.',
  )

export const deleteProduct = async (productId, headers) =>
  request(
    `/api/products/${productId}`,
    {
      method: 'DELETE',
      headers,
    },
    'Product could not be deleted.',
  )

export const removeFromCart = async (cartItemId, headers) =>
  request(
    `/api/cart/items/${cartItemId}`,
    {
      method: 'DELETE',
      headers,
    },
    'Product could not be removed from cart.',
  )

export const clearCart = async (headers) =>
  request(
    '/api/cart/clear',
    {
      method: 'DELETE',
      headers,
    },
    'Cart could not be cleared.',
  )

export const checkoutOrder = async (headers) =>
  request(
    '/api/order/checkout',
    {
      method: 'POST',
      headers,
    },
    'Checkout failed.',
  )

export const cancelOrderRequest = async (orderId, headers) =>
  request(
    `/api/order/${orderId}/cancel`,
    {
      method: 'PUT',
      headers,
    },
    'Order could not be cancelled.',
  )
