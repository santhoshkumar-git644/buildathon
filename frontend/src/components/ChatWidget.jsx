import { useState, useRef } from 'react';
import { chatWithAI } from '../services/api.js';
import { Link, useNavigate } from 'react-router-dom';

export default function ChatWidget({ user, city }) {
  const [isOpen, setIsOpen] = useState(false);
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
    setQuery('');
    setImageBase64(null);
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    
    setLoading(true);

    try {
      const res = await chatWithAI(query, imageBase64, city);
      setConversation([...newChat, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setConversation([...newChat, { sender: 'ai', text: 'Failed to connect to AI server.' }]);
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

  return (
    <div className="glass-panel" style={{ position: 'fixed', bottom: '20px', right: '20px', width: '350px', borderRadius: '16px', padding: '20px', zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <strong style={{ color: 'var(--brand)' }}>✨ AI Stylist</strong>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', color: 'var(--muted)', padding: 0, minHeight: 0 }}>×</button>
      </div>
      
      <div style={{ marginBottom: '15px', height: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {conversation.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', background: msg.sender === 'user' ? 'var(--brand)' : 'var(--card)', color: msg.sender === 'user' ? '#000' : 'var(--ink)', padding: '10px 14px', borderRadius: '14px', maxWidth: '85%' }}>
            {msg.img && <img src={msg.img} alt="upload" style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }} />}
            {msg.sender === 'ai' ? parseAiText(msg.text) : msg.text}
          </div>
        ))}
        {loading && <div style={{ alignSelf: 'flex-start', color: 'var(--muted)', fontStyle: 'italic' }}>Thinking...</div>}
      </div>

      {imagePreview && (
        <div style={{ marginBottom: '10px', position: 'relative', width: '60px' }}>
          <img src={imagePreview} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
          <button onClick={() => { setImagePreview(null); setImageBase64(null); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', minHeight: 0, fontSize: '10px' }}>x</button>
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
          style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', minHeight: '44px' }}
          title="Upload Photo"
        >
          📷
        </button>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && askAi()}
          placeholder="Ask or upload photo..." 
          style={{ flex: 1 }} 
        />
        <button style={{ padding: '10px 16px', background: 'var(--brand)', color: '#000' }} onClick={askAi}>➤</button>
      </div>
    </div>
  );
}
