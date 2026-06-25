import React, { useState, useEffect } from 'react';
import { getAllBookings, verifyBooking } from '../services/api.js';
import './AdminDashboard.css';

export default function AdminDashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'owner') {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings();
      setBookings(res.data || []);
    } catch (err) {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (bookingId) => {
    try {
      // Send verify request (which marks it as past)
      await verifyBooking(bookingId);
      alert('Customer arrival verified successfully!');
      fetchBookings(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify booking');
    }
  };

  if (!user || user.role !== 'owner') {
    return (
      <main className="admin-dashboard-container">
        <h2>Access Denied</h2>
        <p>You must be logged in as a Salon Owner to view this page.</p>
      </main>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');

  return (
    <main className="admin-dashboard-container">
      <div className="admin-header-banner">
        <h2>Salon Admin Dashboard 🏢</h2>
        <p>Manage today's appointments and verify customer arrivals.</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="dashboard-section">
        <h3>📅 Today's Appointments</h3>
        {loading ? (
          <p>Loading appointments...</p>
        ) : upcomingBookings.length === 0 ? (
          <div className="empty-bookings">
            <p>No upcoming appointments to verify.</p>
          </div>
        ) : (
          <div className="admin-bookings-grid">
            {upcomingBookings.map((b) => {
              const id = b._id || b.id;
              return (
                <div key={id} className="admin-booking-card">
                  <div className="admin-ticket-header">
                    <h4>Customer Appointment</h4>
                    <span className="ticket-status upcoming">Awaiting Arrival</span>
                  </div>
                  <div className="admin-ticket-details">
                    <p><strong>Salon:</strong> {b.salonName}</p>
                    <p><strong>📅 Date:</strong> {b.date}</p>
                    <p><strong>🕒 Time Slot:</strong> {b.slot}</p>
                    <p><strong>✂️ Services:</strong> {b.services?.join(', ')}</p>
                    <p><strong>💳 Cost:</strong> Rs {b.totalCost}</p>
                    <p><strong>🔑 OTP Provided:</strong> <span className="otp-highlight">{b.otp || 'N/A'}</span></p>
                  </div>
                  <div className="admin-ticket-actions">
                    <button 
                      className="btn-verify-arrival"
                      onClick={() => handleVerify(id)}
                    >
                      Verify Customer Arrival ✓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
