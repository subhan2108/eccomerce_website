import { useCart } from '../context/CartContext'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../App.css'
export default function Checkout() {
  const { cartItems, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
    zip: ''
  })

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (!token) {
      alert('Please log in first.')
      navigate('/login')
    }
  }, [navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const shipping = `${form.name}, ${form.phone}, ${form.city}, ${form.state}, ${form.zip}`

    const items = cartItems.map(item => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price
    }))

    let token = localStorage.getItem('access')
    const refresh = localStorage.getItem('refresh')

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', { refresh })
      token = res.data.access
      localStorage.setItem('access', token)
    } catch (err) {
      alert('Session expired. Please log in again.')
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      navigate('/login')
      return
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/create-order/', {
        shipping,
        items
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      alert('✅ Order placed successfully!')
      clearCart()
      navigate('/order-success')
    } catch (err) {
      console.error('❌ Order failed:', err.response?.data || err.message)
      alert('❌ Failed to place order. Check console for details.')
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Checkout</h2>

      <form onSubmit={handleSubmit}>
        <h3>Shipping Information</h3>

        <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" />
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Phone" />
        <input name="city" value={form.city} onChange={handleChange} required placeholder="City" />
        <input name="state" value={form.state} onChange={handleChange} required placeholder="State" />
        <input name="zip" value={form.zip} onChange={handleChange} required placeholder="ZIP Code" />

        <h3>Order Summary</h3>
        <ul>
          {cartItems.map(item => (
            <li key={item.id}>
              {item.name} x {item.quantity} — ₹{item.price * item.quantity}
            </li>
          ))}
        </ul>
        <p><strong>Total: ₹{total}</strong></p>

        <button type="submit" style={{ marginTop: '1rem' }}>
          Place Order
        </button>
      </form>
    </div>
  )
}
