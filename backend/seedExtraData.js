import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Booking from './models/Booking.js';
import Salon from './models/Salon.js';

async function seedExtraData() {
  try {
    await connectDB();
    console.log('Clearing old users and bookings...');
    await User.deleteMany({});
    await Booking.deleteMany({});

    // 1. Create a dummy user
    const dummyUser = new User({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '1234567890',
      city: 'Mumbai',
      passwordHash: 'dummyhash',
      preferences: {
        budget: 1500,
        preferredStyles: ['Layered Cut', 'Balayage'],
        favoriteCategories: ['Hair', 'Spa']
      }
    });
    await dummyUser.save();
    console.log(`Created user: ${dummyUser.email} with ID: ${dummyUser._id}`);

    // 2. Fetch some existing salons
    const salons = await Salon.find().limit(3);
    if (salons.length === 0) {
      throw new Error('No salons found. Run "npm run seed" first.');
    }

    // 3. Create a past booking (4 weeks ago) to trigger rebooking suggestions
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const pastBooking = new Booking({
      userId: dummyUser._id,
      salonId: salons[0]._id,
      salonName: salons[0].name,
      services: [salons[0].services[0]?.name || 'Haircut'],
      date: fourWeeksAgo.toISOString().split('T')[0],
      slot: '10:00 AM',
      status: 'past',
      totalCost: salons[0].services[0]?.price || 500
    });
    await pastBooking.save();

    // 4. Create an upcoming booking
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 3);

    const upcomingBooking = new Booking({
      userId: dummyUser._id,
      salonId: salons[1]._id,
      salonName: salons[1].name,
      services: [salons[1].services[0]?.name || 'Facial'],
      date: upcomingDate.toISOString().split('T')[0],
      slot: '04:00 PM',
      status: 'upcoming',
      totalCost: salons[1].services[0]?.price || 1200
    });
    await upcomingBooking.save();

    console.log('Successfully seeded users and bookings!');
    process.exit();
  } catch (err) {
    console.error('Error seeding extra data:', err);
    process.exit(1);
  }
}

seedExtraData();
