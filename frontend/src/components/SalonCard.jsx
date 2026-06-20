import { Link } from 'react-router-dom';
import './SalonCard.css';

export default function SalonCard({ salon, isSaved, onToggleSave }) {
  const salonId = salon.id || salon._id || salon.salonId;
  const minPrice = salon.services?.length ? Math.min(...salon.services.map((s) => s.price)) : 0;
  
  // Choose sophisticated dark gradient based on name
  const getGradient = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'linear-gradient(135deg, #161a20 0%, #0d0f12 100%)',
      'linear-gradient(135deg, #1c1c1e 0%, #000000 100%)',
      'linear-gradient(135deg, #1a1e24 0%, #101216 100%)'
    ];
    const baseGradient = gradients[hash % gradients.length];
    return `radial-gradient(circle at 50% 50%, rgba(232, 176, 89, 0.08) 0%, transparent 60%), ${baseGradient}`;
  };

  return (
    <article className="salon-card-premium">
      <div className="card-media" style={{ background: getGradient(salon.name) }}>
        <span className="category-emoji">
          {salon.tags?.includes("Men's Salon") || salon.name.toLowerCase().includes("men") ? "🧔" : 
           salon.tags?.includes("Bridal") || salon.name.toLowerCase().includes("bridal") ? "👰" : 
           salon.tags?.includes("Beauty Parlour") ? "💄" : "💇"}
        </span>
        <button 
          className={`save-heart-btn ${isSaved ? 'saved' : ''}`} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSave(salonId);
          }}
          aria-label={isSaved ? "Unsave Salon" : "Save Salon"}
        >
          {isSaved ? '❤️' : '🤍'}
        </button>
        <div className="media-overlay">
          <span className="distance-badge">📍 {salon.distance?.toFixed(1) || '2.5'} km</span>
        </div>
      </div>
      
      <div className="card-info">
        <h3 className="salon-name">{salon.name}</h3>
        
        <div className="rating-row">
          <span className="stars-icon">⭐</span>
          <strong className="rating-value">{(salon.rating || 0).toFixed(1)}</strong>
          <span className="reviews-count">({salon.reviewCount || 0} reviews)</span>
        </div>
        
        <p className="salon-address">{salon.address || `${salon.area || 'Locality'}, ${salon.city}`}</p>
        
        <div className="price-tag-row">
          <span className="price-label">Starts from</span>
          <strong className="price-value">Rs {minPrice}</strong>
        </div>

        <div className="tags-container">
          {salon.tags && salon.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
        
        <div className="card-actions-row">
          <Link to={`/salon/${salonId}`} className="details-btn">View Details</Link>
          <Link to={`/booking/${salonId}`} className="book-btn-compact">Book Now</Link>
        </div>
      </div>
    </article>
  );
}
