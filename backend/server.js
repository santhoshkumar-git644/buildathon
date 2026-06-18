import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const port = 5000;
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'buildathon';

app.use(cors());
app.use(express.json());

let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    db = client.db(dbName);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

connectToMongo();

app.get('/api/salons', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not established yet.' });
    }
    const collection = db.collection('dataset');
    const rawSalons = await collection.find({}).toArray();
    
    // Transform to match frontend Salon interface
    const salons = rawSalons.map((salon, index) => ({
      id: salon.salonId || String(salon._id) || index + 1,
      name: salon.name,
      city: salon.city,
      area: salon.locality || '',
      rating: salon.rating || 4.0,
      reviewCount: salon.reviewCount || 0,
      distance: 2.5, // Static distance for UI
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
        rating: 5,
        date: '2026-06-01',
        comment: typeof r === 'string' ? r : r.comment || 'Great service!',
        author: `Customer ${i + 1}`
      }))
    }));

    res.json(salons);
  } catch (err) {
    console.error('Error fetching salons:', err);
    res.status(500).json({ error: 'Failed to fetch salons.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
