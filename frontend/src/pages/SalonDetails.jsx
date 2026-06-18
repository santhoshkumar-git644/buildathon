import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSalonById, getSalonReviews } from '../services/api.js';
import ReviewCard from '../components/ReviewCard.jsx';

export default function SalonDetails() {
  const { id } = useParams();
  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Find salon in the full list since our backend doesn't properly search by custom string ID yet (it uses ObjectId for real findById)
        // For simplicity in this refactor, we just fetch all and find
        const { data } = await getSalonById(id).catch(async () => {
          const { data: all } = await import('../services/api.js').then(m => m.getSalons());
          return { data: all.find(s => String(s.id) === String(id)) };
        });
        setSalon(data);
        
        // Mock reviews fetching if actual API fails due to schema mismatches
        try {
           const revs = await getSalonReviews(id);
           setReviews(revs.data);
        } catch {
           setReviews(data?.reviews || []);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!salon) return <div>Salon not found.</div>;

  return (
    <section className="detail-layout">
      <div className="detail-header">
        <div>
          <h2>{salon.name}</h2>
          <p>{salon.address}</p>
          <p>{salon.distance} km away • Open {salon.hours}</p>
        </div>
      </div>
      <section className="section-block">
        <h3>Services & pricing</h3>
        <table>
          <thead><tr><th>Service</th><th>Duration</th><th>Price</th></tr></thead>
          <tbody>
            {salon.services?.map(s => (
              <tr key={s.name}><td>{s.name}</td><td>{s.duration} mins</td><td>Rs {s.price}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="section-block">
        <h3>Reviews</h3>
        <div className="review-list">
          {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
        </div>
      </section>
      <Link to={`/booking/${salon.id}`}><button className="sticky-cta">Book Appointment</button></Link>
    </section>
  );
}
