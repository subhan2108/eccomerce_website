import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#eee' }}>
      <Link to="/">🏠 E-Shop</Link>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        {/* Show Logout/Profile if user is logged in (later via context/state) */}
      </div>
    </nav>
  )
}
