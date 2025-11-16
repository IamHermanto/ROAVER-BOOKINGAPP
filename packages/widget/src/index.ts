export { BookingWidget } from './BookingWidget';

// Make it available globally for browser usage
if (typeof window !== 'undefined') {
  (window as any).BookingWidget = require('./BookingWidget').BookingWidget;
}