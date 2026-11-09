import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import CartPage from './CartPage'

const CART_STORAGE_KEY = 'paper-parcel-cart'

const goldWrapRoll = { id: 1, name: 'Gold Wrap Roll', slug: 'gold-wrap-roll', price_cents: 999, stock_quantity: 3 }
const kraftBags = { id: 2, name: 'Kraft Bags', slug: 'kraft-bags', price_cents: 1599, stock_quantity: 10 }

function seedCart(cartLines) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartLines))
}

describe('CartPage', () => {
  test('shows an empty-cart message with a link back to the shop', () => {
    renderWithProviders(<CartPage />)

    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start shopping' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  test('lists each line with unit price, line total and a product link', () => {
    seedCart([{ product: goldWrapRoll, quantity: 2 }, { product: kraftBags, quantity: 1 }])
    renderWithProviders(<CartPage />)

    const goldWrapRow = screen.getByRole('link', { name: 'Gold Wrap Roll' }).closest('tr')
    expect(screen.getByRole('link', { name: 'Gold Wrap Roll' })).toHaveAttribute('href', '/products/gold-wrap-roll')
    expect(within(goldWrapRow).getByText('$9.99')).toBeInTheDocument()
    expect(within(goldWrapRow).getByText('$19.98')).toBeInTheDocument()
    expect(within(goldWrapRow).getByRole('spinbutton')).toHaveValue(2)

    const kraftRow = screen.getByRole('link', { name: 'Kraft Bags' }).closest('tr')
    expect(within(kraftRow).getAllByText('$15.99')).toHaveLength(2)
  })

  test('shows the subtotal and a checkout link', () => {
    seedCart([{ product: goldWrapRoll, quantity: 2 }, { product: kraftBags, quantity: 1 }])
    renderWithProviders(<CartPage />)

    expect(screen.getByText('$35.97')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Checkout' })).toHaveAttribute('href', '/checkout')
  })

  test('limits the quantity input to the available stock', () => {
    seedCart([{ product: goldWrapRoll, quantity: 1 }])
    renderWithProviders(<CartPage />)

    expect(screen.getByRole('spinbutton')).toHaveAttribute('max', '3')
  })

  test('updates the line total and subtotal when the quantity changes', () => {
    seedCart([{ product: goldWrapRoll, quantity: 1 }])
    renderWithProviders(<CartPage />)

    const quantityInput = screen.getByRole('spinbutton')
    fireEvent.change(quantityInput, { target: { value: '3' } })

    expect(quantityInput).toHaveValue(3)
    expect(screen.getAllByText('$29.97')).toHaveLength(2)
  })

  test('removes the line when Remove is clicked and shows the empty state', async () => {
    seedCart([{ product: goldWrapRoll, quantity: 1 }])
    const { user } = renderWithProviders(<CartPage />)

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument()
  })

  test('removes only the clicked line when several are in the cart', async () => {
    seedCart([{ product: goldWrapRoll, quantity: 1 }, { product: kraftBags, quantity: 1 }])
    const { user } = renderWithProviders(<CartPage />)

    const goldWrapRow = screen.getByRole('link', { name: 'Gold Wrap Roll' }).closest('tr')
    await user.click(within(goldWrapRow).getByRole('button', { name: 'Remove' }))

    expect(screen.queryByRole('link', { name: 'Gold Wrap Roll' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Kraft Bags' })).toBeInTheDocument()
  })

  test('removes the line when the quantity is set to zero', async () => {
    seedCart([{ product: goldWrapRoll, quantity: 2 }])
    const { user } = renderWithProviders(<CartPage />)

    await user.clear(screen.getByRole('spinbutton'))

    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument()
  })
})
