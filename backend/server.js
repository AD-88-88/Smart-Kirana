require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products');
const salesRouter = require('./routes/sales');
const customersRouter = require('./routes/customers');
const staffRouter = require('./routes/staff');
const analyticsRouter = require('./routes/analytics');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'smartkirana-backend' }));

app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/staff', staffRouter);
app.use('/api/analytics', analyticsRouter);

// Fallback 404
app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

// Generic error handler (so an unhandled throw doesn't crash the server)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SmartKirana backend running on http://localhost:${PORT}`);
});
