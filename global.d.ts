import { MongoClient } from 'mongodb';

interface GlobalMongoClient {
  conn: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

declare global {
  var _mongoClientPromise: GlobalMongoClient | undefined;
}