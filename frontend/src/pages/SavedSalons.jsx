import { useState, useEffect } from 'react';
import { getSalons } from '../services/api.js';
import SalonCard from '../components/SalonCard.jsx';
import { Link } from 'react-router-dom';

export default function SavedSalons({ savedIds, onToggleSave, city }) {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const { data } = await getSalons();
        setSalons(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSalons();
  }, []);

  const savedSalonsList = salons.filter(s => savedIds.includes(s.id || s._id));

  if (loading) return <div className="loading-container">Loading saved salons...</div>;

  return (
    <main className="saved-salons-page">
      <div className="page-header">
        <h2>Your Saved Salons</h2>
        <p>Manage and quickly book your favorite beauty spots.</p>
      </div>

      {savedSalonsList.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">❤️</span>
          <h3>No saved salons yet</h3>
          <p>Browse salons on the home page and click the heart icon to save them here.</p>
          <Link to="/" className="btn-primary">Browse Salons</Link>
        </div>
      ) : (
        <div className="featured-grid">
          {savedSalonsList.map(salon => (
            <SalonCard 
              key={salon.id || salon._id} 
              salon={salon} 
              isSaved={true} 
              onToggleSave={() => onToggleSave(salon.id || salon._id)} 
            />
          ))}
        </div>
      )}
    </main>
  );
}
