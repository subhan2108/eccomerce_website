import { useEffect, useState } from 'react'
import axios from 'axios'

export default function MyOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('access')
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/user-orders/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setOrders(res.data)
      } catch (err) {
        console.error('Failed to fetch orders:', err.response?.data || err.message)
        alert('⚠️ Please log in again.')
      }
    }

    fetchOrders()
  }, [])

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              <strong>Order #{order.id}</strong> — {order.status} — ₹{order.total_price}
              <br />
              📦 Shipping: {order.shipping_address}
              <br />
              📅 Date: {new Date(order.created_at).toLocaleString()}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
