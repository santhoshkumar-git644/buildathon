import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/buildathon').then(async () => {
  const db = mongoose.connection.db;
  const count = await db.collection('salons').countDocuments();
  console.log('Total Salons:', count);
  process.exit();
}).catch(console.error);
