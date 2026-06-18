import { MongoClient } from 'mongodb';
import fs from 'fs/promises';

// Connection URL
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'buildathon';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB server');

    const db = client.db(dbName);
    const collection = db.collection('dataset');

    // Read dataset.json
    console.log('Reading dataset.json...');
    const data = await fs.readFile('./dataset.json', 'utf-8');
    const documents = JSON.parse(data);

    // Clear existing data (optional, but good for repeatable seeds)
    await collection.deleteMany({});
    console.log('Cleared existing data from collection');

    // Insert new data
    const insertResult = await collection.insertMany(documents);
    console.log(`Successfully inserted ${insertResult.insertedCount} documents`);

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

main();