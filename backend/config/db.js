import mongoose from 'mongoose';
import 'dotenv/config';

let mongoServer;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/buildathon');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('⚠️ Local MongoDB not found on port 27017. Auto-starting In-Memory MongoDB...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const fs = await import('fs');
        const path = await import('path');
        
        const dbPath = path.join(process.cwd(), '.mongo-data');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }

        // Start memory server specifically on port 27017 and persist data
        mongoServer = await MongoMemoryServer.create({
          instance: { port: 27017, dbName: 'buildathon', dbPath: dbPath }
        });
        const uri = mongoServer.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`✅ Persistent In-Memory MongoDB Connected: ${conn.connection.host} on port 27017`);
        return;
      } catch (memError) {
        console.error(`Failed to start In-Memory MongoDB: ${memError.message}`);
      }
    }
    
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
