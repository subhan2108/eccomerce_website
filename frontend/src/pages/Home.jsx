import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import '../App.css'  // Ensure this includes the dark theme styles
import { useLocation } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['All', 'Men', 'Women', 'Luxury', 'Smart']

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(res => {
        setProducts(res.data)
        setFilteredProducts(res.data)
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setProducts([])
      })
  }, [])

  useEffect(() => {
    let filtered = [...products]

    if (activeCategory !== 'All') {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase() === activeCategory.toLowerCase()
      )
    }

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [products, activeCategory, searchTerm])

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
  }


  return (
    <> 
      {/* 🎯 Banner */}
      <div  style={{ overflow: 'hidden', position: 'relative', height: '500px', marginBottom: '2rem' }}>
        <img
          src="http://127.0.0.1:8000/media/products/watch.jpg"
          alt="Luxury Watches"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          transform: 'translateY(-50%)',
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '2rem',
          borderRadius: '8px',
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Timeless Elegance</h1>
          <p>Discover our curated collection of premium timepieces.</p>
          <Link to="/products" className="buy-btn" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Shop Now
          </Link>
        </div>
      </div>

      {/* 🧭 Category Filter */}
      <div className="category-filter">
  {categories.map(cat => (
    <button
      key={cat}
      className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
      onClick={() => handleCategoryChange(cat)}
    >
      {cat}
    </button>
  ))}
</div>


       {/* 🔍 Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="🔍 Search watches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>


      {/* 🛒 Products Section */}
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>🛍️ Featured Watches</h2>

        {filteredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>No products found.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
              >
                <img
                  src={`http://127.0.0.1:8000${product.image}`}
                  alt={product.name}
                />
                <h4 style={{ margin: '0.8rem 0' }}>{product.name}</h4>
                <p style={{ fontSize: '1.1rem', color: '#e0c67a' }}>₹{product.price}</p>
                <Link to={`/product/${product.id}`} className="buy-btn">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
