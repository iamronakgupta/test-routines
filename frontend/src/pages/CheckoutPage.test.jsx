import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../test/renderWithProviders'
import CheckoutPage from './CheckoutPage'

const goldWrapRoll = { id: 7, name: 'Gold Wrap Roll', price_cents: 999, stock_quantity: 5 }

function seedCart(lines) {
  localStorage.setItem('paper-parcel-cart', JSON.stringify(lines))
}

function renderCheckout() {
  return renderWithProviders(
    <Routes>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders/:id" element={<p>Order confirmed</p>} />
    </Routes>,
    { initialPath: '/checkout' },
  )
}

async function fillCustomerDetails(user) {
  await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace')
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.type(screen.getByLabelText('Shipping address'), '1 Paper Street')
}

describe('CheckoutPage', () => {
  test('shows an empty-cart message with a link back to the shop', () => {
    renderCheckout()

    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start shopping' })).toHaveAttribute('href', '/')
  })

  test('shows the form with the cart total', () => {
    seedCart([{ product: goldWrapRoll, quantity: 2 }])
    renderCheckout()

    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
    expect(screen.getByText('$19.98')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled()
  })

  test('submits customer details and cart items, then clears the cart and navigates to the order', async () => {
    seedCart([{ product: goldWrapRoll, quantity: 2 }])
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 42, total_cents: 1998 }), { status: 201 }),
    )
    const { user } = renderCheckout()

    await fillCustomerDetails(user)
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(await screen.findByText('Order confirmed')).toBeInTheDocument()
    const [path, options] = fetchSpy.mock.calls[0]
    expect(path).toBe('/api/orders')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({
      order: {
        customer_name: 'Ada Lovelace',
        customer_email: 'ada@example.com',
        shipping_address: '1 Paper Street',
        items: [{ product_id: 7, quantity: 2 }],
      },
    })
    await waitFor(() => expect(JSON.parse(localStorage.getItem('paper-parcel-cart'))).toEqual([]))
  })

  test('shows the server error and keeps the cart when the order is rejected', async () => {
    seedCart([{ product: goldWrapRoll, quantity: 2 }])
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ errors: ['Only 1 of Gold Wrap Roll left in stock'] }), { status: 422 }),
    )
    const { user } = renderCheckout()

    await fillCustomerDetails(user)
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(await screen.findByText('Only 1 of Gold Wrap Roll left in stock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Place order' })).toBeEnabled()
    expect(JSON.parse(localStorage.getItem('paper-parcel-cart'))).toHaveLength(1)
  })

  test('disables the button while the order is being placed', async () => {
    seedCart([{ product: goldWrapRoll, quantity: 1 }])
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}))
    const { user } = renderCheckout()

    await fillCustomerDetails(user)
    await user.click(screen.getByRole('button', { name: 'Place order' }))

    expect(await screen.findByRole('button', { name: /Placing order/ })).toBeDisabled()
  })
})
