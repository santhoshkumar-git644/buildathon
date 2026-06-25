import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['customer', 'owner', 'admin'], default: 'customer' },
  phone: { type: String },
  city: { type: String, required: true },
  passwordHash: { type: String, required: true },
  preferences: {
    budget: { type: Number, default: 2000 },
    preferredStyles: [String],
    favoriteCategories: [String]
  },
  savedSalons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }],
  ownedSalonId: { type: String } // Explicitly links an owner to their salon's string ID
}, { timestamps: true });

export default mongoose.model('User', userSchema);
