import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/api.js';
import { Link } from 'react-router-dom';
import './ChatbotPage.css';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hi there! I am your ShearCity AI beauty assistant. 💇✨ Ask me anything! For example: "Recommend a Bridal spot" or "Find high-rated Mens salons".',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Recommend a Men's salon",
    "Find Bridal spots",
    "Show me Beauty Parlours",
    "Cheapest salon options",
    "Best rated salon near me"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Fetch recommendation from API
      const res = await chatWithAI(queryText);
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
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I encountered an issue connecting to my beauty brain database. Please try again.',
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
                              <span>📍 {s.distance || '2.5'} km away</span>
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

          {/* Chat input */}
          <div className="chat-input-bar">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about pricing, ratings, best stylists..."
              disabled={loading}
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
