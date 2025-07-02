import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
  e.preventDefault()

  try {
    const res = await axios.post('http://127.0.0.1:8000/api/token/', {
      username,
      password
    })

    // ✅ Save tokens to localStorage
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)

    alert('Logged in successfully!')
  } catch (err) {
    alert('Login failed')
    console.error(err)
  }
}

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: '300px', margin: '2rem auto' }}>
      <h2>Login</h2>
      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  )
}
