import { Link, Route, Routes } from 'react-router-dom'
import { useCart } from './CartContext'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'

export default function App() {
  const { itemCount } = useCart()

  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">Paper &amp; Parcel</Link>
        <Link to="/cart" className="cart-link">Cart ({itemCount})</Link>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:orderId" element={<OrderConfirmationPage />} />
          <Route path="*" element={<p>Page not found. <Link to="/">Back to shop</Link></p>} />
        </Routes>
      </main>
    </>
  )
}
