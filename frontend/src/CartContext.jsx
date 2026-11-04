import { createContext, useContext, useEffect, useState } from 'react'

const CART_STORAGE_KEY = 'paper-parcel-cart'
const CartContext = createContext(null)

function loadStoredCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cartLines, setCartLines] = useState(loadStoredCart)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartLines))
    } catch {
      // Storage unavailable (private mode); cart still works for this session.
    }
  }, [cartLines])

  function addToCart(product, quantity = 1) {
    setCartLines((lines) => {
      const existingLine = lines.find((line) => line.product.id === product.id)
      if (!existingLine) return [...lines, { product, quantity: Math.min(quantity, product.stock_quantity) }]
      return lines.map((line) =>
        line === existingLine
          ? { ...line, quantity: Math.min(line.quantity + quantity, product.stock_quantity) }
          : line,
      )
    })
  }

  function updateQuantity(productId, quantity) {
    setCartLines((lines) =>
      quantity <= 0
        ? lines.filter((line) => line.product.id !== productId)
        : lines.map((line) =>
            line.product.id === productId
              ? { ...line, quantity: Math.min(quantity, line.product.stock_quantity) }
              : line,
          ),
    )
  }

  const clearCart = () => setCartLines([])
  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotalCents = cartLines.reduce((sum, line) => sum + line.quantity * line.product.price_cents, 0)

  return (
    <CartContext.Provider value={{ cartLines, addToCart, updateQuantity, clearCart, itemCount, subtotalCents }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
