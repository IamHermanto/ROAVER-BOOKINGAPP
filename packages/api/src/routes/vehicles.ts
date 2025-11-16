import { Router, Request, Response } from 'express';
import pool from '../db';
import { SearchParams, SearchFilters, VehicleSearchResult } from '@shared/types';

const router = Router();

// Search vehicles with filters
router.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      pickup_location,
      dropoff_location,
      pickup_date,
      dropoff_date,
      number_of_people,
      transmission,
      min_sleeps,
      has_toilet,
      has_shower,
      vehicle_type,
      max_price
    } = req.query;

    // Calculate number of days
    const start = new Date(pickup_date as string);
    const end = new Date(dropoff_date as string);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Build dynamic query
    let query = `
      SELECT 
        v.*,
        o.name as operator_name,
        o.code as operator_code,
        v.price_per_day * $1 as total_price,
        $1 as days
      FROM vehicles v
      JOIN operators o ON v.operator_id = o.id
      WHERE 1=1
    `;

    const params: any[] = [days];
    let paramIndex = 2;

    if (transmission) {
      query += ` AND v.transmission = $${paramIndex}`;
      params.push(transmission);
      paramIndex++;
    }

    if (min_sleeps) {
      query += ` AND v.sleeps >= $${paramIndex}`;
      params.push(parseInt(min_sleeps as string));
      paramIndex++;
    }

    if (has_toilet === 'true') {
      query += ` AND v.has_toilet = true`;
    }

    if (has_shower === 'true') {
      query += ` AND v.has_shower = true`;
    }

    if (vehicle_type) {
      query += ` AND v.type = $${paramIndex}`;
      params.push(vehicle_type);
      paramIndex++;
    }

    if (max_price) {
      query += ` AND v.price_per_day <= $${paramIndex}`;
      params.push(parseFloat(max_price as string));
      paramIndex++;
    }

    query += ' ORDER BY v.price_per_day ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      vehicles: result.rows
    });

  } catch (error) {
    console.error('Vehicle search error:', error);
    res.status(500).json({ success: false, error: 'Failed to search vehicles' });
  }
});

// Get single vehicle by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        v.*,
        o.name as operator_name,
        o.code as operator_code
      FROM vehicles v
      JOIN operators o ON v.operator_id = o.id
      WHERE v.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({
      success: true,
      vehicle: result.rows[0]
    });

  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ success: false, error: 'Failed to get vehicle' });
  }
});

export default router;