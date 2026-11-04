import { Link } from 'react-router-dom'
import { formatPrice } from '../api'
import { useCart } from '../CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const isInStock = product.stock_quantity > 0

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`}>
        <img src={product.image_url} alt={product.name} loading="lazy" />
        <h3>{product.name}</h3>
      </Link>
      <p className="muted">{product.category.name}</p>
      <div className="product-card-footer">
        <strong>{formatPrice(product.price_cents)}</strong>
        <button onClick={() => addToCart(product)} disabled={!isInStock}>
          {isInStock ? 'Add to cart' : 'Sold out'}
        </button>
      </div>
    </article>
  )
}
