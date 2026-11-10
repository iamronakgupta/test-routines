import { screen } from '@testing-library/react'
import { renderWithProviders } from './test/renderWithProviders'
import App from './App'

const kraftBags = {
  id: 1,
  name: 'Kraft Bags',
  slug: 'kraft-bags',
  price_cents: 1599,
  stock_quantity: 10,
  image_url: null,
  category: { name: 'Paper Bags', slug: 'paper-bags' },
}

function mockFetchWithProducts() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    new Response(JSON.stringify([kraftBags]), { status: 200 }),
  )
}

describe('App', () => {
  test('shows the brand link and an empty cart count in the header', () => {
    mockFetchWithProducts()
    renderWithProviders(<App />)

    expect(screen.getByRole('link', { name: /Paper & Parcel/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Cart (0)' })).toHaveAttribute('href', '/cart')
  })

  test('reflects the stored cart quantity in the header cart link', () => {
    mockFetchWithProducts()
    localStorage.setItem('paper-parcel-cart', JSON.stringify([{ product: kraftBags, quantity: 3 }]))

    renderWithProviders(<App />)

    expect(screen.getByRole('link', { name: 'Cart (3)' })).toBeInTheDocument()
  })

  test('renders the catalog at the root path', async () => {
    mockFetchWithProducts()
    renderWithProviders(<App />, { initialPath: '/' })

    expect(await screen.findByRole('heading', { name: 'Kraft Bags' })).toBeInTheDocument()
  })

  test('renders the cart page at /cart', () => {
    mockFetchWithProducts()
    renderWithProviders(<App />, { initialPath: '/cart' })

    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument()
  })

  test('shows a not-found message with a link back to the shop for unknown paths', () => {
    mockFetchWithProducts()
    renderWithProviders(<App />, { initialPath: '/no/such/page' })

    expect(screen.getByText(/Page not found/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to shop' })).toHaveAttribute('href', '/')
  })

  test('navigates to the cart when the header cart link is clicked', async () => {
    mockFetchWithProducts()
    const { user } = renderWithProviders(<App />)

    await user.click(screen.getByRole('link', { name: 'Cart (0)' }))

    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument()
  })
})
