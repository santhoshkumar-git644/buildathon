import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shearcity').then(async () => {
  const db = mongoose.connection.db;
  const salons = await db.collection('salons').find({}).toArray();
  
  const seen = new Set();
  const duplicateIds = [];
  
  for (const s of salons) {
    if (seen.has(s.name)) {
      duplicateIds.push(s._id);
    } else {
      seen.add(s.name);
    }
  }
  
  console.log(`Found ${duplicateIds.length} duplicates.`);
  
  if (duplicateIds.length > 0) {
    await db.collection('salons').deleteMany({ _id: { $in: duplicateIds } });
    console.log('Duplicates removed.');
  }
  
  process.exit();
}).catch(console.error);
