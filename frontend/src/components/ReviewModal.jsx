import { useState } from 'react';
import { createReview } from '../services/api.js';
import './ReviewModal.css';

export default function ReviewModal({ booking, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please add a comment about your experience.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Create review in backend
      await createReview({
        salonId: booking.salonId,
        author: booking.userName || 'Anonymous Client',
        rating,
        comment
      });
      
      onReviewSubmitted(booking._id || booking.id);
      alert('Thank you for your review! Your feedback helps the community.');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal-card">
        <div className="review-modal-header">
          <h3>Write a Review 💇✨</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="review-modal-body">
          <p className="subtitle">
            How was your haircut/styling experience at <strong>{booking.salonName}</strong>?
          </p>

          {error && <div className="error-banner">{error}</div>}

          <div className="rating-select-container">
            <label>Rating:</label>
            <div className="star-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="comment">Your Review Comments:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked (or what could be improved)..."
              required
            />
          </div>

          <div className="input-group">
            <label>Add a Photo (Optional):</label>
            <div className="mock-photo-upload">
              <input type="file" disabled />
              <span>📷 Simulated photo attachments supported</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel ghost" onClick={onClose} disabled={loading}>
              Close
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
