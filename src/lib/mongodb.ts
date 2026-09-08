import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export const DB_NAME = (process.env.MONGODB_DB || 'eutian').toLowerCase();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not set. Add it to .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const mongoOptions = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
};

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, mongoOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, mongoOptions);
  clientPromise = client.connect();
}

export default clientPromise;