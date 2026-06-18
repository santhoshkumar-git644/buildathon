import { useState, useEffect } from 'react';
import { getSalons } from '../services/api.js';
import SalonCard from '../components/SalonCard.jsx';

export default function Home({ city }) {
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

  const citySalons = salons.filter(s => s.city === city);

  if (loading) return <div>Loading salons...</div>;

  return (
    <main>
      <section className="hero-section">
        <div>
          <h1>Beauty appointments in {city}, booked in minutes.</h1>
          <p>Discover salons, compare ratings, and lock your slot instantly.</p>
        </div>
      </section>
      <section className="section-block">
        <div className="section-head">
          <h2>Featured salons in {city}</h2>
        </div>
        <div className="featured-grid">
          {citySalons.map(salon => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
        </div>
      </section>
    </main>
  );
}
