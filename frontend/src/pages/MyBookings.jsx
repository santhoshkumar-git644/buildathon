import { useState, useEffect } from 'react';
import { getUserBookings, cancelBooking } from '../services/api.js';
import ReviewModal from '../components/ReviewModal.jsx';
import './Profile.css'; // Reusing profile styles for dashboard

export default function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await getUserBookings(user.id);
      setBookings(res.data);
    } catch (err) {
      console.warn('Booking fetch error, loading mockup data');
      const localBookings = JSON.parse(localStorage.getItem(`bookings_${user.id}`)) || [];
      setBookings(localBookings);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelBooking(bookingId);
      fetchUserBookings();
    } catch {
      const updated = bookings.map(b => (b._id === bookingId || b.id === bookingId) ? { ...b, status: 'cancelled' } : b);
      setBookings(updated);
      localStorage.setItem(`bookings_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleSimulateHaircut = (booking) => {
    setSelectedBookingForReview(booking);
  };

  const handleReviewSubmitted = (bookingId) => {
    const updated = bookings.map(b => {
      const id = b._id || b.id;
      if (id === bookingId) {
        return { ...b, status: 'past' };
      }
      return b;
    });
    setBookings(updated);
    localStorage.setItem(`bookings_${user.id}`, JSON.stringify(updated));
    setSelectedBookingForReview(null);
  };

  if (!user) {
    return (
      <main className="profile-dashboard-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Please log in to view your bookings.</h2>
      </main>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'past');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <main className="profile-dashboard-container">
      <div className="profile-header-banner">
        <h2>My Bookings 📅</h2>
        <p>Manage your upcoming and past salon appointments</p>
      </div>

      <section className="dashboard-section">
        <h3>📅 Upcoming Appointments</h3>
        {bookingsLoading ? (
          <p>Loading your appointments...</p>
        ) : upcomingBookings.length === 0 ? (
          <div className="empty-bookings">
            <p>No upcoming appointments. Ready for a trim?</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {upcomingBookings.map((b) => {
              const id = b._id || b.id;
              return (
                <div key={id} className="booking-ticket-card">
                  <div className="ticket-header">
                    <h4>{b.salonName}</h4>
                    <span className="ticket-status upcoming">Confirmed</span>
                  </div>
                  <div className="ticket-details">
                    <p><strong>📅 Date:</strong> {b.date}</p>
                    <p><strong>🕒 Time Slot:</strong> {b.slot}</p>
                    <p><strong>✂️ Services:</strong> {b.services?.join(', ')}</p>
                    <p><strong>👨 Stylist:</strong> {b.stylist || 'No Preference'}</p>
                    <p><strong>💳 Cost:</strong> Rs {b.totalCost} (Paid 20% Deposit: Rs {b.totalCost * 0.2})</p>
                  </div>
                  <div className="ticket-actions">
                    <button 
                      className="btn-complete-haircut"
                      onClick={() => handleSimulateHaircut(b)}
                    >
                      Mark Haircut Completed ✂️
                    </button>
                    <button 
                      className="btn-cancel-ticket ghost"
                      onClick={() => handleCancelBooking(id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="dashboard-two-column">
        <section className="dashboard-section flex-1">
          <h3>⌛ Past Appointments</h3>
          {pastBookings.length === 0 ? (
            <p className="empty-subtext">No past appointment history.</p>
          ) : (
            <div className="history-list">
              {pastBookings.map((b) => (
                <div key={b._id || b.id} className="history-item-row">
                  <div>
                    <strong>{b.salonName}</strong>
                    <p>{b.date} • {b.services?.join(', ')}</p>
                  </div>
                  <span className="history-badge completed">Past Haircut</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section flex-1">
          <h3>❌ Cancelled Bookings</h3>
          {cancelledBookings.length === 0 ? (
            <p className="empty-subtext">No cancelled appointments.</p>
          ) : (
            <div className="history-list">
              {cancelledBookings.map((b) => (
                <div key={b._id || b.id} className="history-item-row">
                  <div>
                    <strong>{b.salonName}</strong>
                    <p>{b.date} • {b.services?.join(', ')}</p>
                  </div>
                  <span className="history-badge cancelled">Cancelled</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </main>
  );
}
