import { RequestHandler } from 'express';
import Booking from '../models/Bookings';
import Listing from '../models/Listings';

// Create a new booking
export const createBooking: RequestHandler = async (req, res, next) => {
  try {
    const { listingId, scheduledDate } = req.body;

    if (!listingId) {
      return next({ statusCode: 400, message: 'listingId is required' });
    }

    if (!scheduledDate) {
      return next({ statusCode: 400, message: 'scheduledDate is required' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }

    const booking = new Booking({
      listingId,
      customerId: req.auth?.uid,
      status: BookingStatusEnum.REQUESTED,
      scheduledDate: new Date(scheduledDate),
      originalDate: new Date(scheduledDate),
      finalPrice: listing.price,
    });

    const savedBooking = await booking.save();

    await Listing.findByIdAndUpdate(listingId, {
      $push: { bookingIds: savedBooking._id },
    });

    res.status(201).json({ message: 'Booking created', data: savedBooking });
  } catch (error) {
    next(error);
  }
};
// Update a booking by ID

// Get all bookings
export const getAllBookings: RequestHandler = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json({ message: 'Bookings fetched', data: bookings });
  } catch (error) {
    next(error);
  }
};

// Get a single booking by ID
export const getBookingById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.status(200).json({ message: 'Booking fetched', data: booking });
  } catch (error) {
    next(error);
  }
};

// Update booking status (by listing owner or admin)
export const updateBookingStatus: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next({ statusCode: 400, message: 'Status is required' });
    }

    const booking = await Booking.findById(id).populate('listingId');
    if (!booking) {
      return next({ statusCode: 404, message: 'Booking not found' });
    }

    const listing = await Listing.findById(booking.listingId);
    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }

    const isListingOwner = listing.userId.toString() === req.auth?._id.toString();
    const isAdmin = req.auth?.role === 'admin';

    if (!isListingOwner && !isAdmin) {
      return next({
        statusCode: 403,
        message: 'Only the listing owner or admin can update booking status',
      });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    res.status(200).json({ message: 'Booking status updated', data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

// Reschedule a booking (by the customer who created it)
export const rescheduleBooking: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;

    if (!scheduledDate) {
      return next({ statusCode: 400, message: 'scheduledDate is required' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return next({ statusCode: 404, message: 'Booking not found' });
    }

    if (
      booking.customerId.toString() !== req.auth?._id.toString() &&
      !(req?.auth?.role === 'admin')
    ) {
      return next({ statusCode: 403, message: 'Only the customer can reschedule this booking' });
    }

    if (
      booking.status === BookingStatusEnum.CANCELLED ||
      booking.status === BookingStatusEnum.COMPLETED
    ) {
      return next({
        statusCode: 400,
        message: `Cannot reschedule a ${booking.status.toLowerCase()} booking`,
      });
    }
    if (booking?.rescheduleCount && booking.rescheduleCount > 0) {
      return next({
        statusCode: 400,
        message: `Cannot reschedule a booking more than once`,
      });
    }
    const newDate = new Date(scheduledDate);
    if (newDate <= new Date()) {
      return next({ statusCode: 400, message: 'scheduledDate must be a future date' });
    }

    booking.scheduledDate = newDate;
    booking.status = BookingStatusEnum.RESCHEDULED;
    booking.rescheduleCount = 1;
    const updatedBooking = await booking.save();

    res.status(200).json({ message: 'Booking rescheduled', data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

// Cancel a booking (by the customer or listing owner or admin)
export const cancelBooking: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return next({ statusCode: 404, message: 'Booking not found' });
    }

    if (booking.status === BookingStatusEnum.CANCELLED) {
      return next({ statusCode: 400, message: 'Booking is already cancelled' });
    }

    if (booking.status === BookingStatusEnum.COMPLETED) {
      return next({ statusCode: 400, message: 'Cannot cancel a completed booking' });
    }

    const listing = await Listing.findById(booking.listingId);
    const isCustomer = booking.customerId.toString() === req.auth?._id.toString();
    const isListingOwner = listing?.userId.toString() === req.auth?._id.toString();
    const isAdmin = req.auth?.role === 'admin';

    if (!isCustomer && !isListingOwner && !isAdmin) {
      return next({ statusCode: 403, message: 'Unauthorized to cancel this booking' });
    }

    booking.status = BookingStatusEnum.CANCELLED;
    const updatedBooking = await booking.save();

    res.status(200).json({ message: 'Booking cancelled', data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

// Get all bookings by listing ID
export const getBookingsByListingId: RequestHandler = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }

    const bookings = await Booking.find({ listingId });
    res.status(200).json({ message: 'Bookings fetched', data: bookings });
  } catch (error) {
    next(error);
  }
};

// Get all bookings by customer ID
export const getBookingsByCustomerId: RequestHandler = async (req, res, next) => {
  try {
    const customerId = req.auth?._id;

    if (!customerId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const bookings = await Booking.find({ customerId });
    res.status(200).json({ message: 'Bookings fetched', data: bookings });
  } catch (error) {
    next(error);
  }
};

export const approveReschedule: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return next({ statusCode: 404, message: 'Booking not found' });
    }

    if (booking.status !== BookingStatusEnum.RESCHEDULED) {
      return next({ statusCode: 400, message: 'Booking is not in rescheduled state' });
    }

    const listing = await Listing.findById(booking.listingId);
    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }

    const isListingOwner = listing.userId.toString() === req.auth?._id.toString();
    const isAdmin = req.auth?.role === 'admin';

    if (!isListingOwner && !isAdmin) {
      return next({
        statusCode: 403,
        message: 'Only the listing owner or admin can approve a reschedule',
      });
    }

    booking.status = BookingStatusEnum.RESCHEDULEDANDAPPROVED;
    const updatedBooking = await booking.save();

    res.status(200).json({ message: 'Reschedule approved', data: updatedBooking });
  } catch (error) {
    next(error);
  }
};
