import { act, renderHook } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'

const CART_STORAGE_KEY = 'paper-parcel-cart'

const goldWrapRoll = { id: 1, name: 'Gold Wrap Roll', price_cents: 999, stock_quantity: 3 }
const kraftBags = { id: 2, name: 'Kraft Bags', price_cents: 1599, stock_quantity: 10 }

function renderCart() {
  return renderHook(() => useCart(), { wrapper: CartProvider })
}

describe('CartContext', () => {
  test('starts empty', () => {
    const { result } = renderCart()

    expect(result.current.cartLines).toEqual([])
    expect(result.current.itemCount).toBe(0)
    expect(result.current.subtotalCents).toBe(0)
  })

  test('adds a product with a default quantity of 1', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(kraftBags))

    expect(result.current.cartLines).toEqual([{ product: kraftBags, quantity: 1 }])
  })

  test('increases the quantity when the same product is added again', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(kraftBags, 2))
    act(() => result.current.addToCart(kraftBags, 3))

    expect(result.current.cartLines).toHaveLength(1)
    expect(result.current.cartLines[0].quantity).toBe(5)
  })

  test('caps quantities at available stock when adding', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(goldWrapRoll, 10))
    expect(result.current.cartLines[0].quantity).toBe(3)

    act(() => result.current.addToCart(goldWrapRoll, 1))
    expect(result.current.cartLines[0].quantity).toBe(3)
  })

  test('updates a line quantity, capped at stock', () => {
    const { result } = renderCart()
    act(() => result.current.addToCart(goldWrapRoll))

    act(() => result.current.updateQuantity(goldWrapRoll.id, 2))
    expect(result.current.cartLines[0].quantity).toBe(2)

    act(() => result.current.updateQuantity(goldWrapRoll.id, 50))
    expect(result.current.cartLines[0].quantity).toBe(3)
  })

  test('removes a line when the quantity is zero or negative', () => {
    const { result } = renderCart()
    act(() => {
      result.current.addToCart(goldWrapRoll)
      result.current.addToCart(kraftBags)
    })

    act(() => result.current.updateQuantity(goldWrapRoll.id, 0))
    expect(result.current.cartLines.map((line) => line.product.id)).toEqual([2])

    act(() => result.current.updateQuantity(kraftBags.id, -1))
    expect(result.current.cartLines).toEqual([])
  })

  test('computes item count and subtotal across lines', () => {
    const { result } = renderCart()

    act(() => {
      result.current.addToCart(goldWrapRoll, 2)
      result.current.addToCart(kraftBags, 1)
    })

    expect(result.current.itemCount).toBe(3)
    expect(result.current.subtotalCents).toBe(2 * 999 + 1599)
  })

  test('clears the cart', () => {
    const { result } = renderCart()
    act(() => result.current.addToCart(kraftBags))

    act(() => result.current.clearCart())

    expect(result.current.cartLines).toEqual([])
    expect(result.current.itemCount).toBe(0)
  })

  test('persists the cart to localStorage', () => {
    const { result } = renderCart()

    act(() => result.current.addToCart(kraftBags, 2))

    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY))).toEqual([{ product: kraftBags, quantity: 2 }])
  })

  test('restores the cart from localStorage', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ product: kraftBags, quantity: 4 }]))

    const { result } = renderCart()

    expect(result.current.cartLines).toEqual([{ product: kraftBags, quantity: 4 }])
    expect(result.current.itemCount).toBe(4)
  })

  test('falls back to an empty cart when stored data is corrupt', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{not json')

    const { result } = renderCart()

    expect(result.current.cartLines).toEqual([])
  })

  test('keeps working when localStorage writes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const { result } = renderCart()

    act(() => result.current.addToCart(kraftBags))

    expect(result.current.cartLines).toHaveLength(1)
  })
})
