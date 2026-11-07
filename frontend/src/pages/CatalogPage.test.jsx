import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, mockApiResponses } from '../test/renderWithProviders'
import CatalogPage from './CatalogPage'

const categories = [
  { id: 1, name: 'Gift Wrap', slug: 'gift-wrap' },
  { id: 2, name: 'Paper Bags', slug: 'paper-bags' },
]

const kraftBags = {
  id: 2,
  name: 'Kraft Bags',
  slug: 'kraft-bags',
  price_cents: 1599,
  stock_quantity: 10,
  category: { name: 'Paper Bags', slug: 'paper-bags' },
}

const goldWrapRoll = {
  id: 1,
  name: 'Gold Wrap Roll',
  slug: 'gold-wrap-roll',
  price_cents: 999,
  stock_quantity: 3,
  category: { name: 'Gift Wrap', slug: 'gift-wrap' },
}

function requestedPaths(fetchSpy) {
  return fetchSpy.mock.calls.map(([path]) => String(path))
}

describe('CatalogPage', () => {
  test('lists categories and products', async () => {
    mockApiResponses({ '/api/categories': categories, '/api/products': [goldWrapRoll, kraftBags] })

    renderWithProviders(<CatalogPage />)

    expect(await screen.findByRole('heading', { name: 'Gold Wrap Roll' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Kraft Bags' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Gift Wrap' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Paper Bags' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toHaveClass('active')
  })

  test('shows an empty message when no products match', async () => {
    mockApiResponses({ '/api/categories': categories, '/api/products': [] })

    renderWithProviders(<CatalogPage />)

    expect(await screen.findByText('No products found.')).toBeInTheDocument()
  })

  test('shows the error message and hides the empty message when loading fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ errors: ['Server exploded'] }), { status: 500 }),
    )

    renderWithProviders(<CatalogPage />)

    expect(await screen.findAllByText('Server exploded')).not.toHaveLength(0)
    expect(screen.queryByText('No products found.')).not.toBeInTheDocument()
  })

  test('starts filtered by the category in the URL', async () => {
    const fetchSpy = mockApiResponses({ '/api/categories': categories, '/api/products': [kraftBags] })

    renderWithProviders(<CatalogPage />, { initialPath: '/?category=paper-bags' })

    expect(await screen.findByRole('heading', { name: 'Kraft Bags' })).toBeInTheDocument()
    expect(requestedPaths(fetchSpy)).toContain('/api/products?category=paper-bags')
    expect(await screen.findByRole('button', { name: 'Paper Bags' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'All' })).not.toHaveClass('active')
  })

  test('refetches products when a category tab is selected and again when All is selected', async () => {
    const fetchSpy = mockApiResponses({ '/api/categories': categories, '/api/products': [goldWrapRoll, kraftBags] })
    const { user } = renderWithProviders(<CatalogPage />)

    await user.click(await screen.findByRole('button', { name: 'Gift Wrap' }))

    await waitFor(() => expect(requestedPaths(fetchSpy)).toContain('/api/products?category=gift-wrap'))
    expect(screen.getByRole('button', { name: 'Gift Wrap' })).toHaveClass('active')

    await user.click(screen.getByRole('button', { name: 'All' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'All' })).toHaveClass('active'))
    expect(requestedPaths(fetchSpy).filter((path) => path === '/api/products?')).toHaveLength(2)
  })

  test('searches products by the typed term', async () => {
    const fetchSpy = mockApiResponses({ '/api/categories': categories, '/api/products': [goldWrapRoll] })
    const { user } = renderWithProviders(<CatalogPage />)

    await user.type(screen.getByPlaceholderText('Search products…'), 'gold')

    await waitFor(() => expect(requestedPaths(fetchSpy)).toContain('/api/products?q=gold'))
    expect(screen.getByPlaceholderText('Search products…')).toHaveValue('gold')
  })

  test('combines the category and search filters', async () => {
    const fetchSpy = mockApiResponses({ '/api/categories': categories, '/api/products': [kraftBags] })

    renderWithProviders(<CatalogPage />, { initialPath: '/?category=paper-bags&q=kraft' })

    expect(await screen.findByRole('heading', { name: 'Kraft Bags' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search products…')).toHaveValue('kraft')
    expect(requestedPaths(fetchSpy)).toContain('/api/products?category=paper-bags&q=kraft')
  })
})
