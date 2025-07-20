import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import '../App.css';


export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart()

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your Cart 🛒</h2>
        <p>Your cart is empty.</p>
        <Link to="/" className="back-btn">← Back to Products</Link>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <h2>Your Cart 🛒</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
                  className="qty-input"
                />
              </td>
              <td>₹{item.price}</td>
              <td>₹{item.price * item.quantity}</td>
              <td>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cart-summary">
        <h3>Total: ₹{total}</h3>
        <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
      </div>
    </div>
  )
}
