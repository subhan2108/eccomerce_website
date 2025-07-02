import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar() {
  const { cartItems } = useCart()

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to="/">🛒 MyStore</Link>
      </div>
      <div className="navbar__links">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart ({cartItems.length})</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  )
}
