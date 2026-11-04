import { Link } from 'react-router-dom'
import { formatPrice } from '../api'
import { useCart } from '../CartContext'

export default function CartPage() {
  const { cartLines, updateQuantity, subtotalCents } = useCart()

  if (cartLines.length === 0) return <p>Your cart is empty. <Link to="/">Start shopping</Link></p>

  return (
    <>
      <h1>Your cart</h1>
      <table className="cart-table">
        <tbody>
          {cartLines.map(({ product, quantity }) => (
            <tr key={product.id}>
              <td><Link to={`/products/${product.slug}`}>{product.name}</Link></td>
              <td>{formatPrice(product.price_cents)}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                />
              </td>
              <td>{formatPrice(product.price_cents * quantity)}</td>
              <td><button className="link-button" onClick={() => updateQuantity(product.id, 0)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cart-summary">
        <p>Subtotal: <strong>{formatPrice(subtotalCents)}</strong></p>
        <Link to="/checkout" className="button">Checkout</Link>
      </div>
    </>
  )
}
