import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function ChatWidget({ user, city, userLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [conversation, setConversation] = useState([{ sender: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! Need help finding the perfect salon in ${city}?` }]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const askAi = async () => {
    if (!query.trim() && !imageBase64) return;
    
    const newChat = [...conversation, { 
      sender: 'user', 
      text: query, 
      img: imagePreview 
    }];
    
    setConversation(newChat);
    const queryToSend = query;
    const imgToSend = imageBase64;

    setQuery('');
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setLoading(true);

    const lat = userLocation ? userLocation.lat : null;
    const lon = userLocation ? userLocation.lon : null;

    try {
      const res = await chatWithAI(queryToSend, imgToSend, city, lat, lon);
      setConversation([...newChat, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      console.warn("Backend chatWithAI failed, running ChatWidget offline fallback", err);
      
      let replyText = `I see your message: "${queryToSend}". The database server is currently offline. once you connect MongoDB, I will match you with active salons in ${city}!`;
      const queryLower = queryToSend ? queryToSend.toLowerCase() : '';
      
      const lat = userLocation ? userLocation.lat : null;
      const lon = userLocation ? userLocation.lon : null;

      if (queryLower.includes('near') || queryLower.includes('close') || queryLower.includes('location') || queryLower.includes('dist')) {
        replyText = `Based on your geolocation (${lat ? lat.toFixed(4) : 'Mock Lat'}, ${lon ? lon.toFixed(4) : 'Mock Lon'}), the closest spots in ${city} are 'Classic Cuts Lounge' (1.2 km away) and 'Gold & Gloss Parlour' (2.4 km away). Start MongoDB and backend to retrieve exact listings!`;
      } else if (imgToSend || queryLower.includes('photo') || queryLower.includes('image') || queryLower.includes('style')) {
        replyText = "That's a fantastic style in the photo! Typically, a style like this in offline mode is estimated at Rs 800 - Rs 1500 depending on the salon packages.";
      } else if (queryLower.includes('men') || queryLower.includes('guy') || queryLower.includes('boy')) {
        replyText = `For Men's styling in ${city}, I highly recommend 'Classic Cuts Lounge'. They specialize in modern haircuts, fades, and grooming.`;
      } else if (queryLower.includes('bridal') || queryLower.includes('wedding')) {
        replyText = `For premium bridal makeup packages in ${city}, check out 'Gold & Gloss Parlour'. They are rated 4.8 stars!`;
      }

      setConversation([...newChat, { sender: 'ai', text: `${replyText} (Offline Fallback Mode)` }]);
    }
    setLoading(false);
  };

  const parseAiText = (text) => {
    const bookRegex = /\[BOOK_SALON:\s*([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = bookRegex.exec(text)) !== null) {
      parts.push(text.substring(lastIndex, match.index));
      const salonId = match[1].trim();
      
      parts.push(
        <div key={match.index} style={{ marginTop: '10px' }}>
          <button 
            onClick={() => {
              if (!user) {
                alert("Please login to book an appointment.");
                navigate('/profile');
              } else {
                navigate(`/booking/${salonId}`);
              }
              setIsOpen(false);
            }}
            style={{ padding: '8px 16px', background: 'var(--brand)', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}
          >
            📅 Book Appointment Now
          </button>
        </div>
      );
      lastIndex = bookRegex.lastIndex;
    }
    parts.push(text.substring(lastIndex));
    return parts;
  };

  if (!isOpen) {
    return (
      <button 
        className="floating-chat-widget-btn"
        onClick={() => setIsOpen(true)}>
        ✨ AI Stylist
      </button>
    );
  }

  const widgetStyle = isMaximized ? {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '85vw',
    maxWidth: '1000px',
    height: '85vh',
    maxHeight: '750px',
    borderRadius: '24px',
    padding: '24px',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
    background: 'rgba(20, 24, 30, 0.98)',
    border: '1px solid var(--brand)',
    transition: 'all 0.3s ease-in-out',
    backdropFilter: 'blur(20px)'
  } : {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    height: '480px',
    borderRadius: '16px',
    padding: '20px',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    background: 'rgba(20, 24, 30, 0.9)',
    border: '1px solid var(--line)',
    transition: 'all 0.3s ease-in-out',
    backdropFilter: 'blur(10px)'
  };

  const messageBoxStyle = isMaximized ? {
    marginBottom: '20px',
    flex: 1,
    overflowY: 'auto',
    background: 'rgba(0,0,0,0.3)',
    padding: '20px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  } : {
    marginBottom: '15px',
    flex: 1,
    overflowY: 'auto',
    background: 'rgba(0,0,0,0.2)',
    padding: '15px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  return (
    <>
      {isMaximized && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, backdropFilter: 'blur(4px)' }} 
          onClick={() => setIsMaximized(false)}
        />
      )}
      <div className="glass-panel" style={widgetStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <strong style={{ color: 'var(--brand)', fontSize: isMaximized ? '1.4rem' : '1rem' }}>✨ AI Stylist</strong>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setIsMaximized(!isMaximized)} 
              style={{ background: 'transparent', color: 'var(--brand)', padding: 0, minHeight: 0, border: 'none', cursor: 'pointer', fontSize: isMaximized ? '1.3rem' : '1.1rem' }}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? '❐' : '⛶'}
            </button>
            <button 
              onClick={() => { setIsOpen(false); setIsMaximized(false); }} 
              style={{ background: 'transparent', color: 'var(--muted)', padding: 0, minHeight: 0, border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
        
        <div style={messageBoxStyle}>
          {conversation.map((msg, i) => (
            <div 
              key={i} 
              style={{ 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                background: msg.sender === 'user' ? 'var(--brand)' : 'var(--card)', 
                color: msg.sender === 'user' ? '#000' : 'var(--ink)', 
                padding: isMaximized ? '12px 18px' : '10px 14px', 
                borderRadius: '14px', 
                maxWidth: '80%',
                fontSize: isMaximized ? '1.05rem' : '0.95rem',
                lineHeight: 1.5
              }}
            >
              {msg.img && <img src={msg.img} alt="upload" style={{ width: '100%', maxWidth: '280px', borderRadius: '8px', marginBottom: '8px', display: 'block' }} />}
              {msg.sender === 'ai' ? parseAiText(msg.text) : msg.text}
            </div>
          ))}
          {loading && <div style={{ alignSelf: 'flex-start', color: 'var(--muted)', fontStyle: 'italic', fontSize: isMaximized ? '1.05rem' : '0.95rem' }}>Thinking...</div>}
        </div>

        {imagePreview && (
          <div style={{ marginBottom: '10px', position: 'relative', width: '60px' }}>
            <img src={imagePreview} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
            <button onClick={() => { setImagePreview(null); setImageBase64(null); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc3545', color: 'white', borderRadius: '50%', padding: 0, border: 'none', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '10px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', minHeight: '44px', border: 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Upload Photo"
          >
            📷
          </button>
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && askAi()}
            placeholder="Ask AI Stylist or upload a photo..." 
            style={{ flex: 1, padding: '12px', fontSize: isMaximized ? '1.05rem' : '0.95rem' }} 
          />
          <button style={{ padding: '10px 18px', background: 'var(--brand)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} onClick={askAi}>➤</button>
        </div>
      </div>
    </>
  );
}
