import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  salonName: { type: String, required: true },
  services: [String],
  date: { type: String, required: true },
  slot: { type: String, required: true },
  stylist: { type: String, default: 'No Preference' },
  status: { type: String, enum: ['upcoming', 'past', 'cancelled'], default: 'upcoming' },
  totalCost: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
