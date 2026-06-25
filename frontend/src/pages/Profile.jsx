import { useState, useEffect } from 'react';
import { login, signup, getUserBookings, getSalonBookings, cancelBooking } from '../services/api.js';
import ReviewModal from '../components/ReviewModal.jsx';
import './Profile.css';

export default function Profile({ user, setUser }) {
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Login fields
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'phone'
  const [signupInput, setSignupInput] = useState('');
  const [signupCity, setSignupCity] = useState('Mumbai');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Dashboard state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune'];

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    setBookingsLoading(true);
    try {
      if (user.role === 'owner' && user.ownedSalonId) {
        const res = await getSalonBookings(user.ownedSalonId);
        setBookings(res.data);
      } else {
        const res = await getUserBookings(user.id);
        setBookings(res.data);
      }
    } catch (err) {
      // Mock fallback if API has trouble
      console.warn('Booking fetch error, loading mockup data');
      const localBookings = JSON.parse(localStorage.getItem(`bookings_${user.id}`)) || [];
      setBookings(localBookings);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginInput.trim() || !loginPassword.trim()) {
      setLoginError('Please fill out all fields.');
      return;
    }
    
    // Quick frontend check to ensure they follow chosen method
    if (loginMethod === 'email' && !loginInput.includes('@')) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    if (loginMethod === 'phone' && !/^\d{10}$/.test(loginInput.trim())) {
      setLoginError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    try {
      const { data } = await login(loginInput.trim(), loginPassword);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setLoginLoading(false);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Please check your network connection.');
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupName.trim() || !signupInput.trim() || !signupPassword.trim()) {
      setSignupError('Please fill out all fields.');
      return;
    }

    if (signupMethod === 'email' && !signupInput.includes('@')) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (signupMethod === 'phone' && !/^\d{10}$/.test(signupInput.trim())) {
      setSignupError('Please enter a valid 10-digit phone number.');
      return;
    }

    setSignupLoading(true);
    setSignupError('');
    
    const signupData = {
      name: signupName.trim(),
      email: signupMethod === 'email' ? signupInput.trim() : '',
      phone: signupMethod === 'phone' ? signupInput.trim() : '',
      city: signupCity,
      password: signupPassword
    };

    try {
      const { data } = await signup(signupData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      alert('Registration successful!');
      setSignupLoading(false);
    } catch (err) {
      setSignupError(err.response?.data?.message || 'Signup failed. Please try again.');
      setSignupLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelBooking(bookingId);
      // Refresh
      fetchUserBookings();
    } catch {
      // Mock local storage cancellation
      const updated = bookings.map(b => (b._id === bookingId || b.id === bookingId) ? { ...b, status: 'cancelled' } : b);
      setBookings(updated);
      localStorage.setItem(`bookings_${user.id}`, JSON.stringify(updated));
    }
  };

  const handleSimulateHaircut = (booking) => {
    setSelectedBookingForReview(booking);
  };

  const handleReviewSubmitted = (bookingId) => {
    // Mark as past booking
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

  // Render auth forms if not logged in
  if (!user) {
    return (
      <main className="auth-page-container">
        <div className="auth-card-block">
          <div className="auth-toggle-header">
            <button 
              className={`auth-toggle-tab ${isLoginView ? 'active' : ''}`}
              onClick={() => { setIsLoginView(true); setLoginError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`auth-toggle-tab ${!isLoginView ? 'active' : ''}`}
              onClick={() => { setIsLoginView(false); setSignupError(''); }}
            >
              Register
            </button>
          </div>

          {isLoginView ? (
            /* Expanded Login block */
            <form onSubmit={handleLoginSubmit} className="auth-form-body animate-fade">
              <h3>Welcome Back</h3>
              <p className="form-subtitle">Enter your details to manage appointments</p>

              {loginError && <div className="error-banner">{loginError}</div>}

              {/* Login Method Toggle: Email OR Phone - Not Both */}
              <div className="input-method-tabs">
                <button 
                  type="button" 
                  className={`method-tab ${loginMethod === 'email' ? 'active' : ''}`}
                  onClick={() => { setLoginMethod('email'); setLoginInput(''); }}
                >
                  📧 Email
                </button>
                <button 
                  type="button" 
                  className={`method-tab ${loginMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => { setLoginMethod('phone'); setLoginInput(''); }}
                >
                  📱 Phone Number
                </button>
              </div>

              <div className="form-group">
                <label>
                  {loginMethod === 'email' ? 'Email Address' : 'Phone Number (10 digits)'}
                </label>
                <input 
                  type={loginMethod === 'email' ? 'email' : 'tel'} 
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder={loginMethod === 'email' ? 'yourname@example.com' : 'e.g. 9876543210'}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required 
                />
              </div>

              <button className="auth-submit-btn" type="submit" disabled={loginLoading}>
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form-body animate-fade">
              <h3>Create Your Account</h3>
              <p className="form-subtitle">Book high-quality salon services in seconds</p>

              {signupError && <div className="error-banner">{signupError}</div>}

              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  required 
                />
              </div>

              {/* Signup Method Toggle: Email OR Phone - Not Both */}
              <div className="input-method-tabs">
                <button 
                  type="button" 
                  className={`method-tab ${signupMethod === 'email' ? 'active' : ''}`}
                  onClick={() => { setSignupMethod('email'); setSignupInput(''); }}
                >
                  📧 Signup via Email
                </button>
                <button 
                  type="button" 
                  className={`method-tab ${signupMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => { setSignupMethod('phone'); setSignupInput(''); }}
                >
                  📱 Signup via Phone
                </button>
              </div>

              <div className="form-group">
                <label>
                  {signupMethod === 'email' ? 'Email Address' : 'Phone Number (10 digits)'}
                </label>
                <input 
                  type={signupMethod === 'email' ? 'email' : 'tel'} 
                  value={signupInput}
                  onChange={(e) => setSignupInput(e.target.value)}
                  placeholder={signupMethod === 'email' ? 'yourname@example.com' : 'e.g. 9876543210'}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Your City</label>
                <select value={signupCity} onChange={(e) => setSignupCity(e.target.value)}>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required 
                />
              </div>

              <button className="auth-submit-btn" type="submit" disabled={signupLoading}>
                {signupLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  // Render profile dashboard if logged in
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'past');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <main className="profile-dashboard-container">
      <div className="profile-header-banner">
        <div className="user-profile-details">
          <div className="avatar-large">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2>Hello, {user.name} 👋</h2>
            <p className="city-info">📍 {user.city} Resident</p>
            <p className="contact-info">
              {user.email && `📧 ${user.email}`} 
              {user.phone && `📱 ${user.phone}`}
            </p>
          </div>
        </div>
        <button className="btn-logout-dashboard ghost" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          alert('Logged out successfully.');
        }}>
          Logout 🚪
        </button>
      </div>

      <section className="dashboard-section">
        <h3>📅 {user.role === 'owner' ? 'Upcoming Salon Appointments' : 'Upcoming Appointments'}</h3>
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
                    <h4>{user.role === 'owner' ? b.userName || 'Customer' : b.salonName}</h4>
                    <span className="ticket-status upcoming">Confirmed</span>
                  </div>
                  <div className="ticket-details">
                    <p><strong>📅 Date:</strong> {b.date}</p>
                    <p><strong>🕒 Time Slot:</strong> {b.slot}</p>
                    <p><strong>✂️ Services:</strong> {b.services?.join(', ')}</p>
                    <p><strong>👨 Stylist:</strong> {b.stylist || 'No Preference'}</p>
                    <p><strong>💳 Cost:</strong> Rs {b.totalCost} (Paid 20% Deposit: Rs {b.totalCost * 0.2})</p>
                    <p><strong>🔑 Verification OTP:</strong> <span style={{ color: 'var(--brand)', fontWeight: 'bold' }}>{b.otp || 'N/A'}</span></p>
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
          <h3>⌛ {user.role === 'owner' ? 'Past Salon Appointments' : 'Past Appointments'}</h3>
          {pastBookings.length === 0 ? (
            <p className="empty-subtext">No past appointment history.</p>
          ) : (
            <div className="history-list">
              {pastBookings.map((b) => (
                <div key={b._id || b.id} className="history-item-row">
                  <div>
                    <strong>{user.role === 'owner' ? b.userName || 'Customer' : b.salonName}</strong>
                    <p>{b.date} • {b.services?.join(', ')}</p>
                  </div>
                  <span className="history-badge completed">Past Haircut</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section flex-1">
          <h3>❌ {user.role === 'owner' ? 'Cancelled Salon Bookings' : 'Cancelled Bookings'}</h3>
          {cancelledBookings.length === 0 ? (
            <p className="empty-subtext">No cancelled appointments.</p>
          ) : (
            <div className="history-list">
              {cancelledBookings.map((b) => (
                <div key={b._id || b.id} className="history-item-row">
                  <div>
                    <strong>{user.role === 'owner' ? b.userName || 'Customer' : b.salonName}</strong>
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
