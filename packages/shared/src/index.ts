// Export all types
export * from './types';

// Shared constants
export const VEHICLE_TYPES = ['campervan', 'motorhome'] as const;
export const TRANSMISSION_TYPES = ['automatic', 'manual'] as const;
export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;