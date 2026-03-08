const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all holdings
router.get('/holdings', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM holdings ORDER BY date_bought DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get holdings' });
  }
});

// GET all stock events
router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM stock_events ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get stock events' });
  }
});

// POST a stock event (buy, sell, dividend)
router.post('/events', async (req, res) => {
  const { type, ticker, name, shares, price_per_share, amount, currency, date, note } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert the event
    const eventResult = await client.query(
      'INSERT INTO stock_events (type, ticker, name, shares, price_per_share, amount, currency, date, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [type, ticker, name, shares, price_per_share, amount, currency, date, note]
    );

    if (type === 'buy') {
      // Check if holding already exists
      const existing = await client.query(
        'SELECT * FROM holdings WHERE ticker = $1',
        [ticker]
      );

      if (existing.rows.length > 0) {
        // Update avg buy price and shares
        const old = existing.rows[0];
        const newShares = parseFloat(old.shares) + parseFloat(shares);
        const newAvg = ((parseFloat(old.shares) * parseFloat(old.avg_buy_price)) + (parseFloat(shares) * parseFloat(price_per_share))) / newShares;

        await client.query(
          'UPDATE holdings SET shares = $1, avg_buy_price = $2 WHERE ticker = $3',
          [newShares, newAvg, ticker]
        );
      } else {
        // Create new holding
        await client.query(
          'INSERT INTO holdings (ticker, name, shares, avg_buy_price, currency, date_bought) VALUES ($1, $2, $3, $4, $5, $6)',
          [ticker, name, shares, price_per_share, currency, date]
        );
      }
    }

    if (type === 'sell') {
      const existing = await client.query(
        'SELECT * FROM holdings WHERE ticker = $1',
        [ticker]
      );

      if (existing.rows.length > 0) {
        const newShares = parseFloat(existing.rows[0].shares) - parseFloat(shares);

        if (newShares <= 0) {
          // Fully sold — remove from holdings
          await client.query('DELETE FROM holdings WHERE ticker = $1', [ticker]);
        } else {
          // Partially sold — update shares
          await client.query(
            'UPDATE holdings SET shares = $1 WHERE ticker = $2',
            [newShares, ticker]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json(eventResult.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to log stock event' });
  } finally {
    client.release();
  }
});

module.exports = router;