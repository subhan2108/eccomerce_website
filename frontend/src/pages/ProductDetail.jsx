import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    axios.post(`http://127.0.0.1:8000/api/products/${id}/`)
      .then(res => {
        setProduct(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])


  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1)
      alert(`${product.name} added to cart`)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!product) return <p>Product not found.</p>

  return (
    <div>
      <h2>{product.name}</h2>
      <p>₹{product.price}</p>
      <p>{product.description}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  )
}
