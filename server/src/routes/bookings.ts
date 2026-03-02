import { Router } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  rescheduleBooking,
  cancelBooking,
  getBookingsByListingId,
  getBookingsByCustomerId,
} from '../controllers/booking';
import checkBearerToken from '../middlewares/check-bearer-token';
import checkRole from '../middlewares/check-roles';
import errorHandler from '../middlewares/error-handler';

const router = Router();

router.use(checkBearerToken);

// Get all bookings
router.get('/', getAllBookings);

// Get bookings by customer (authenticated user's own bookings)
router.get('/my-bookings', getBookingsByCustomerId);

// Get bookings by listing ID
router.get('/listing/:listingId', getBookingsByListingId);

// Get a single booking by ID
router.get('/:id', getBookingById);

// Create a new booking (user only)
router.post('/', checkRole('user'), createBooking);

// Update booking status (listing owner or admin)
router.patch('/:id/status', updateBookingStatus);

// Reschedule a booking (customer only)
router.patch('/:id/reschedule', rescheduleBooking);

// Cancel a booking (customer, listing owner, or admin)
router.patch('/:id/cancel', cancelBooking);

router.use(errorHandler);

export default router;
