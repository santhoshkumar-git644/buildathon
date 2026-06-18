import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  photo: { type: String },
  date: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }
});

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true }
});

const salonSchema = new mongoose.Schema({
  salonId: { type: String },
  name: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  distance: { type: Number, default: 2.5 },
  tags: [String],
  address: { type: String, required: true },
  hours: { type: String, required: true },
  images: [String],
  services: [serviceSchema],
  staff: [staffSchema],
  reviews: [reviewSchema]
}, { timestamps: true });

export default mongoose.model('Salon', salonSchema);
