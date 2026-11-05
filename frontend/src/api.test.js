import { fetchCategories, fetchProduct, fetchProducts, formatPrice, placeOrder } from './api'

function stubFetch(body, { status = 200 } = {}) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify(body), { status }))
}

describe('formatPrice', () => {
  test('formats cents as US dollars', () => {
    expect(formatPrice(1599)).toBe('$15.99')
    expect(formatPrice(0)).toBe('$0.00')
    expect(formatPrice(100000)).toBe('$1,000.00')
  })
})

describe('fetch helpers', () => {
  test('fetchCategories returns the parsed body and sends JSON headers', async () => {
    const fetchSpy = stubFetch([{ id: 1, name: 'Gift Wrap' }])

    await expect(fetchCategories()).resolves.toEqual([{ id: 1, name: 'Gift Wrap' }])
    const [path, options] = fetchSpy.mock.calls[0]
    expect(path).toBe('/api/categories')
    expect(options.headers).toMatchObject({ 'Content-Type': 'application/json', Accept: 'application/json' })
  })

  test('fetchProducts builds the query string from the given filters', async () => {
    const fetchSpy = stubFetch([])

    await fetchProducts({ categorySlug: 'paper-bags', searchTerm: 'kraft bag' })
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/products?category=paper-bags&q=kraft+bag')
  })

  test('fetchProducts omits empty filters and works without arguments', async () => {
    const fetchSpy = stubFetch([])

    await fetchProducts()
    await fetchProducts({ categorySlug: '', searchTerm: '' })
    expect(fetchSpy.mock.calls.map(([path]) => path)).toEqual(['/api/products?', '/api/products?'])
  })

  test('fetchProduct URL-encodes the slug', async () => {
    const fetchSpy = stubFetch({ slug: 'a/b' })

    await fetchProduct('a/b c')
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/products/a%2Fb%20c')
  })

  test('placeOrder POSTs the order wrapped in an order key', async () => {
    const fetchSpy = stubFetch({ id: 5, total_cents: 1998 })
    const order = { customer_name: 'Ada', items: [{ product_id: 1, quantity: 2 }] }

    await expect(placeOrder(order)).resolves.toEqual({ id: 5, total_cents: 1998 })
    const [path, options] = fetchSpy.mock.calls[0]
    expect(path).toBe('/api/orders')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ order })
  })
})

describe('error handling', () => {
  test('throws the server errors joined together on a failed response', async () => {
    stubFetch({ errors: ['Only 3 of Gold Wrap Roll left in stock', 'Email is invalid'] }, { status: 422 })

    await expect(placeOrder({})).rejects.toThrow('Only 3 of Gold Wrap Roll left in stock, Email is invalid')
  })

  test('falls back to a generic message when no errors are returned', async () => {
    stubFetch({}, { status: 500 })

    await expect(fetchCategories()).rejects.toThrow('Something went wrong')
  })
})
