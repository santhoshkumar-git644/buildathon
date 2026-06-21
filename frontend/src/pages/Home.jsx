import { useState, useEffect } from 'react';
import { getPersonalizedFeed, getSalons } from '../services/api.js';
import SalonCard from '../components/SalonCard.jsx';

export default function Home({ city, savedIds, onToggleSave, user }) {
  const [salons, setSalons] = useState([]);
  const [globalSalons, setGlobalSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        let allSalons = [];
        let fetchedGlobalSalons = [];
        
        // Always fetch all salons for the global search
        const globalRes = await getSalons();
        fetchedGlobalSalons = globalRes.data || [];
        setGlobalSalons(fetchedGlobalSalons);

        if (user) {
           const { data } = await getPersonalizedFeed(user.id, city);
           allSalons = data.feed || [];
        } else {
           // fallback to all salons if not logged in
           allSalons = fetchedGlobalSalons;
        }
        
        // Filter by selected city for the personalized feed
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
        height: searchQuery ? '35vh' : '85vh', 
        display: 'flex', 
        alignItems: searchQuery ? 'flex-end' : 'center', 
        padding: searchQuery ? '0 8% 40px' : '0 8%', 
        transition: 'all 0.4s ease-in-out',
        backgroundImage: 'url("https://images.unsplash.com/photo-1521590832167-7bfcbaa6362d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--line)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,15,18,1) 0%, rgba(13,15,18,0.8) 40%, rgba(0,0,0,0.1) 100%)' }}></div>
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: searchQuery ? '800px' : '650px', margin: searchQuery ? '0 auto' : '0', transition: 'all 0.4s ease' }}>
          
          {!searchQuery && (
            <div className="animate-slide-up">
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
                Book the Best Salons in {city} <br/><span style={{ color: 'var(--brand)' }}>Instantly</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#b0b6c2', marginBottom: '40px', lineHeight: 1.6, maxWidth: '500px' }}>
                Discover top-rated salons, book premium services, and experience the ultimate grooming journey tailored just for you.
              </p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: searchQuery ? '0' : '40px', transition: 'all 0.3s ease' }}>
            <input 
              type="text" 
              placeholder="Search complete database (e.g., Haircut, New York...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                flex: 1,
                minWidth: '250px',
                padding: '16px 24px', 
                borderRadius: '30px', 
                border: 'none', 
                background: 'rgba(255,255,255,0.9)', 
                color: '#000', 
                fontSize: '1.1rem',
                outline: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        </div>
      </section>

      {/* 2 & 3. Promotional Sections (Hidden when searching) */}
      {!searchQuery && (
        <div className="animate-fade-in">
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
        </div>
      )}

      {/* 4. Luxury Made Affordable (Dynamic DB Feed) or Search Results */}
      <section id="booking-section" className="animate-slide-up stagger-3" style={{ padding: searchQuery ? '40px 8% 120px' : '60px 8% 120px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', textAlign: 'center' }}>
          {searchQuery ? 'Search Results' : `Luxury Made Affordable in ${city}`}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--brand)', marginBottom: '40px', fontSize: '1.2rem', fontWeight: 500 }}>
          {searchQuery ? `Searching complete database for "${searchQuery}"` : (user ? '✨ Curated specifically for your style profile.' : 'Sign in to get personalized AI recommendations!')}
        </p>

        {loading ? <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '1.2rem' }}>Loading premium salons...</p> : (() => {
          // If searching, use globalSalons. If not searching, use city-specific filtered salons.
          const baseSalons = searchQuery ? globalSalons : salons;
          
          const displayedSalons = baseSalons.filter(salon => {
            if (!searchQuery) return true; // If no search query, return all in baseSalons
            const query = searchQuery.toLowerCase();
            const inName = salon.name.toLowerCase().includes(query);
            const inCity = salon.city.toLowerCase().includes(query);
            const inArea = salon.area.toLowerCase().includes(query);
            const inTags = salon.tags?.some(tag => tag.toLowerCase().includes(query));
            const inServices = salon.services?.some(service => service.name.toLowerCase().includes(query));
            return inName || inCity || inArea || inTags || inServices;
          });

          return (
            <div className="featured-grid">
              {displayedSalons.length > 0 ? displayedSalons.map(salon => (
                <SalonCard 
                  key={salon._id || salon.id} 
                  salon={salon} 
                  isSaved={savedIds.includes(salon._id || salon.id)} 
                  onToggleSave={() => onToggleSave(salon._id || salon.id)} 
                />
              )) : (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '60px', border: '1px dashed var(--line)', borderRadius: '20px' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No salons matched your search.</h3>
                  <p style={{ color: 'var(--muted)' }}>Try searching for a different name, area, or service.</p>
                </div>
              )}
            </div>
          );
        })()}
      </section>
    </main>
  );
}
