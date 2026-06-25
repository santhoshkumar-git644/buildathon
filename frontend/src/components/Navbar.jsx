import { Link } from 'react-router-dom';

export default function Navbar({ city, setCity, CITIES, setCities, onToggleSidebar, user, setUserLocation }) {
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        if (setUserLocation) setUserLocation({ lat: latitude, lon: longitude });
        
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        
        const addr = data.address || {};
        const detectedCity = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.city_district || addr.state_district || addr.state;
        
        if (detectedCity) {
          // Format it to title case (e.g. "Bandra West" or "Bengaluru East")
          const formattedCity = detectedCity.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          
          // Match case-insensitively with current city list
          const match = CITIES.find(c => c.toLowerCase() === formattedCity.toLowerCase());
          if (match) {
            setCity(match);
            console.log(`[Location Detection] Matched existing city: ${match}`);
          } else {
            // Add dynamically to cities dropdown list
            if (typeof setCities === 'function') {
              setCities(prev => {
                if (prev.includes(formattedCity)) return prev;
                return [...prev, formattedCity];
              });
            }
            setCity(formattedCity);
            console.log(`[Location Detection] Dynamically added new city: ${formattedCity}`);
          }
        } else {
          alert("Location detected, but city name could not be resolved.");
        }
      } catch (err) {
        console.error("Error reverse geocoding location:", err);
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
