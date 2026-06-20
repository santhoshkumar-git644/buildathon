import { useState, useEffect } from 'react';
import { getPersonalizedFeed } from '../services/api.js';
import SalonCard from '../components/SalonCard.jsx';

export default function Home({ city, savedIds, onToggleSave, user }) {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        let allSalons = [];
        if (user) {
           const { data } = await getPersonalizedFeed(user.id);
           allSalons = data.feed || [];
        } else {
           // fallback to all salons if not logged in
           const { data } = await import('../services/api.js').then(m => m.getSalons());
           allSalons = data || [];
        }
        
        // Filter by selected city
        const citySalons = allSalons.filter(s => s.city.toLowerCase() === city.toLowerCase());
        setSalons(citySalons);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchFeed();
  }, [city, user]);

  return (
    <main style={{ padding: 0, maxWidth: '100%' }}>
      {/* 1. Valoura Style Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: '85vh', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 8%', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1521590832167-7bfcbaa6362d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--line)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,15,18,1) 0%, rgba(13,15,18,0.8) 40%, rgba(0,0,0,0.1) 100%)' }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '650px' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
            Book the Best Salons in {city} <br/><span style={{ color: 'var(--brand)' }}>Instantly</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#b0b6c2', marginBottom: '40px', lineHeight: 1.6, maxWidth: '500px' }}>
            Discover top-rated salons, book premium services, and experience the ultimate grooming journey tailored just for you.
          </p>
          <button 
            onClick={() => {
              const el = document.getElementById('booking-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="animate-pulse-glow"
            style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: '30px', background: '#fff', color: '#000', outline: 'none', border: 'none' }}
          >
            Book Now
          </button>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="animate-slide-up stagger-1" style={{ padding: '60px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '350px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', lineHeight: 1.2 }}>More Than a Salon,<br/>An Experience</h2>
          <p style={{ color: 'var(--muted)' }}>We bring you the most premium beauty destinations in your city. Redefining your routine.</p>
        </div>
        <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
          <div><h3 style={{ fontSize: '2rem', color: 'var(--brand)', marginBottom: '5px' }}>200+</h3><p style={{ color: 'var(--muted)', fontWeight: 500 }}>Top Rated Salons</p></div>
          <div><h3 style={{ fontSize: '2rem', color: 'var(--brand)', marginBottom: '5px' }}>16</h3><p style={{ color: 'var(--muted)', fontWeight: 500 }}>Cities Covered</p></div>
          <div><h3 style={{ fontSize: '2rem', color: 'var(--brand)', marginBottom: '5px' }}>15k+</h3><p style={{ color: 'var(--muted)', fontWeight: 500 }}>Happy Customers</p></div>
        </div>
      </section>

      {/* 3. Value Proposition / Because You Deserve the Best */}
      <section className="animate-slide-up stagger-2" style={{ padding: '100px 8%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '60px' }}>Because You Deserve the Best</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '40px', 
          border: '1px solid var(--line)', 
          padding: '60px 40px', 
          borderRadius: '24px', 
          background: 'rgba(255,255,255,0.02)',
          boxShadow: 'var(--shadow)'
        }}>
          <div>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '1.8rem' }}>★</div>
            <h3 style={{ fontSize: '1.4rem' }}>Expert Stylists</h3>
            <p style={{ color: 'var(--muted)', marginTop: '12px', lineHeight: 1.6 }}>Only the finest professionals curated from across the country.</p>
          </div>
          <div style={{ borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)', padding: '0 20px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '1.8rem' }}>🧴</div>
            <h3 style={{ fontSize: '1.4rem' }}>Best Products</h3>
            <p style={{ color: 'var(--muted)', marginTop: '12px', lineHeight: 1.6 }}>Premium quality products guaranteed for your skin and hair.</p>
          </div>
          <div>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '1.8rem' }}>✨</div>
            <h3 style={{ fontSize: '1.4rem' }}>Best Service</h3>
            <p style={{ color: 'var(--muted)', marginTop: '12px', lineHeight: 1.6 }}>Unmatched customer care and luxury ambiance every time.</p>
          </div>
        </div>
      </section>

      {/* 4. Luxury Made Affordable (Dynamic DB Feed) */}
      <section id="booking-section" className="animate-slide-up stagger-3" style={{ padding: '60px 8% 120px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', textAlign: 'center' }}>Luxury Made Affordable in {city}</h2>
        <p style={{ textAlign: 'center', color: 'var(--brand)', marginBottom: '60px', fontSize: '1.2rem', fontWeight: 500 }}>
          {user ? '✨ Curated specifically for your style profile.' : 'Sign in to get personalized AI recommendations!'}
        </p>
        
        {loading ? <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '1.2rem' }}>Loading premium salons...</p> : (
          <div className="featured-grid">
            {salons.length > 0 ? salons.map(salon => (
              <SalonCard 
                key={salon._id || salon.id} 
                salon={salon} 
                isSaved={savedIds.includes(salon._id || salon.id)} 
                onToggleSave={() => onToggleSave(salon._id || salon.id)} 
              />
            )) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '60px', border: '1px dashed var(--line)', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No premium salons found in {city} right now.</h3>
                <p style={{ color: 'var(--muted)' }}>Try selecting another city from the top navigation.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
