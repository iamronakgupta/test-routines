async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...options.headers },
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.errors?.join(', ') || 'Something went wrong')
  return body
}

export const fetchCategories = () => requestJson('/api/categories')

export function fetchProducts({ categorySlug, searchTerm } = {}) {
  const query = new URLSearchParams()
  if (categorySlug) query.set('category', categorySlug)
  if (searchTerm) query.set('q', searchTerm)
  return requestJson(`/api/products?${query}`)
}

export const fetchProduct = (slug) => requestJson(`/api/products/${encodeURIComponent(slug)}`)

export const placeOrder = (order) => requestJson('/api/orders', { method: 'POST', body: JSON.stringify({ order }) })

export const formatPrice = (cents) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
