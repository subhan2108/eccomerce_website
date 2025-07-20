// pages/Profile.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Profile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access')

    axios.get('http://127.0.0.1:8000/api/profile/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      setProfile(res.data)
    }).catch(err => {
      console.error('Failed to load profile', err)
    })
  }, [])

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>User Profile</h2>
      {profile ? (
        <>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}
