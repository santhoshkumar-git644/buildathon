import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalonById, createBooking } from '../services/api.js';
import './Booking.css';

export default function Booking({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      alert("You must be logged in to book an appointment.");
      navigate('/profile');
      return;
    }
    const fetchData = async () => {
      try {
        const { data } = await getSalonById(id).catch(async () => {
          const { data: all } = await import('../services/api.js').then(m => m.getSalons());
          return { data: all.find(s => String(s.id) === String(id)) };
        });
        setSalon(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, navigate]);

  const toggleService = (srv) => {
    if (selectedServices.find(s => s.name === srv.name)) {
      setSelectedServices(selectedServices.filter(s => s.name !== srv.name));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const totalCost = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const advanceAmount = Math.round(totalCost * 0.2);

  const initiateBooking = () => {
    if (!date || !slot || selectedServices.length === 0) {
      alert("Please select a date, time slot, and at least one service.");
      return;
    }
    setShowPayment(true);
  };

  const finalizeBooking = async () => {
    setProcessing(true);
    try {
      await createBooking({
        userId: user.id,
        salonId: salon._id || salon.id,
        salonName: salon.name,
        services: selectedServices.map(s => s.name),
        date,
        slot,
        totalCost,
        advanceAmount,
        advancePaid: true
      });
      alert(`Booking Confirmed! You paid Rs ${advanceAmount} in advance.`);
      navigate('/profile');
    } catch (err) {
      alert("Booking failed. Try again.");
    }
    setProcessing(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading premium experience...</div>;
  if (!salon) return <div style={{ padding: '40px', textAlign: 'center' }}>Salon not found.</div>;

  return (
    <section className="booking-page-layout animate-fade-in">
      <div className="booking-salon-header-card animate-slide-up stagger-1">
        <h2>Book Appointment</h2>
        <h3>{salon.name}</h3>
        <p className="subtitle-info">📍 {salon.address} • ⭐️ {(salon.rating || 0).toFixed(1)}</p>
      </div>
      
      <div className="booking-split-grid">
        <div className="left-column">
          <div className="booking-card-block animate-slide-up stagger-2">
            <h3>1. Select Services ✨</h3>
            <p className="card-subtext">Choose the premium services you'd like to book today.</p>
            <div className="services-checklist-container">
              {salon.services?.map(s => {
                const isSelected = !!selectedServices.find(x => x.name === s.name);
                return (
                  <div 
                    key={s.name} 
                    className={`service-check-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleService(s)}
                  >
                    <div className="service-info-row">
                      <div className="check-box-icon">{isSelected ? '✓' : ''}</div>
                      <div className="service-labels">
                        <span className="service-name-bold">{s.name}</span>
                        <span className="service-duration">⏱ {s.duration} mins</span>
                      </div>
                    </div>
                    <span className="service-price">Rs {s.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="booking-card-block animate-slide-up stagger-3">
            <h3>2. Choose Date & Time 📅</h3>
            <p className="card-subtext">Pick a convenient slot for your appointment.</p>
            
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]} 
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', marginBottom: '20px' }}
            />
            
            <div className="slots-heading">Available Time Slots</div>
            <div className="time-slots-grid">
              {['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map(time => (
                <button 
                  key={time} 
                  className={`time-slot-btn ${slot === time ? 'selected' : ''}`} 
                  onClick={() => setSlot(time)}
                >
                  <span className="slot-text">{time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="booking-card-block checkout-breakdown-card animate-slide-up stagger-4" style={{ position: 'sticky', top: '100px' }}>
            <h3>3. Order Summary 🧾</h3>
            <div className="summary-breakdown-rows" style={{ marginTop: '20px' }}>
              {selectedServices.map(s => (
                <div key={s.name} className="breakdown-row">
                  <span>{s.name}</span>
                  <span>Rs {s.price}</span>
                </div>
              ))}
              {selectedServices.length === 0 && (
                <div className="breakdown-row" style={{ color: 'var(--muted)' }}>
                  <span>No services selected</span>
                  <span>Rs 0</span>
                </div>
              )}
            </div>
            
            <div className="breakdown-row" style={{ marginBottom: '10px' }}>
              <span>Total Cost</span>
              <strong>Rs {totalCost}</strong>
            </div>
            <div className="breakdown-row highlight-brand" style={{ marginBottom: '24px' }}>
              <span>Advance Required (20%)</span>
              <strong>Rs {advanceAmount}</strong>
            </div>

            <button 
              className={`confirm-booking-btn ${totalCost === 0 || !date || !slot ? '' : 'animate-pulse-glow'}`}
              onClick={initiateBooking} 
              disabled={totalCost === 0 || !date || !slot}
            >
              Proceed to Pay Advance (Rs {advanceAmount})
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <div className="payment-header">
              <h3>Secure Advance Payment 🔒</h3>
              <button className="payment-close-btn" onClick={() => setShowPayment(false)}>&times;</button>
            </div>
            <div className="payment-body">
              <p className="payment-summary-text">Pay <strong>Rs {advanceAmount}</strong> to confirm your slot at {salon.name}.</p>
              
              <div className="card-mock-input-group">
                <label>Card Number</label>
                <input type="text" placeholder="4242 4242 4242 4242" disabled value="4242 4242 4242 4242" />
              </div>
              <div className="payment-row-split">
                <div className="card-mock-input-group">
                  <label>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" disabled value="12/26" />
                </div>
                <div className="card-mock-input-group">
                  <label>CVC</label>
                  <input type="text" placeholder="123" disabled value="123" />
                </div>
              </div>
              <div className="payment-security-notice">
                Protected by 256-bit SSL encryption
              </div>
            </div>
            <div className="payment-footer">
              <button className="payment-cancel-btn ghost" onClick={() => setShowPayment(false)} disabled={processing}>Cancel</button>
              <button className="payment-pay-btn" onClick={finalizeBooking} disabled={processing}>
                {processing ? 'Processing...' : `Pay Rs ${advanceAmount} & Book`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
