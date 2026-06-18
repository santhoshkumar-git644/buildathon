import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import Home from './pages/Home.jsx';
import SalonDetails from './pages/SalonDetails.jsx';
import Booking from './pages/Booking.jsx';
import Profile from './pages/Profile.jsx';
import Recommendations from './pages/Recommendations.jsx';

function App() {
  const [city, setCity] = useState('Mumbai');
  const [mobileMenu, setMobileMenu] = useState(false);
  const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune'];

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar city={city} setCity={setCity} CITIES={CITIES} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />
        
        <Routes>
          <Route path="/" element={<Home city={city} />} />
          <Route path="/salon/:id" element={<SalonDetails />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recommend" element={<Recommendations />} />
        </Routes>
        
        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;
