import { Link } from 'react-router-dom';

export default function SalonCard({ salon }) {
  const minPrice = salon.services?.length ? Math.min(...salon.services.map((s) => s.price)) : 0;

  return (
    <article className="salon-card">
      <div className="thumb">{salon.images && salon.images[0]}</div>
      <div>
        <h3>{salon.name}</h3>
        <p>{(salon.rating || 0).toFixed(1)} ({salon.reviewCount || 0}) • {salon.distance || 2.5} km • {salon.area || 'City'}</p>
        <p>Starts from Rs {minPrice}</p>
        <div className="chips-row compact">
          {salon.tags && salon.tags.map((tag) => <span key={tag} className="chip soft">{tag}</span>)}
        </div>
        <div className="card-actions">
          <Link to={`/salon/${salon.id}`}><button type="button">View Details</button></Link>
          <Link to={`/booking/${salon.id}`}><button className="ghost" type="button">Book Now</button></Link>
        </div>
      </div>
    </article>
  );
}
