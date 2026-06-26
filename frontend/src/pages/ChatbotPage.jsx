import { useState, useRef, useEffect } from 'react';
import { chatWithAI, getSalons } from '../services/api.js';
import { Link } from 'react-router-dom';
import { getSalonCoordinates, calculateDistance } from '../utils/location.js';
import './ChatbotPage.css';

export default function ChatbotPage({ city, userLocation }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hi there! I am your ShearCity AI beauty assistant in ${city}. 💇✨ Ask me anything! For example: "Recommend a Bridal spot" or "Find high-rated Mens salons".`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Image Upload state
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "📍 Find salons near me",
    "🚶 Closest salon to me",
    "⭐ Best rated salon near me",
    "Recommend a Men's salon",
    "Find Bridal spots"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    // Require text or image
    if (!queryText.trim() && !imageBase64) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      img: imagePreview,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    // Clear inputs and previews immediately
    if (!textToSend) setInput('');
    const currentImgBase64 = imageBase64;
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setLoading(true);

    const lat = userLocation ? userLocation.lat : null;
    const lon = userLocation ? userLocation.lon : null;

    try {
      // Fetch recommendation from API (passing image and geolocation)
      const res = await chatWithAI(queryText, currentImgBase64, city, lat, lon);
      const rawReply = res.data.reply || '';
      
      // Extract [BOOK_SALON:id] tags
      const salonIds = [];
      const cleanReply = rawReply.replace(/\[BOOK_SALON:\s*([^\]]+)\]/g, (match, id) => {
        salonIds.push(id.trim());
        return '';
      });

      // Fetch salon details for the recommended IDs
      let recommendedSalonsList = [];
      if (salonIds.length > 0) {
        const { data: allSalons } = await import('../services/api.js').then(m => m.getSalons());
        recommendedSalonsList = allSalons.filter(s => salonIds.includes(String(s.id || s._id)));
        
        // Add dynamic distance if location is available
        if (userLocation) {
          recommendedSalonsList = recommendedSalonsList.map(s => {
            const coords = getSalonCoordinates(s);
            const dist = calculateDistance(userLocation.lat, userLocation.lon, coords.lat, coords.lon);
            return { ...s, distance: dist };
          });
        }
      }

      // Add AI reply
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: cleanReply.trim() || "I found some options for you!",
        salons: recommendedSalonsList.slice(0, 3), // Show top 3 recommended
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn("Backend chatWithAI failed, running client-side fallback mock responses", err);
      
      let replyText = `I received your message: "${queryText}". The backend database or server is offline, so I am running in Offline Fallback Mode. once you connect MongoDB and run the server, I will query live salons in ${city}!`;
      let mockSalons = [];

      const queryLower = queryText.toLowerCase();
      if (queryLower.includes('near') || queryLower.includes('close') || queryLower.includes('location') || queryLower.includes('map') || queryLower.includes('address') || queryLower.includes('dist')) {
        replyText = `Based on your location coordinates (${lat ? lat.toFixed(4) : 'Mock Lat'}, ${lon ? lon.toFixed(4) : 'Mock Lon'}), the closest salons in ${city} are:\n1. Classic Cuts Lounge (1.2 km away)\n2. Gold & Gloss Parlour (2.4 km away)\n\nYou can book appointments at any of these spots directly.`;
      } else if (currentImgBase64 || queryLower.includes('photo') || queryLower.includes('image') || queryLower.includes('look') || queryLower.includes('style')) {
        replyText = "That is a gorgeous style! In offline mode, I cannot run deep analysis on the photo, but this layered texture and styling would look incredible on you. Usually, matching services like styling, wash, and blow dry cost around Rs 800 - Rs 1200.";
      } else if (queryLower.includes('men') || queryLower.includes('guy') || queryLower.includes('boy')) {
        replyText = `For Men's grooming in ${city}, 'Classic Cuts Lounge' is highly rated. They specialize in fades, beard grooming, and hair coloring treatments.`;
      } else if (queryLower.includes('bridal') || queryLower.includes('wedding') || queryLower.includes('marry')) {
        replyText = `For premium bridal makeup and wedding salon packages in ${city}, 'Gold & Gloss Parlour' offers excellent rates and holds a 4.8-star customer review rating!`;
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: `${replyText} (Offline Fallback Mode)`,
        salons: mockSalons,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="chatbot-page-container">
      <div className="chatbot-header">
        <h2>✨ Gemini AI Salon Assistant</h2>
        <p>Ask questions to find specific services, price comparisons, or stylist recommendations.</p>
      </div>

      <div className="chatbot-layout">
        {/* Chat area */}
        <div className="chat-area">
          <div className="messages-list">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
                <div className={`message-avatar ${msg.sender}`}>
                  {msg.sender === 'ai' ? '✨' : '👤'}
                </div>
                <div className="message-content-box">
                  {msg.img && (
                    <div style={{ marginBottom: '8px' }}>
                      <img src={msg.img} alt="uploaded style" style={{ maxWidth: '250px', borderRadius: '12px', display: 'block', border: '1px solid var(--line)' }} />
                    </div>
                  )}
                  <div className="message-text">{msg.text}</div>
                  
                  {/* Inline recommended salons */}
                  {msg.salons && msg.salons.length > 0 && (
                    <div className="chat-salon-suggestions">
                      <p className="suggestions-title">Recommended Spots:</p>
                      <div className="chat-salon-grid">
                        {msg.salons.map((s) => (
                          <div key={s.id || s._id} className="chat-salon-item">
                            <div className="chat-salon-header">
                              <strong>{s.name}</strong>
                              <span>⭐ {s.rating?.toFixed(1) || '4.0'}</span>
                            </div>
                            <p>{s.address || s.city}</p>
                            <div className="chat-salon-footer">
                              <span>📍 {s.distance ? typeof s.distance === 'number' ? s.distance.toFixed(1) : s.distance : '2.5'} km away</span>
                              <Link to={`/salon/${s.id || s._id}`} className="chat-salon-btn">
                                Book Now
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-bubble-wrapper ai">
                <div className="message-avatar ai">✨</div>
                <div className="message-content-box">
                  <div className="typing-loader">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="quick-prompts-row">
            {quickPrompts.map((prompt, index) => (
              <button 
                key={index} 
                className="quick-prompt-chip"
                onClick={() => handleSend(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Image Preview before sending */}
          {imagePreview && (
            <div style={{ padding: '10px 15px', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
              <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                <img src={imagePreview} alt="upload preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <button 
                  onClick={() => { setImagePreview(null); setImageBase64(null); }} 
                  style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc3545', color: '#fff', borderRadius: '50%', border: 'none', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                >
                  &times;
                </button>
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Hairstyle photo attached (Gemini will analyze it)</span>
            </div>
          )}

          {/* Chat input */}
          <div className="chat-input-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange} 
              style={{ display: 'none' }} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '10px 15px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '1.2rem', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Upload Hairstyle Image"
              disabled={loading}
            >
              📷
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about styles, pricing, best salons, or upload a style photo..."
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button className="chat-send-btn" onClick={() => handleSend()} disabled={loading}>
              Send 🚀
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
