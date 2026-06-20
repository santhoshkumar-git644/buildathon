import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalonById, getSalonBookings, createBooking } from '../services/api.js';
import './Booking.css';

export default function Booking({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [salonBookings, setSalonBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD
  const [selectedSlot, setSelectedSlot] = useState('');

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Calendar dates generation (next 10 days starting from today)
  const [availableDates, setAvailableDates] = useState([]);

  const slots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  useEffect(() => {
    // Generate dates
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      dates.push({
        isoString: nextDate.toISOString().split('T')[0],
        dayName: nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: nextDate.getDate(),
        monthName: nextDate.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    setAvailableDates(dates);
    setSelectedDate(dates[0].isoString); // Default to today
  }, []);

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        // Find salon in backend or fallback
        const { data } = await getSalonById(id).catch(async () => {
          const { data: all } = await import('../services/api.js').then(m => m.getSalons());
          return { data: all.find(s => String(s.id) === String(id) || String(s._id) === String(id)) };
        });
        setSalon(data);
        if (data.staff && data.staff.length > 0) {
          setSelectedStylist(data.staff[0].name);
        }

        // Fetch upcoming bookings for this salon to build calendar busy indicators
        try {
          const bookingsRes = await getSalonBookings(id);
          setSalonBookings(bookingsRes.data);
        } catch {
          // Empty or mockup bookings
          setSalonBookings([]);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSalonData();
  }, [id]);

  const handleServiceToggle = (serviceName) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices(prev => prev.filter(s => s !== serviceName));
    } else {
      setSelectedServices(prev => [...prev, serviceName]);
    }
  };

  const getSelectedServicesTotal = () => {
    if (!salon || !selectedServices.length) return 0;
    return salon.services
      .filter(s => selectedServices.includes(s.name))
      .reduce((sum, s) => sum + s.price, 0);
  };

  const isSlotBooked = (dateStr, slotStr) => {
    return salonBookings.some(b => b.date === dateStr && b.slot === slotStr && b.status === 'upcoming');
  };

  const handleBookClick = () => {
    if (!user) {
      alert('You need to log in to make a booking.');
      navigate('/profile');
      return;
    }
    if (selectedServices.length === 0) {
      alert('Please select at least one service.');
      return;
    }
    if (!selectedSlot) {
      alert('Please select an appointment time slot.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert('Please fill out all payment fields.');
      return;
    }
    setPaymentLoading(true);

    const totalCost = getSelectedServicesTotal();
    const depositAmount = totalCost * 0.2; // 20% deposit

    const newBookingData = {
      userId: user.id,
      userName: user.name,
      salonId: salon._id || salon.id,
      salonName: salon.name,
      services: selectedServices,
      date: selectedDate,
      slot: selectedSlot,
      stylist: selectedStylist,
      totalCost,
      depositPaid: depositAmount,
      status: 'upcoming'
    };

    try {
      await createBooking(newBookingData);
      alert(`Payment of Rs ${depositAmount} (20% Deposit) Successful! Slot confirmed.`);
      setShowPaymentModal(false);
      navigate('/profile');
    } catch (err) {
      console.warn('Backend createBooking failed, caching locally as mock confirmed booking');
      
      // Cache booking locally in localStorage under user ID so it renders in dashboard!
      const userBookingsKey = `bookings_${user.id}`;
      const localBookings = JSON.parse(localStorage.getItem(userBookingsKey)) || [];
      const cachedBooking = {
        ...newBookingData,
        _id: `mock-bk-${Date.now()}`
      };
      localStorage.setItem(userBookingsKey, JSON.stringify([cachedBooking, ...localBookings]));
      
      alert(`Payment of Rs ${depositAmount} (20% Deposit) Successful! Slot confirmed (Offline simulation).`);
      setShowPaymentModal(false);
      navigate('/profile');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading appointment setup...</div>;
  if (!salon) return <div className="loading-container">Salon not found.</div>;

  const totalCost = getSelectedServicesTotal();
  const depositPaid = totalCost * 0.2;
  const salonPayable = totalCost * 0.8;

  return (
    <main className="booking-page-layout">
      <div className="booking-salon-header-card">
        <h2>Book Appointment</h2>
        <h3>{salon.name}</h3>
        <p className="subtitle-info">📍 {salon.address} • ⭐ {salon.rating?.toFixed(1) || '4.0'} ({salon.reviewCount || 0} reviews)</p>
      </div>

      <div className="booking-split-grid">
        {/* Left Side: Services and Stylist */}
        <div className="booking-left-column">
          <div className="booking-card-block">
            <h3>✂️ Select Services</h3>
            <p className="card-subtext">Toggle service checkmarks to build your booking package</p>
            <div className="services-checklist-container">
              {salon.services?.map(s => (
                <div 
                  key={s.name} 
                  className={`service-check-item ${selectedServices.includes(s.name) ? 'selected' : ''}`}
                  onClick={() => handleServiceToggle(s.name)}
                >
                  <div className="service-info-row">
                    <span className="check-box-icon">
                      {selectedServices.includes(s.name) ? '✓' : ''}
                    </span>
                    <div className="service-labels">
                      <span className="service-name-bold">{s.name}</span>
                      <span className="service-duration">{s.duration} mins • Category: {s.category || 'General'}</span>
                    </div>
                  </div>
                  <strong className="service-price">Rs {s.price}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="booking-card-block">
            <h3>🧔 Select Stylist</h3>
            <select 
              value={selectedStylist} 
              onChange={e => setSelectedStylist(e.target.value)}
              className="stylist-dropdown"
            >
              {salon.staff?.map(st => (
                <option key={st.name} value={st.name}>
                  {st.name} ({st.specialty})
                </option>
              ))}
              <option value="No Preference">No Preference (First Available)</option>
            </select>
          </div>
        </div>

        {/* Right Side: Interactive Calendar and Time Slots */}
        <div className="booking-right-column">
          <div className="booking-card-block">
            <h3>📅 Interactive Booking Calendar</h3>
            <p className="card-subtext">Select a date (red slots show already booked appointments)</p>
            
            {/* Calendar dates slider/grid */}
            <div className="calendar-date-slider">
              {availableDates.map(dateObj => (
                <button
                  type="button"
                  key={dateObj.isoString}
                  className={`calendar-date-node ${selectedDate === dateObj.isoString ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedDate(dateObj.isoString);
                    setSelectedSlot(''); // Reset slot selection
                  }}
                >
                  <span className="date-month">{dateObj.monthName}</span>
                  <span className="date-num">{dateObj.dayNum}</span>
                  <span className="date-day">{dateObj.dayName}</span>
                </button>
              ))}
            </div>

            {/* Slots Grid */}
            <h4 className="slots-heading">Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</h4>
            <div className="time-slots-grid">
              {slots.map(slotStr => {
                const booked = isSlotBooked(selectedDate, slotStr);
                return (
                  <button
                    type="button"
                    key={slotStr}
                    className={`time-slot-btn ${booked ? 'booked' : ''} ${selectedSlot === slotStr ? 'selected' : ''}`}
                    onClick={() => {
                      if (!booked) setSelectedSlot(slotStr);
                    }}
                    disabled={booked}
                  >
                    <span className="slot-text">{slotStr}</span>
                    <span className="slot-status-indicator">{booked ? '🔴 Occupied' : '🟢 Free'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing Breakdown & Checkout Trigger */}
          <div className="booking-card-block checkout-breakdown-card">
            <h3>💳 Booking Summary</h3>
            <div className="summary-breakdown-rows">
              <div className="breakdown-row">
                <span>Subtotal Price:</span>
                <strong>Rs {totalCost}</strong>
              </div>
              <div className="breakdown-row highlight-brand">
                <span>20% Deposit (Pay Now):</span>
                <strong>Rs {depositPaid.toFixed(2)}</strong>
              </div>
              <div className="breakdown-row">
                <span>80% Payable at Salon:</span>
                <strong>Rs {salonPayable.toFixed(2)}</strong>
              </div>
            </div>

            <button 
              className="confirm-booking-btn"
              onClick={handleBookClick}
              disabled={selectedServices.length === 0 || !selectedSlot}
            >
              Pay 20% Deposit & Confirm (Rs {depositPaid.toFixed(2)})
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Card Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <form onSubmit={handlePaymentSubmit} className="payment-modal-card animate-fade">
            <div className="payment-header">
              <h3>Secure Checkout (20% Deposit)</h3>
              <button 
                type="button" 
                className="payment-close-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="payment-body">
              <p className="payment-summary-text">
                Paying <strong>Rs {depositPaid.toFixed(2)}</strong> deposit to secure appointment at <strong>{salon.name}</strong> on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.
              </p>

              <div className="card-mock-input-group">
                <label>Card Number</label>
                <input 
                  type="text" 
                  maxLength="19"
                  placeholder="4111 2222 3333 4444"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  required 
                />
              </div>

              <div className="payment-row-split">
                <div className="card-mock-input-group">
                  <label>Expiry Date</label>
                  <input 
                    type="text" 
                    maxLength="5"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    required 
                  />
                </div>
                <div className="card-mock-input-group">
                  <label>CVV</label>
                  <input 
                    type="password" 
                    maxLength="3"
                    placeholder="123"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="payment-security-notice">
                🔒 Simulated secure sandbox payment processing.
              </div>
            </div>

            <div className="payment-footer">
              <button 
                type="button" 
                className="payment-cancel-btn ghost"
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="payment-pay-btn"
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Processing Payment...' : `Pay Rs ${depositPaid.toFixed(2)} Now`}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
