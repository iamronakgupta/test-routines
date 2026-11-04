import { Link, useLocation, useParams } from 'react-router-dom'
import { formatPrice } from '../api'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const totalCents = useLocation().state?.totalCents

  return (
    <div className="confirmation">
      <h1>Thank you!</h1>
      <p>Order #{orderId} has been placed{totalCents != null && ` for ${formatPrice(totalCents)}`}.</p>
      <Link to="/" className="button">Continue shopping</Link>
    </div>
  )
}
