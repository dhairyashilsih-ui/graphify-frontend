import 'dotenv/config';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

const MONGO_URI = process.env.MONGO_URI || process.env.VITE_MONGODB_URI;
const API_URL = process.env.API_URL || 'https://graphify-backend-tm2e.onrender.com/api/conversations';

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI (or VITE_MONGODB_URI) in environment.');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('✅ Connected to MongoDB');

// Flexible collection accessor; adjust name if needed
const Memory = mongoose.model('Memory', new mongoose.Schema({}, { strict: false }), 'memories');

async function runAudit() {
  try {
    const memories = await Memory.find().limit(20);
    console.log('📦 Sample Memory Records:', memories);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: 'agri', input: 'Tomato price today' })
    });

    const data = await res.json();
    console.log('🤖 API Test Output:', data);
  } catch (err) {
    console.error('❌ Audit failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

await runAudit();
