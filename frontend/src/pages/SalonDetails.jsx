import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSalonById, getSalonReviews, summarizeReviews } from '../services/api.js';
import ReviewCard from '../components/ReviewCard.jsx';

export default function SalonDetails() {
  const { id } = useParams();
  const [salon, setSalon] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getSalonById(id).catch(async () => {
          const { data: all } = await import('../services/api.js').then(m => m.getSalons());
          return { data: all.find(s => String(s.id) === String(id)) };
        });
        setSalon(data);
        
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

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      // In a fully working system, pass the DB ObjectId, fallback to passing first review text roughly
      const res = await summarizeReviews(salon._id || id);
      setSummary(res.data.summary);
    } catch (e) {
      setSummary("AI Summarization failed. Make sure your Gemini API key is valid.");
    }
    setSummarizing(false);
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Reviews</h3>
          <button onClick={handleSummarize} disabled={summarizing} style={{ background: 'var(--brand-soft)', color: 'var(--brand)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--brand)', fontWeight: 'bold' }}>
            {summarizing ? 'Summarizing...' : '✨ Summarize Reviews with AI'}
          </button>
        </div>
        
        {summary && (
          <div style={{ background: 'rgba(232, 176, 89, 0.1)', padding: '15px', borderRadius: '12px', margin: '15px 0', border: '1px solid var(--brand)', color: 'var(--ink)' }}>
            <strong style={{ color: 'var(--brand)' }}>✨ AI Summary: </strong> {summary}
          </div>
        )}

        <div className="review-list">
          {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
        </div>
      </section>
      <Link to={`/booking/${salon._id || id}`}><button className="sticky-cta">Book Appointment</button></Link>
    </section>
  );
}
