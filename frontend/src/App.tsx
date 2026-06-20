import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import SalonDetails from './pages/SalonDetails.jsx';
import Booking from './pages/Booking.jsx';
import Profile from './pages/Profile.jsx';
import SavedSalons from './pages/SavedSalons.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import MyBookings from './pages/MyBookings.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import { toggleSaveSalonDB, fetchSavedSalonsDB } from './services/api.js';

function ConditionalChatWidget({ user }) {
  const location = useLocation();
  if (location.pathname === '/chatbot') return null;
  return <ChatWidget user={user} />;
}

function App() {
  const [city, setCity] = useState('Mumbai');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [savedIds, setSavedIds] = useState([]);

  const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune'];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setCity(parsedUser.city || 'Mumbai');
      // Fetch saved salons from DB
      fetchSavedSalonsDB(parsedUser.id).then(res => {
        // Handle array of objects or strings
        setSavedIds(res.data.map(s => s._id || s));
      }).catch(err => console.error("Error fetching saved", err));
    } else {
      const guestSaved = JSON.parse(localStorage.getItem('saved_guest') || '[]');
      setSavedIds(guestSaved);
    }
  }, []);

  const handleToggleSave = async (salonId) => {
    if (!user) {
      alert("Please login to save salons!");
      return;
    }
    
    let updated;
    if (savedIds.includes(salonId)) {
      updated = savedIds.filter(id => id !== salonId);
    } else {
      updated = [...savedIds, salonId];
    }
    setSavedIds(updated);

    try {
      await toggleSaveSalonDB(user.id, salonId);
    } catch (error) {
      console.error("Failed to sync saved salon", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSavedIds([]);
    alert('Logged out successfully.');
  };

  return (
    <BrowserRouter>
      <div className="app-shell-flex">
        <Navbar 
          city={city} 
          setCity={setCity} 
          CITIES={CITIES} 
          onToggleSidebar={() => setSidebarOpen(prev => !prev)} 
          user={user}
        />
        
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          user={user} 
          onLogout={handleLogout} 
        />
        
        <div className="app-main-content">
          <Routes>
            <Route path="/" element={<Home city={city} savedIds={savedIds} onToggleSave={handleToggleSave} user={user} />} />
            <Route path="/salon/:id" element={<SalonDetails savedIds={savedIds} onToggleSave={handleToggleSave} user={user} />} />
            <Route path="/booking/:id" element={<Booking user={user} />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/my-bookings" element={<MyBookings user={user} />} />
            <Route path="/saved-salons" element={<SavedSalons savedIds={savedIds} onToggleSave={handleToggleSave} city={city} />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
          </Routes>
        </div>

        <ConditionalChatWidget user={user} />
      </div>
    </BrowserRouter>
  );
}

export default App;
