import { RequestHandler } from 'express';
import Booking from '../models/Bookings';
import Listing from '../models/Listings';
import { BookingStatusEnum, UserRoleEnum } from '../utils/enums';
import { uploadMultipleToCloudinary } from '../utils/cloudinary';

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

    const isListingOwner = listing.userId.toString() === req.auth?.uid.toString();
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
      booking.customerId.toString() !== req.auth?.uid.toString() &&
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
    const isCustomer = booking.customerId.toString() === req.auth?.uid.toString();
    const isListingOwner = listing?.userId.toString() === req.auth?.uid.toString();
    const isAdmin = req.auth?.role === 'admin';

    if (!isCustomer && !isListingOwner && !isAdmin) {
      return next({ statusCode: 403, message: 'Unauthorized to cancel this booking' });
    }
    booking.cancelledBy = req.auth?.uid;
    booking.cancelledAt = new Date();
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
    const customerId = req.auth?.uid;
    if (!customerId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ customerId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Booking.countDocuments({ customerId }),
    ]);

    res.status(200).json({
      message: 'Bookings fetched',
      count: bookings.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: bookings,
    });
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

    const isListingOwner = listing.userId.toString() === req.auth?.uid.toString();
    const isAdmin = req.auth?.role === 'ADMIN';

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

export const approveBooking: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return next({ statusCode: 404, message: 'Booking not found' });

    const listing = await Listing.findById(booking.listingId);
    const isOwner = listing?.userId.toString() === req.auth?.uid.toString();
    const isAdmin = req.auth?.role === UserRoleEnum.ADMIN;
    if (!isOwner && !isAdmin) {
      return next({ statusCode: 403, message: 'Unauthorized' });
    }

    booking.status = BookingStatusEnum.CONFIRMED;
    const updated = await booking.save();
    res.status(200).json({ message: 'Booking approved', data: updated });
  } catch (error) {
    next(error);
  }
};

export const uploadBookingPhotos: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return next({ statusCode: 404, message: 'Booking not found' });

    const listing = await Listing.findById(booking.listingId);
    const isBookingUser = booking.customerId.toString() === req.auth?.uid.toString();
    if (!isBookingUser) {
      return next({ statusCode: 403, message: 'Unauthorized' });
    }

    // Expecting files in req.files.beforePhotos and req.files.afterPhotos
    const beforeFiles =
      uploadMultipleToCloudinary(req.files?.beforePhotos as Express.Multer.File[]) || [];
    const afterFiles =
      uploadMultipleToCloudinary(req.files?.afterPhotos as Express.Multer.File[]) || [];

    if (beforeFiles.length > 0) {
      // Save the path or filename as per your schema
      booking.beforePhotos = beforeFiles;
    }
    if (afterFiles.length > 0) {
      booking.afterPhotos = afterFiles;
    }
    await booking.save();

    res.status(200).json({ message: 'Photos uploaded', data: booking });
  } catch (error) {
    next(error);
  }
};
export const getBookingsByServiceProviderId: RequestHandler = async (req, res, next) => {
  try {
    const serviceProviderId = req.auth?.uid;
    if (!serviceProviderId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    // Find all listings owned by this service provider
    const listings = await Listing.find({ userId: serviceProviderId }).select('_id');
    const listingIds = listings.map((l) => l._id);

    const [bookings, total] = await Promise.all([
      Booking.find({ listingId: { $in: listingIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('listingId')
        .populate('customerId'),
      Booking.countDocuments({ listingId: { $in: listingIds } }),
    ]);

    res.status(200).json({
      message: 'Bookings fetched',
      count: bookings.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
