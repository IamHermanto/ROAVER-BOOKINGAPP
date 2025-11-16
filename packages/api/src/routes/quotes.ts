import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// Track search as a quote
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      client_id,
      pickup_location,
      dropoff_location,
      pickup_date,
      dropoff_date,
      number_of_people
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO quotes (
        client_id,
        pickup_location,
        dropoff_location,
        pickup_date,
        dropoff_date,
        number_of_people
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        client_id,
        pickup_location || 'Not specified',
        dropoff_location || 'Not specified',
        pickup_date,
        dropoff_date,
        number_of_people ? parseInt(number_of_people) : null
      ]
    );

    res.status(201).json({
      success: true,
      quote: result.rows[0]
    });

  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({ success: false, error: 'Failed to track quote' });
  }
});

// Get all quotes (optional - useful for analytics)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        q.*,
        c.name as client_name
      FROM quotes q
      JOIN clients c ON q.client_id = c.id
      ORDER BY q.created_at DESC
      LIMIT 100
      `
    );

    res.json({
      success: true,
      count: result.rows.length,
      quotes: result.rows
    });

  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ success: false, error: 'Failed to get quotes' });
  }
});

// Get quotes by client (optional - useful for per-client analytics)
router.get('/client/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM quotes
      WHERE client_id = $1
      ORDER BY created_at DESC
      `,
      [clientId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      quotes: result.rows
    });

  } catch (error) {
    console.error('Get client quotes error:', error);
    res.status(500).json({ success: false, error: 'Failed to get client quotes' });
  }
});

export default router;