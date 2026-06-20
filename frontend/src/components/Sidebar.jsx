import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path, hash) => {
    onClose();
    if (hash) {
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile drawer */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={onClose}>
            <span className="logo-icon">✨</span> ShearCity
          </Link>
          <button className="sidebar-close-btn" onClick={onClose}>&times;</button>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${isActive('/') && !location.hash ? 'active' : ''}`}
            onClick={() => handleNav('/', null)}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </button>

          <button 
            className="nav-item"
            onClick={() => handleNav('/', 'booking-section')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-label">Booking</span>
          </button>

          <button 
            className={`nav-item ${isActive('/chatbot') ? 'active' : ''}`}
            onClick={() => handleNav('/chatbot', null)}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-label">AI Chatbot</span>
          </button>

          <button 
            className={`nav-item ${isActive('/saved-salons') ? 'active' : ''}`}
            onClick={() => handleNav('/saved-salons', null)}
          >
            <span className="nav-icon">❤️</span>
            <span className="nav-label">Saved Salons</span>
          </button>

          <button 
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => handleNav('/profile', null)}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <div className="user-profile-summary">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <p className="user-name">{user.name}</p>
                <p className="user-email">{user.email || user.phone}</p>
              </div>
              <button className="logout-btn" onClick={() => { onLogout(); onClose(); }} title="Logout">
                🚪
              </button>
            </div>
          ) : (
            <Link to="/profile" className="login-prompt-btn" onClick={onClose}>
              Login / Signup
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
