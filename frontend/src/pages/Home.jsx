import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error('Error fetching products:', err)
        setProducts([])
      })
  }, [])

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '200px' }}>
              <h4>{product.name}</h4>
              <p>₹{product.price}</p>
              <Link to={`/product/${product.id}`}>View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
