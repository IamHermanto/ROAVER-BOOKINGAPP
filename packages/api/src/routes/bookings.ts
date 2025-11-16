import { Router, Request, Response } from 'express';
import pool from '../db';
import { BookingRequest } from '@shared/types';

const router = Router();

// Create a new booking
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      client_id,
      vehicle_id,
      pickup_depot_id,
      dropoff_depot_id,
      pickup_date,
      dropoff_date,
      guest_name,
      guest_email,
      guest_phone,
      number_of_people
    }: BookingRequest = req.body;

    // Calculate total price
    const vehicleResult = await pool.query(
      'SELECT price_per_day FROM vehicles WHERE id = $1',
      [vehicle_id]
    );

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    const pricePerDay = vehicleResult.rows[0].price_per_day;
    const start = new Date(pickup_date);
    const end = new Date(dropoff_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = pricePerDay * days;

    // Get operator_id from vehicle
    const operatorResult = await pool.query(
      'SELECT operator_id FROM vehicles WHERE id = $1',
      [vehicle_id]
    );
    const operatorId = operatorResult.rows[0].operator_id;

    // Create booking
    const result = await pool.query(
      `
      INSERT INTO bookings (
        client_id,
        vehicle_id,
        operator_id,
        pickup_depot_id,
        dropoff_depot_id,
        pickup_date,
        dropoff_date,
        guest_name,
        guest_email,
        guest_phone,
        number_of_people,
        total_price,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
      `,
      [
        client_id,
        vehicle_id,
        operatorId,
        pickup_depot_id,
        dropoff_depot_id,
        pickup_date,
        dropoff_date,
        guest_name,
        guest_email,
        guest_phone || null,
        number_of_people,
        totalPrice,
        'pending'
      ]
    );

    res.status(201).json({
      success: true,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
});

// Get booking by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        b.*,
        v.name as vehicle_name,
        o.name as operator_name,
        pd.name as pickup_depot_name,
        dd.name as dropoff_depot_name
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN operators o ON b.operator_id = o.id
      JOIN depots pd ON b.pickup_depot_id = pd.id
      JOIN depots dd ON b.dropoff_depot_id = dd.id
      WHERE b.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({
      success: true,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to get booking' });
  }
});

export default router;