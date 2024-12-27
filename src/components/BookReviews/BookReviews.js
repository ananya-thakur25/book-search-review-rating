import React, { useState, useEffect } from 'react';
import './BookReviews.css';

function BookReviews() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    isbn: '',
    review: '',
    rating: '',
    username: '',
  });
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  /* Fetching */

  const fetchReviews = async () => {
    try {
        const response = await fetch('http://localhost:3000/reviews'); 
        const data = await response.json();
        setReviews(data);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        setSubmitStatus('Error loading reviews. Please try again later.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newReview.isbn || !newReview.review || !newReview.rating || !newReview.username) {
        setSubmitStatus('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/submit-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newReview),
        });
        
        if (response.ok) {
            setNewReview({ isbn: '', review: '', rating: '', username: '' });
            setSubmitStatus('Review submitted successfully!');
            fetchReviews();
        } else {
            setSubmitStatus('Error submitting review. Please try again.');
        }
    } catch (error) {
        setSubmitStatus('Error submitting review. Please try again.');
    }
  };

  const handleChange = (e) => {
    setNewReview({
      ...newReview,
      [e.target.name]: e.target.value,
    });
  };

  /* End of fetching */

  return (
    <div className="reviews-container">
      {/* Review Form Section */}
      <div className="review-form-container">
        <h2>Share Your Thoughts</h2>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label>ISBN:</label>
            <input
              type="text"
              name="isbn"
              value={newReview.isbn}
              onChange={handleChange}
              placeholder="Enter book ISBN"
            />
          </div>

          <div className="form-group">
            <label>Your Review:</label>
            <textarea
              name="review"
              value={newReview.review}
              onChange={handleChange}
              placeholder="Share your thoughts about the book..."
            />
          </div>

          <div className="form-group">
            <label>Rating:</label>
            <select name="rating" value={newReview.rating} onChange={handleChange}>
              <option value="">Select rating</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Star{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={newReview.username}
              onChange={handleChange}
              placeholder="Your username"
            />
          </div>

          <button type="submit" className="submit-button">
            Submit Review
          </button>
        </form>
        {submitStatus && <p className="status-message">{submitStatus}</p>}
      </div>

      {/* Reviews List Section */}
      <div className="reviews-list">
        <h3>Community Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to share your thoughts!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="username">{review.username}</span>
                <span className="rating">{"⭐".repeat(review.rating)}</span>
              </div>
              <p className="isbn">ISBN: {review.isbn}</p>
              <p className="review-text">{review.review}</p>
              <p className="review-date">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookReviews;