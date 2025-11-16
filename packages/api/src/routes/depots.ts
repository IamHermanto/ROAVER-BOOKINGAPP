import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// Get all depots
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        d.*,
        o.name as operator_name
      FROM depots d
      JOIN operators o ON d.operator_id = o.id
      ORDER BY d.city, d.name
      `
    );

    res.json({
      success: true,
      count: result.rows.length,
      depots: result.rows
    });

  } catch (error) {
    console.error('Get depots error:', error);
    res.status(500).json({ success: false, error: 'Failed to get depots' });
  }
});

// Get depots by city
router.get('/city/:city', async (req: Request, res: Response) => {
  try {
    const { city } = req.params;

    const result = await pool.query(
      `
      SELECT 
        d.*,
        o.name as operator_name
      FROM depots d
      JOIN operators o ON d.operator_id = o.id
      WHERE LOWER(d.city) = LOWER($1)
      ORDER BY d.name
      `,
      [city]
    );

    res.json({
      success: true,
      count: result.rows.length,
      depots: result.rows
    });

  } catch (error) {
    console.error('Get depots by city error:', error);
    res.status(500).json({ success: false, error: 'Failed to get depots' });
  }
});

export default router;