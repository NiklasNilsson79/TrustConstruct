require('dotenv').config();

const app = require('./src/app');
const { connectMongo } = require('./src/db/mongo');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start', err);
  process.exit(1);
});
