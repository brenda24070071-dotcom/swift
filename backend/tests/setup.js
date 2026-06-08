// backend/tests/setup.js
// Carrega .env antes de qualquer teste
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Garante DATABASE_URL para SQLite de teste
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./test.db';
}
