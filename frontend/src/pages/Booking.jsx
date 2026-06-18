import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/api.js';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  
  const handleConfirm = async () => {
    try {
      // Stub user ID and salon Object ID
      await createBooking({
        userId: '000000000000000000000000', 
        salonId: '000000000000000000000000',
        salonName: 'Selected Salon',
        services: ['Haircut'],
        date: date || '2026-06-20',
        slot: '10:00 AM',
        totalCost: 1000
      });
      alert('Booking confirmed!');
      navigate('/profile');
    } catch (err) {
      alert('Error creating booking. Make sure IDs are valid ObjectIds in backend.');
    }
  };

  return (
    <section className="booking-layout">
      <h2>Book appointment</h2>
      <div className="step-card">
        <h3>Select Date</h3>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <button onClick={handleConfirm}>Confirm Booking</button>
    </section>
  );
}
