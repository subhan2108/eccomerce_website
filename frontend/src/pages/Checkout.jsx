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
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  })

  const [loading, setLoading] = useState(false)

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

  const validateForm = () => {
    const phoneRegex = /^[0-9]{10}$/
    const zipRegex = /^[0-9]{6}$/
    if (!phoneRegex.test(form.phone)) {
      alert('📞 Phone number must be exactly 10 digits.')
      return false
    }
    if (form.country.toLowerCase() !== 'india') {
      alert('🌏 Country must be "India" only.')
      return false
    }
    if (!zipRegex.test(form.zip)) {
      alert('📮 ZIP code must be exactly 6 digits.')
      return false
    }
    return true
  }

  const handlePayment = async () => {
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

    const orderRes = await axios.post(
      'http://127.0.0.1:8000/api/create-razorpay-order/',
      { amount: total * 100 },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const orderData = orderRes.data

    const options = {
      key: 'rzp_test_sT2i7yt5Zlgyii',
      amount: orderData.amount,
      currency: 'INR',
      name: 'Pathan Gadgets',
      description: 'Order Payment',
      order_id: orderData.id,
      handler: async function (response) {
        try {
          const shipping = {
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country
          }

          const items = cartItems.map(item => ({
            product: item.id,
            quantity: item.quantity,
            price: item.price
          }))

          await axios.post('http://127.0.0.1:8000/api/create-order/', {
            shipping,
            items,
            payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          alert('✅ Payment successful & order placed!')
          clearCart()
          navigate('/order-success')
        } catch (error) {
          console.error('❌ Order creation failed:', error)
          alert('❌ Order creation failed after payment.')
        }
      },
      prefill: {
        name: form.name,
        contact: form.phone
      },
      method: {
        upi: true,
        card: true,
        netbanking: true
      },
      theme: {
        color: '#121212'
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await handlePayment()
    } catch (err) {
      console.error('Payment Error:', err)
      alert('❌ Payment Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Checkout</h2>

      <form onSubmit={handleSubmit}>
        <h3>Shipping Information</h3>

        <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name (e.g. Subhan Khan)" />
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Phone (10 digits)" />
        <input name="address" value={form.address} onChange={handleChange} required placeholder="Address (Street, Area)" />
        <input name="city" value={form.city} onChange={handleChange} required placeholder="City (e.g. Mumbai)" />
        <input name="state" value={form.state} onChange={handleChange} required placeholder="State (e.g. Maharashtra)" />
        <input name="zip" value={form.zip} onChange={handleChange} required placeholder="ZIP Code (6 digits)" />
        <input name="country" value={form.country} onChange={handleChange} required placeholder="Country (Only India allowed)" />

        <h3>Order Summary</h3>
        <ul>
          {cartItems.map(item => (
            <li key={item.id}>
              {item.name} x {item.quantity} — ₹{item.price * item.quantity}
            </li>
          ))}
        </ul>
        <p><strong>Total: ₹{total}</strong></p>

        <button type="submit" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Processing...' : 'Pay & Place Order'}
        </button>
      </form>
    </div>
  )
}
