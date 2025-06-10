// Simple test server to isolate issues
console.log('Starting test server...');

const express = require('express');
const app = express();
const PORT = 5001;

app.get('/', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

console.log('Test server setup complete');
