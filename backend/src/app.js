const express = require('express');
const authRoutes = require('./routes/authRoutes');
const reportsRoutes = require('./routes/reportRoutes');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

// NEW: Reports API
app.use('/api/reports', reportsRoutes);

module.exports = app;
