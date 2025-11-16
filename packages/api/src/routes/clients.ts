import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// Get client configuration (for white-label theming)
router.get('/:clientId/config', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        id,
        name,
        domain,
        theme_primary_color,
        theme_secondary_color
      FROM clients
      WHERE id = $1
      `,
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const client = result.rows[0];

    res.json({
      success: true,
      config: {
        id: client.id,
        name: client.name,
        theme: {
          primary_color: client.theme_primary_color,
          secondary_color: client.theme_secondary_color
        }
      }
    });

  } catch (error) {
    console.error('Get client config error:', error);
    res.status(500).json({ success: false, error: 'Failed to get client config' });
  }
});

export default router;