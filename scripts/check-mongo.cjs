#!/usr/bin/env node
const { loadEnvConfig } = require('@next/env');
const { MongoClient } = require('mongodb');

async function main() {
  loadEnvConfig(process.cwd());
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local before running this script.');
  }
  const dbName = (process.env.MONGODB_DB || 'eutian').toLowerCase();
  const client = new MongoClient(uri);
  try {
    await client.db(dbName).command({ ping: 1 });
    console.log(`✅ Connected to MongoDB database "${dbName}" successfully.`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
