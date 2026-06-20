import { useState, useEffect } from 'react';
import { getSalons } from '../services/api.js';
import SalonCard from '../components/SalonCard.jsx';
import './Home.css';

export default function Home({ city, savedIds, onToggleSave }) {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Combined Filter states
  const [maxPrice, setMaxPrice] = useState(2500);
  const [maxDistance, setMaxDistance] = useState(10);
  const [minRating, setMinRating] = useState(3.5);

  const categories = [
    { name: 'All', emoji: '🏢' },
    { name: "Men's Salon", emoji: '🧔' },
    { name: "Women's Salon", emoji: '💇' },
    { name: 'Beauty Parlour', emoji: '💄' },
    { name: 'Bridal Spots', emoji: '👰' },
    { name: 'Spa & Wellness', emoji: '🌸' }
  ];

  const offers = [
    { code: 'BEAUTY20', desc: 'Flat 20% off on Bridal Spots', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { code: 'CUT50', desc: 'Get 50% discount on first Haircut', color: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' },
    { code: 'SPA150', desc: 'Flat Rs 150 off on Spa treatments', color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { code: 'GLOW30', desc: '30% discount on Facial & Glow packs', color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' }
  ];

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

  const citySalons = salons.filter(s => s.city === city);

  // Recommendations: top rated in this city
  const recommendedSalons = citySalons
    .filter(s => s.rating >= 4.2)
    .slice(0, 3);

  // Search by Salon Name, Locality or Stylist name
  const filteredSalons = citySalons.filter(salon => {
    // Category match
    const categoryMatch = selectedCategory === 'All' || salon.tags?.includes(selectedCategory) ||
      (selectedCategory === "Men's Salon" && salon.name.toLowerCase().includes('men')) ||
      (selectedCategory === "Women's Salon" && salon.name.toLowerCase().includes('women')) ||
      (selectedCategory === "Bridal Spots" && salon.name.toLowerCase().includes('bridal'));

    // Search query match (name, area or staff specialty/name)
    const matchesSearch = 
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.staff?.some(st => st.name.toLowerCase().includes(searchQuery.toLowerCase()) || st.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    // Get min price of salon services to check price filter
    const minPrice = salon.services?.length ? Math.min(...salon.services.map((s) => s.price)) : 0;

    // Filter by BOTH Price and Rating
    const matchesPriceRating = minPrice <= maxPrice && salon.rating >= minRating;

    // Filter by BOTH Distance and Rating
    const matchesDistanceRating = (salon.distance || 2.5) <= maxDistance && salon.rating >= minRating;

    return categoryMatch && matchesSearch && matchesPriceRating && matchesDistanceRating;
  });

  if (loading) return <div className="loading-container">Loading Shears & Styles...</div>;

  return (
    <main className="home-layout">
      {/* Top Section - Welcome & Categories */}
      <section className="hero-compact-section">
        <h1>Find Beauty & Styling Spots in {city}</h1>
        <p>Book instant appointments at top-rated salons near you</p>
      </section>

      {/* Category selector */}
      <section className="home-categories-block">
        <h3 className="section-title">Select Category</h3>
        <div className="category-scroll-container">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`category-item-btn ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span className="category-btn-emoji">{cat.emoji}</span>
              <span className="category-btn-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Offers block */}
      <section className="offers-block">
        <h3 className="section-title">Special Offers For You</h3>
        <div className="offers-scroll-container">
          {offers.map((offer) => (
            <div key={offer.code} className="offer-card" style={{ background: offer.color }}>
              <div className="offer-badge">OFFER</div>
              <h4 className="offer-code">{offer.code}</h4>
              <p className="offer-desc">{offer.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Salons */}
      <section className="recommendations-section">
        <div className="section-head">
          <h3 className="section-title">⭐ Recommended Salons</h3>
          <span className="section-subtitle">Top ratings in {city}</span>
        </div>
        <div className="featured-grid">
          {recommendedSalons.map(salon => (
            <SalonCard 
              key={salon.id || salon._id} 
              salon={salon} 
              isSaved={savedIds.includes(salon.id || salon._id)} 
              onToggleSave={onToggleSave} 
            />
          ))}
        </div>
      </section>

      {/* Transition to Booking section */}
      <hr className="section-divider" />

      <section id="booking-section" className="booking-section-wrapper">
        <div className="booking-section-header">
          <h2>📅 Book an Appointment</h2>
          <p>Search, filter, and lock your slot instantly</p>
        </div>

        {/* Search Bar for Salons and Stylists */}
        <div className="search-bar-row">
          <input 
            type="text" 
            placeholder="🔍 Search salons by name, area, stylist name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="home-search-input"
          />
        </div>

        {/* Filter panel applying Price & Rating, Distance & Rating together */}
        <div className="filters-container-box">
          <div className="filter-group-combined">
            <span className="filter-title-badge">💰 Price & Rating Combined Filter</span>
            <div className="filter-controls">
              <label>
                Max Price: <strong>Rs {maxPrice}</strong>
                <input 
                  type="range" 
                  min="100" 
                  max="5000" 
                  step="50" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))} 
                />
              </label>
              <label>
                Min Rating: <strong>{minRating} ⭐</strong>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="0.1" 
                  value={minRating} 
                  onChange={(e) => setMinRating(Number(e.target.value))} 
                />
              </label>
            </div>
          </div>

          <div className="filter-group-combined">
            <span className="filter-title-badge">📍 Distance & Rating Combined Filter</span>
            <div className="filter-controls">
              <label>
                Max Distance: <strong>{maxDistance} km</strong>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="0.5" 
                  value={maxDistance} 
                  onChange={(e) => setMaxDistance(Number(e.target.value))} 
                />
              </label>
              <label>
                Min Rating: <strong>{minRating} ⭐</strong>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="0.1" 
                  value={minRating} 
                  onChange={(e) => setMinRating(Number(e.target.value))} 
                  disabled // sharing rating with price
                />
              </label>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="booking-results-header">
          <h3>Available Spots ({filteredSalons.length})</h3>
          {selectedCategory !== 'All' && <span className="active-tag-badge">{selectedCategory}</span>}
        </div>

        {filteredSalons.length === 0 ? (
          <div className="no-results-state">
            <p>No salons match your search and combined filters. Try adjusting sliders or search terms.</p>
          </div>
        ) : (
          <div className="featured-grid">
            {filteredSalons.map(salon => (
              <SalonCard 
                key={salon.id || salon._id} 
                salon={salon} 
                isSaved={savedIds.includes(salon.id || salon._id)} 
                onToggleSave={onToggleSave} 
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
