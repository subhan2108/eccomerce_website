import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id)
      return exists
        ? prev.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
          )
        : [...prev, { ...product, quantity: qty }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => setCartItems([])

   // ✅ Add this:
  const updateQuantity = (id, qty) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    )
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
