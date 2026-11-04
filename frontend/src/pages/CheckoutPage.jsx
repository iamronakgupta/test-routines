import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice, placeOrder } from '../api'
import { useCart } from '../CartContext'

export default function CheckoutPage() {
  const { cartLines, subtotalCents, clearCart } = useCart()
  const navigate = useNavigate()
  const [customerDetails, setCustomerDetails] = useState({ customer_name: '', customer_email: '', shipping_address: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (cartLines.length === 0) return <p>Your cart is empty. <Link to="/">Start shopping</Link></p>

  const updateField = (event) => setCustomerDetails({ ...customerDetails, [event.target.name]: event.target.value })

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const order = await placeOrder({
        ...customerDetails,
        items: cartLines.map((line) => ({ product_id: line.product.id, quantity: line.quantity })),
      })
      clearCart()
      navigate(`/orders/${order.id}`, { state: { totalCents: order.total_cents } })
    } catch (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h1>Checkout</h1>
      <label>Full name<input name="customer_name" required value={customerDetails.customer_name} onChange={updateField} /></label>
      <label>Email<input name="customer_email" type="email" required value={customerDetails.customer_email} onChange={updateField} /></label>
      <label>Shipping address<textarea name="shipping_address" rows="3" required value={customerDetails.shipping_address} onChange={updateField} /></label>
      <p>Total: <strong>{formatPrice(subtotalCents)}</strong></p>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Placing order…' : 'Place order'}</button>
    </form>
  )
}
