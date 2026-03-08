const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// POST a new transaction
router.post('/', async (req, res) => {
  const { type, amount, category, note, date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO transactions (type, amount, category, note, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [type, amount, category, note, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// DELETE a transaction
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;