import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import SalonDetails from './pages/SalonDetails.jsx';
import Booking from './pages/Booking.jsx';
import Profile from './pages/Profile.jsx';
import SavedSalons from './pages/SavedSalons.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';

function App() {
  const [city, setCity] = useState('Mumbai');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Track saved salons (heart bookmarking system)
  const [savedIds, setSavedIds] = useState<any[]>([]);

  const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune'];

  // Load user session and saved salons on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      const localSaved = JSON.parse(localStorage.getItem(`saved_${parsedUser.id}`)) || [];
      setSavedIds(localSaved);
    } else {
      const guestSaved = JSON.parse(localStorage.getItem('saved_guest') || '[]');
      setSavedIds(guestSaved);
    }
  }, []);

  // Sync saved list when user changes
  useEffect(() => {
    if (user) {
      const localSaved = JSON.parse(localStorage.getItem(`saved_${user.id}`) || '[]');
      setSavedIds(localSaved);
    } else {
      const guestSaved = JSON.parse(localStorage.getItem('saved_guest') || '[]');
      setSavedIds(guestSaved);
    }
  }, [user]);

  const handleToggleSave = (salonId: any) => {
    let updated: any[];
    if (savedIds.includes(salonId)) {
      updated = savedIds.filter(id => id !== salonId);
    } else {
      updated = [...savedIds, salonId];
    }
    setSavedIds(updated);
    
    // Save to local storage
    if (user) {
      localStorage.setItem(`saved_${user.id}`, JSON.stringify(updated));
    } else {
      localStorage.setItem('saved_guest', JSON.stringify(updated));
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
        {/* Navigation & Sidebar */}
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
        
        {/* Layout with main content offset for fixed sidebar on desktop */}
        <div className="app-main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  city={city} 
                  savedIds={savedIds} 
                  onToggleSave={handleToggleSave} 
                />
              } 
            />
            <Route path="/salon/:id" element={<SalonDetails />} />
            <Route 
              path="/booking/:id" 
              element={<Booking user={user} />} 
            />
            <Route 
              path="/profile" 
              element={<Profile user={user} setUser={setUser} />} 
            />
            <Route 
              path="/saved-salons" 
              element={
                <SavedSalons 
                  savedIds={savedIds} 
                  onToggleSave={handleToggleSave} 
                  city={city} 
                />
              } 
            />
            <Route path="/chatbot" element={<ChatbotPage />} />
          </Routes>
        </div>

        {/* Floating AI Chatbot Button on Bottom Right */}
        <Link to="/chatbot" className="floating-chat-widget-btn" title="AI Chatbot Assistant">
          💬 Ask AI
        </Link>
      </div>
    </BrowserRouter>
  );
}

export default App;
