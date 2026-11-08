import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders, mockApiResponses } from '../test/renderWithProviders'
import ProductPage from './ProductPage'

const goldWrapRoll = {
  id: 7,
  name: 'Gold Wrap Roll',
  slug: 'gold-wrap-roll',
  description: 'Shiny gold wrapping paper',
  price_cents: 999,
  stock_quantity: 3,
  image_url: 'https://example.com/gold.jpg',
  category: { name: 'Gift Wrap', slug: 'gift-wrap' },
}

function renderProductPage() {
  return renderWithProviders(<ProductPage />, { initialPath: '/products/gold-wrap-roll', routePath: '/products/:slug' })
}

describe('ProductPage', () => {
  test('shows a loading state, then the product details', async () => {
    mockApiResponses({ '/api/products/gold-wrap-roll': goldWrapRoll })
    renderProductPage()

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Gold Wrap Roll' })).toBeInTheDocument()
    expect(screen.getByText('$9.99')).toBeInTheDocument()
    expect(screen.getByText('Shiny gold wrapping paper')).toBeInTheDocument()
    expect(screen.getByText('3 in stock')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gift Wrap' })).toHaveAttribute('href', '/?category=gift-wrap')
  })

  test('shows the error message with a link back to the shop when loading fails', async () => {
    mockApiResponses({})
    renderProductPage()

    expect(await screen.findByText(/Not found/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to shop' })).toHaveAttribute('href', '/')
  })

  test('hides the add-to-cart controls when sold out', async () => {
    mockApiResponses({ '/api/products/gold-wrap-roll': { ...goldWrapRoll, stock_quantity: 0 } })
    renderProductPage()

    expect(await screen.findByText('Sold out')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add to cart' })).not.toBeInTheDocument()
  })

  test('adds the chosen quantity to the cart and offers a cart link', async () => {
    mockApiResponses({ '/api/products/gold-wrap-roll': goldWrapRoll })
    const { user } = renderProductPage()

    const quantityInput = await screen.findByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '2' } })
    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(screen.getByRole('link', { name: 'View cart' })).toHaveAttribute('href', '/cart')
    expect(JSON.parse(localStorage.getItem('paper-parcel-cart'))[0].quantity).toBe(2)
  })

  test('clamps the quantity between 1 and the available stock', async () => {
    mockApiResponses({ '/api/products/gold-wrap-roll': goldWrapRoll })
    renderProductPage()

    const quantityInput = await screen.findByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '9' } })
    expect(quantityInput).toHaveValue(3)

    fireEvent.change(quantityInput, { target: { value: '0' } })
    expect(quantityInput).toHaveValue(1)
  })

  test('requests the product by the slug in the route', async () => {
    const fetchSpy = mockApiResponses({ '/api/products/gold-wrap-roll': goldWrapRoll })
    renderProductPage()

    await screen.findByRole('heading', { name: 'Gold Wrap Roll' })
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/products/gold-wrap-roll')
  })
})
