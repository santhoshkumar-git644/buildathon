import { useState } from 'react';
import { getRecommendations } from '../services/api.js';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const askAi = async () => {
    try {
      const res = await getRecommendations(query);
      setResponse(res.data.aiInsights || 'No insights returned.');
    } catch (err) {
      setResponse('Failed to get response from AI.');
    }
  };

  if (!isOpen) {
    return (
      <button 
        style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '15px', borderRadius: '50%', background: 'black', color: 'white' }} 
        onClick={() => setIsOpen(true)}>
        AI Chat
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: '300px', background: 'white', border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>Ask Gemini AI</strong>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', color: 'black' }}>X</button>
      </div>
      <div style={{ marginBottom: '10px', height: '100px', overflowY: 'auto', background: '#f5f5f5', padding: '10px' }}>
        {response || 'Hi! How can I help you find a salon today?'}
      </div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
        placeholder="Type here..." 
        style={{ width: '100%', marginBottom: '10px' }} 
      />
      <button style={{ width: '100%' }} onClick={askAi}>Send</button>
    </div>
  );
}
