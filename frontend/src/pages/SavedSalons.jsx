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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--brand)' }}>Loading saved salons...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel animate-slide-up" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(22, 26, 32, 0.8), rgba(13, 15, 18, 0.9))' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '6px', background: 'linear-gradient(to right, #fff, var(--brand))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your Saved Salons
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Manage and quickly book your favorite beauty spots.
        </p>
      </div>

      {savedSalonsList.length === 0 ? (
        <div className="glass-panel animate-slide-up stagger-1" style={{ padding: '40px 20px', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px', filter: 'drop-shadow(0 0 10px rgba(232, 176, 89, 0.3))' }}>❤️</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', color: 'var(--ink)' }}>No saved salons yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '400px', lineHeight: '1.5' }}>
            You haven't saved any salons yet. Browse salons on the home page and click the heart icon to save them here for quick access later.
          </p>
          <Link to="/" style={{ display: 'inline-block', background: 'var(--brand)', color: '#000', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(232, 176, 89, 0.3)' }}>
            Browse Salons
          </Link>
        </div>
      ) : (
        <div className="featured-grid animate-slide-up stagger-1">
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
    </div>
  );
}
