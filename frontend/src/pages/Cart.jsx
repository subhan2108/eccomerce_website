import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

export default function Cart() {
  const { cartItems, removeFromCart } = useCart()

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <>
          <ul>
            {cartItems.map(item => (
              <li key={item.id}>
                <strong>{item.name}</strong> - ₹{item.price} x {item.quantity}
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ marginLeft: '1rem' }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <p><strong>Total: ₹{total}</strong></p>

          <Link to="/checkout">
            <button style={{ marginTop: '1rem' }}>
              Proceed to Checkout
            </button>
          </Link>
        </>
      )}
    </div>
  )
}
