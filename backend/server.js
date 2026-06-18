import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import salonRoutes from './routes/salonRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/salons', salonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
