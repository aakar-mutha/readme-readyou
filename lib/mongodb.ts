import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (!global._mongoClientPromise) {
  global._mongoClientPromise = { conn: null, promise: null };
}

if (!global._mongoClientPromise.promise) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise.promise = client.connect();
}

const clientPromise = global._mongoClientPromise.promise!;

export default clientPromise;