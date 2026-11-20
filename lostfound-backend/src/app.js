const express = require('express');
const cors = require('cors');

const app = express();

// CORS: only allow the frontend origin(s) listed in CORS_ORIGIN
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check: used to verify the server (and later, the deployment) is alive
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    data: { status: 'ok' },
  });
});

// TODO (Checkpoint 2): app.use('/reports', reportRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Central error handler (4 arguments is required by Express)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
