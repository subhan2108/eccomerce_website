import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import '../App.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const { addToCart } = useCart();

  const token = localStorage.getItem('access');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Fetch product details
  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  // Fetch all products for recommendations
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(res => setAllProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch reviews
  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/reviews/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setReviews(res.data))
      .catch(err => console.error(err));
  }, [id, token]);

  // Submit or update review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please log in to submit a review.");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    try {
      if (editingReviewId) {
        const res = await axios.put(
          `http://127.0.0.1:8000/api/reviews/${editingReviewId}/`,
          { rating, comment },
          config
        );
        setReviews(reviews.map(r => (r.id === editingReviewId ? res.data : r)));
        setEditingReviewId(null);
      } else {
        const res = await axios.post(
          `http://127.0.0.1:8000/api/products/${id}/reviews/`,
          { rating, comment },
          config
        );
        setReviews([...reviews, res.data]);
      }

      setComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
      alert("Error submitting review.");
    }
  };

  // Start editing a review
  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
  };

  // Delete a review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/reviews/${reviewId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
    }
  };

  const recommended = allProducts.filter(p => p.id !== parseInt(id)).slice(0, 4);

  if (!product) return <p>Loading product...</p>;

  return (
    <>
      <div className="product-detail-container">
        <div className="product-image">
          <img src={`http://127.0.0.1:8000${product.image}`} alt={product.name} />
        </div>
        <div className="product-info">
          <h2>{product.name}</h2>
          <p className="price">₹{product.price.toLocaleString()}</p>
          <div className="rating">{'⭐️'.repeat(4)}<span className="faded">⭐️</span></div>
          <p>{product.description}</p>
          <button className="buy-btn" onClick={() => addToCart(product)}>🛒 Add to Cart</button>
        </div>
      </div>

      <div className="review-section">
        <div className="review-box">
          <h3>Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <ul className="review-list">
              {reviews.map(rev => (
                <li key={rev.id} className="review">
                  <strong>{rev.user}</strong> — {'⭐️'.repeat(rev.rating)}
                  <p>{rev.comment}</p>
                  {currentUser?.username === rev.user && (
                    <div className="review-actions">
                      <button onClick={() => startEditing(rev)}>✏️ Edit</button>
                      <button onClick={() => handleDeleteReview(rev.id)}>🗑 Delete</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form className="review-form" onSubmit={handleSubmitReview}>
          <h4>{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h4>
          <label>Rating:</label>
          <select value={rating} onChange={e => setRating(parseInt(e.target.value))}>
            {[5, 4, 3, 2, 1].map(star => (
              <option key={star} value={star}>{star} ⭐</option>
            ))}
          </select>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Leave a comment..."
            required
          />
          <button type="submit" className="buy-btn">
            {editingReviewId ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      </div>

      <div className="recommended-section">
        <h3 className="section-title">Recommended Watches</h3>
        <div className="product-grid">
          {recommended.map((item) => (
            <div className="product-card" key={item.id}>
              <img src={`http://127.0.0.1:8000${item.image}`} alt={item.name} />
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
              <Link to={`/product/${item.id}`} className="view-btn">View</Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
