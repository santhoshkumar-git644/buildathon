import { Link } from 'react-router-dom';
import './SalonCard.css';

export default function SalonCard({ salon, isSaved, onToggleSave }) {
  const salonId = salon.id || salon._id || salon.salonId;
  const minPrice = salon.services?.length ? Math.min(...salon.services.map((s) => s.price)) : 0;
  
  // Choose sophisticated image based on name
  const getSalonImage = (name) => {
    const safeName = name || 'Salon';
    const hash = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const images = [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bfcbaa6362d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ];
    return `url(${images[hash % images.length]}) center/cover no-repeat`;
  };

  const hasValidImage = salon.images && salon.images.length > 0 && typeof salon.images[0] === 'string' && salon.images[0].startsWith('http');
  const salonNameLower = (salon.name || '').toLowerCase();
  
  return (
    <article className="salon-card-premium">
      <div 
        className="card-media" 
        style={{ 
          background: hasValidImage 
            ? `url(${salon.images[0]}) center/cover no-repeat` 
            : getSalonImage(salon.name) 
        }}
      >
        {!hasValidImage && (
          <span className="category-emoji">
            {(salon.tags || []).includes("Men's Salon") || salonNameLower.includes("men") ? "🧔" : 
             (salon.tags || []).includes("Bridal") || salonNameLower.includes("bridal") ? "👰" : 
             (salon.tags || []).includes("Beauty Parlour") ? "💄" : "💇"}
          </span>
        )}
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
