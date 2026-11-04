import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProduct, formatPrice } from '../api'
import { useCart } from '../CartContext'

export default function ProductPage() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [errorMessage, setErrorMessage] = useState('')
  const [wasAdded, setWasAdded] = useState(false)

  useEffect(() => {
    fetchProduct(slug).then(setProduct).catch((error) => setErrorMessage(error.message))
  }, [slug])

  if (errorMessage) return <p className="error">{errorMessage} <Link to="/">Back to shop</Link></p>
  if (!product) return <p className="muted">Loading…</p>

  const isInStock = product.stock_quantity > 0

  function handleAddToCart() {
    addToCart(product, quantity)
    setWasAdded(true)
  }

  return (
    <div className="product-detail">
      <img src={product.image_url} alt={product.name} />
      <div>
        <Link to={`/?category=${product.category.slug}`} className="muted">{product.category.name}</Link>
        <h1>{product.name}</h1>
        <p className="price">{formatPrice(product.price_cents)}</p>
        <p>{product.description}</p>
        <p className="muted">{isInStock ? `${product.stock_quantity} in stock` : 'Sold out'}</p>
        {isInStock && (
          <div className="add-row">
            <input
              type="number"
              min="1"
              max={product.stock_quantity}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Math.min(product.stock_quantity, Number(event.target.value))))}
            />
            <button onClick={handleAddToCart}>Add to cart</button>
          </div>
        )}
        {wasAdded && <p>Added. <Link to="/cart">View cart</Link></p>}
      </div>
    </div>
  )
}
