import mongoose from 'mongoose';
import fs from 'fs/promises';
import { connectDB } from './config/db.js';
import Salon from './models/Salon.js';

async function importData() {
  try {
    await connectDB();
    console.log('Reading data/salons.json...');
    const data = await fs.readFile('./data/salons.json', 'utf-8');
    const documents = JSON.parse(data);

    // Transform raw JSON data into schema format
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
      images: ['Front Lounge', 'Color Bar', 'Bridal Room'],
      services: (salon.services || []).map(s => ({
        name: s.service,
        duration: 60,
        price: s.price,
        category: salon.specialties && salon.specialties.length > 0 ? salon.specialties[0] : 'Hair'
      })),
      staff: [
        { name: 'Stylist 1', specialty: 'General' },
        { name: 'Stylist 2', specialty: 'Coloring' }
      ],
      reviews: (salon.reviews || []).map((r, i) => ({
        author: `Customer ${i + 1}`,
        rating: 5,
        comment: typeof r === 'string' ? r : r.comment || 'Great service!',
        date: new Date()
      }))
    }));

    await Salon.deleteMany();
    console.log('Cleared existing salons from collection');

    const insertResult = await Salon.insertMany(formattedSalons);
    console.log(`Successfully inserted ${insertResult.length} salons`);

    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

importData();