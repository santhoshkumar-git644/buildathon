import { Link } from 'react-router-dom';

export default function Navbar({ city, setCity, CITIES, onToggleSidebar, user }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger-btn" type="button" onClick={onToggleSidebar} aria-label="Open Menu">
          ☰
        </button>
        <Link to="/" className="logo">
          <span className="logo-emoji">✨</span> ShearCity
        </Link>
      </div>
      
      <div className="topbar-right">
        <label className="city-control">
          <span>City:</span>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        
        {user ? (
          <Link to="/profile" className="user-nav-badge">
            <span className="badge-avatar">{user.name.charAt(0).toUpperCase()}</span>
            <span className="badge-name">{user.name}</span>
          </Link>
        ) : (
          <Link to="/profile" className="login-nav-btn">Login</Link>
        )}
      </div>
    </header>
  );
}
