// Simplified server for debugging
require('dotenv').config();
const express = require('express');

console.log('Starting simplified server...');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Express app created');

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', message: 'Simplified server is running' });
});

console.log('Health route added');

const server = app.listen(PORT, () => {
  console.log(`✅ Simplified server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

console.log('Server listening...');
