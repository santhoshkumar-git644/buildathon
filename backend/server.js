import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import salonRoutes from './routes/salonRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

import Salon from './models/Salon.js';
import User from './models/User.js';

import fs from 'fs/promises';

// Connect to MongoDB and auto-seed database if empty
connectDB().then(async () => {
  try {
    const salonCount = await Salon.countDocuments();
    if (salonCount === 0) {
      console.log('Database is empty. Auto-seeding all salons from data/salons.json...');
      const data = await fs.readFile('./data/salons.json', 'utf-8');
      const documents = JSON.parse(data);

      const formattedSalons = documents.map((salon, index) => ({
        salonId: salon.salonId || String(salon._id) || `SAL-${index + 1}`,
        name: salon.name,
        city: salon.city,
        area: salon.locality || '',
        rating: salon.rating || 4.0,
        reviewCount: salon.reviewCount || 0,
        distance: 2.5,
        tags: salon.specialties || ['Open Now'],
        address: `${salon.locality || 'Locality'}, ${salon.city}`,
        hours: '09:00 AM - 09:00 PM',
        images: salon.images && salon.images.length > 0 ? salon.images : ['https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
        services: (salon.services || []).map(s => ({
          name: s.service,
          duration: 60,
          price: s.price,
          category: salon.specialties && salon.specialties.length > 0 ? salon.specialties[0] : 'Hair'
        }))
      }));

      // Add Classic Cuts Lounge explicitly for AI Chatbot demo purposes
      formattedSalons.push({
        salonId: 'SAL-AI-001',
        name: 'Classic Cuts Lounge',
        city: 'Hyderabad',
        area: 'Banjara Hills',
        rating: 4.8,
        reviewCount: 320,
        distance: 1.5,
        tags: ["Men's Salon", "Premium", "Hair Styling"],
        address: 'Road No 12, Banjara Hills, Hyderabad',
        hours: '10:00 AM - 09:00 PM',
        images: ['https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
        services: [
          { name: 'Classic Fade', duration: 45, price: 800, category: 'Hair' },
          { name: 'Beard Grooming', duration: 30, price: 400, category: 'Beard' }
        ]
      });

      // Insert salons first to get their MongoDB ObjectIds
      const insertedSalons = await Salon.insertMany(formattedSalons);

      // Create owner accounts linked to the actual ObjectIds
      const seenEmails = new Set();
      const ownerUsers = insertedSalons.map((salon, index) => {
        let baseEmail = `${salon.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        let ownerEmail = `${baseEmail}@valoura.com`;
        
        // Handle duplicate names (e.g. multiple salons named "The Scissors Story")
        if (seenEmails.has(ownerEmail)) {
           ownerEmail = `${baseEmail}${index}@valoura.com`;
        }
        seenEmails.add(ownerEmail);

        return {
          name: `${salon.name} Admin`,
          email: ownerEmail,
          phone: `99999${String(index).padStart(5, '0')}`,
          city: salon.city,
          role: 'owner',
          passwordHash: 'password123',
          ownedSalonId: String(salon._id)
        };
      });

      await User.insertMany(ownerUsers);
      console.log(`Auto-seeded ${insertedSalons.length} salons and their admin accounts successfully!`);
    } else {
      console.log(`Database already contains ${salonCount} salons.`);
      
      // Migration step: ensure admins exist for all salons if they weren't created or were partially created
      const adminCount = await User.countDocuments({ role: 'owner' });
      const currentSalonCount = await Salon.countDocuments();
      if (adminCount < currentSalonCount) {
        console.log(`Found only ${adminCount} admins for ${currentSalonCount} salons. Regenerating admin accounts...`);
        // Clean up any partial inserts
        await User.deleteMany({ role: 'owner' });
        
        const existingSalons = await Salon.find({});
        
        const seenEmails = new Set();
        const ownerUsers = existingSalons.map((salon, index) => {
          let baseEmail = `${salon.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          let ownerEmail = `${baseEmail}@valoura.com`;
          
          if (seenEmails.has(ownerEmail)) {
             ownerEmail = `${baseEmail}${index}@valoura.com`;
          }
          seenEmails.add(ownerEmail);
          
          return {
            name: `${salon.name} Admin`,
            email: ownerEmail,
            phone: `99999${String(index).padStart(5, '0')}`,
            city: salon.city,
            role: 'owner',
            passwordHash: 'password123',
            ownedSalonId: String(salon._id)
          };
        });
        await User.insertMany(ownerUsers);
        console.log(`Successfully regenerated ${ownerUsers.length} admin accounts.`);
      }
    }
  } catch (err) {
    console.error('Auto-seed failed:', err);
  }
});

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/salons', salonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
