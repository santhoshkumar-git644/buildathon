import { Link } from 'react-router-dom';
import './SalonCard.css';

export default function SalonCard({ salon, isSaved, onToggleSave }) {
  const salonId = salon.id || salon._id || salon.salonId;
  const minPrice = salon.services?.length ? Math.min(...salon.services.map((s) => s.price)) : 0;
  
  // Choose gradient based on rating or name for premium aesthetics
  const getGradient = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [15, 30, 45, 160, 180, 200, 320];
    const hue = hues[hash % hues.length];
    return `linear-gradient(135deg, hsl(${hue}, 80%, 75%) 0%, hsl(${(hue + 40) % 360}, 70%, 55%) 100%)`;
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
