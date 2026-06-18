import { Link } from 'react-router-dom';

export default function Navbar({ city, setCity, CITIES, mobileMenu, setMobileMenu }) {
  return (
    <header className="topbar">
      <Link to="/" className="logo">ShearCity</Link>
      <div className={`topbar-links ${mobileMenu ? 'open' : ''}`}>
        <label className="city-control">
          <span>City</span>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <Link to="/profile" className="ghost">Login / Signup</Link>
      </div>
      <button className="hamburger" type="button" onClick={() => setMobileMenu(!mobileMenu)}>Menu</button>
    </header>
  );
}
