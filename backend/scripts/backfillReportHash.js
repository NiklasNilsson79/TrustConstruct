const mongoose = require('mongoose');
require('dotenv').config();

console.log('[debug] cwd:', process.cwd());
console.log('[debug] MONGODB_URI:', process.env.MONGODB_URI);
console.log('[debug] MONGO_URI:', process.env.MONGO_URI);

const Report = require('../src/models/Report');

(async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const missing = await Report.find({
    $or: [
      { reportHash: { $exists: false } },
      { reportHash: null },
      { reportHash: '' },
    ],
  });

  console.log(`[backfill] found ${missing.length} reports missing reportHash`);

  for (const r of missing) {
    // triggar pre('validate') som nu genererar reportHash
    await r.save();
  }

  console.log('[backfill] done');
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
