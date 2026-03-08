const pool = require('./db');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Oink oink 🐷' });
});

app.listen(PORT, () => {
  console.log(`OINK server running on port ${PORT}`);
});

const transactionsRouter = require('./routes/transactions');
app.use('/transactions', transactionsRouter);

const stocksRouter = require('./routes/stocks');
app.use('/stocks', stocksRouter);