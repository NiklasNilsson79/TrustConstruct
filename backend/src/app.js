const express = require('express');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const chainRoutes = require('./routes/chainRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chain', chainRoutes);

// Health check (valfritt men bra)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
