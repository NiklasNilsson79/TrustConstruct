const mongoose = require('mongoose');

async function connectMongo() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('Missing MONGO_URI in environment variables');
  }

  await mongoose.connect(uri);

  console.log('[db] MongoDB connected');
}

module.exports = { connectMongo };
