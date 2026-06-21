import { Link } from 'react-router-dom';

export default function Navbar({ city, setCity, CITIES, onToggleSidebar, user }) {
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        
        const detectedCity = data.address.city || data.address.town || data.address.state_district;
        if (detectedCity) {
          const normalizedCity = detectedCity.split(' ')[0];
          setCity(normalizedCity);
        }
      } catch (err) {
        console.error(err);
      }
    }, () => {
      alert("Location permission denied.");
    });
  };

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
        <button 
          onClick={detectLocation}
          title="Detect my location"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
        >
          📍
        </button>
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
