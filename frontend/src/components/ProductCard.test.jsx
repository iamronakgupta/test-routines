import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import App from '../App'
import ProductCard from './ProductCard'

const kraftBags = {
  id: 1,
  name: 'Kraft Bags',
  slug: 'kraft-bags',
  price_cents: 1599,
  stock_quantity: 10,
  image_url: 'https://example.com/kraft-bags.jpg',
  category: { name: 'Paper Bags', slug: 'paper-bags' },
}

describe('ProductCard', () => {
  test('shows the product name, category and formatted price', () => {
    renderWithProviders(<ProductCard product={kraftBags} />)

    expect(screen.getByRole('heading', { name: 'Kraft Bags' })).toBeInTheDocument()
    expect(screen.getByText('Paper Bags')).toBeInTheDocument()
    expect(screen.getByText('$15.99')).toBeInTheDocument()
  })

  test('adds the product to the cart when clicked', async () => {
    const { user } = renderWithProviders(
      <>
        <App />
        <ProductCard product={kraftBags} />
      </>,
      { initialPath: '/cart' },
    )

    await user.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(screen.getByRole('link', { name: 'Cart (1)' })).toBeInTheDocument()
  })

  test('disables the button when the product is sold out', () => {
    renderWithProviders(<ProductCard product={{ ...kraftBags, stock_quantity: 0 }} />)

    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled()
  })
})
