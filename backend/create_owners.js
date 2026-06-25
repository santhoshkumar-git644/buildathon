import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Salon from './models/Salon.js';
import User from './models/User.js';

async function createOwnersForExistingSalons() {
  try {
    await connectDB();
    const salons = await Salon.find();
    let createdCount = 0;

    for (const salon of salons) {
      // Create an email based on salon name or ID
      const baseEmail = salon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `${baseEmail}@example.com`;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      
      if (!existingUser) {
        const newOwner = new User({
          name: `${salon.name} Owner`,
          email: email,
          phone: '0000000000',
          city: salon.city,
          passwordHash: 'password123', // Default password
          role: 'owner'
        });
        
        await newOwner.save();
        createdCount++;
        console.log(`Created owner: ${email} for salon: ${salon.name}`);
      } else {
         console.log(`Owner already exists for: ${email}`);
      }
    }

    console.log(`Successfully created ${createdCount} owners for existing salons.`);
    process.exit();
  } catch (err) {
    console.error('Error creating owners:', err);
    process.exit(1);
  }
}

createOwnersForExistingSalons();
