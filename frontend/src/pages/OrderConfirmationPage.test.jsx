import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import OrderConfirmationPage from './OrderConfirmationPage'

function renderConfirmation({ orderId = '42', state } = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: `/orders/${orderId}`, state }]}>
      <Routes>
        <Route path="/orders/:orderId" element={<OrderConfirmationPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrderConfirmationPage', () => {
  test('thanks the customer and shows the order number from the URL', () => {
    renderConfirmation({ orderId: '42' })

    expect(screen.getByRole('heading', { name: 'Thank you!' })).toBeInTheDocument()
    expect(screen.getByText(/Order #42 has been placed/)).toBeInTheDocument()
  })

  test('includes the formatted total when it is passed through router state', () => {
    renderConfirmation({ state: { totalCents: 3597 } })

    expect(screen.getByText('Order #42 has been placed for $35.97.')).toBeInTheDocument()
  })

  test('shows a zero total rather than hiding it', () => {
    renderConfirmation({ state: { totalCents: 0 } })

    expect(screen.getByText('Order #42 has been placed for $0.00.')).toBeInTheDocument()
  })

  test('omits the total when no router state is available', () => {
    renderConfirmation()

    expect(screen.getByText('Order #42 has been placed.')).toBeInTheDocument()
  })

  test('links back to the shop', () => {
    renderConfirmation()

    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/')
  })
})
