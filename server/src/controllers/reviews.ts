import { RequestHandler } from 'express';
import Review from '../models/Review';
import Booking from '../models/Bookings';
import Listing from '../models/Listings';
import { BookingStatusEnum } from '../utils/enums';
// Create a new review
export const createReview: RequestHandler = async (req, res, next) => {
  try {
    const { bookingId, description, star } = req.body;
    const userId = req.auth?._id;

    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    if (!bookingId) {
      return next({ statusCode: 400, message: 'bookingId is required' });
    }

    if (!description) {
      return next({ statusCode: 400, message: 'description is required' });
    }

    if (star == null) {
      return next({ statusCode: 400, message: 'star is required' });
    }

    if (star < 1 || star > 5) {
      return next({ statusCode: 400, message: 'star must be between 1 and 5' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next({ statusCode: 404, message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== userId.toString()) {
      return next({ statusCode: 403, message: 'You can only review your own bookings' });
    }

    if (booking.status !== BookingStatusEnum.COMPLETED) {
      return next({ statusCode: 400, message: 'You can only review a completed booking' });
    }

    const existingReview = await Review.findOne({ bookingId, userId });
    if (existingReview) {
      return next({ statusCode: 400, message: 'You have already reviewed this booking' });
    }

    const review = new Review({
      bookingId,
      listingId: booking.listingId,
      userId,
      description,
      star,
    });

    const savedReview = await review.save();

    // Update reviewId in booking
    booking.reviewId = savedReview._id;
    await booking.save();

    // Push reviewId into listing.reviewIds and recalculate average rating
    const listing = await Listing.findById(booking.listingId);
    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }

    if (!listing.reviewIds) {
      listing.reviewIds = [];
    }

    listing.reviewIds.push(savedReview?._id);

    // Calculate new average rating
    const totalReviews = listing.reviewIds.length;
    const currentRating = listing.ratings || 0;
    const previousTotal = currentRating * (totalReviews - 1);
    listing.ratings = parseFloat(((previousTotal + star) / totalReviews).toFixed(2));

    await listing.save();

    res.status(201).json({ message: 'Review created', data: savedReview });
  } catch (error) {
    next(error);
  }
};

// Update a review by ID
export const updateReview: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, stars } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return next({ statusCode: 404, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.auth?._id.toString()) {
      return next({ statusCode: 403, message: 'You can only update your own reviews' });
    }

    if (stars != null && (stars < 1 || stars > 5)) {
      return next({ statusCode: 400, message: 'stars must be between 1 and 5' });
    }

    if (description) review.description = description;
    if (stars != null) review.stars = stars;

    const updatedReview = await review.save();

    res.status(200).json({ message: 'Review updated', data: updatedReview });
  } catch (error) {
    next(error);
  }
};

// Get all reviews
export const getAllReviews: RequestHandler = async (req, res, next) => {
  try {
    const reviews = await Review.find();
    res.status(200).json({ message: 'Reviews fetched', data: reviews });
  } catch (error) {
    next(error);
  }
};

// Get a single review by ID
export const getReviewById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    res.status(200).json({ message: 'Review fetched', data: review });
  } catch (error) {
    next(error);
  }
};

// Delete a review by ID
export const deleteReview: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return next({ statusCode: 404, message: 'Review not found' });
    }

    const isOwner = review.userId.toString() === req.auth?._id.toString();
    const isAdmin = req.auth?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next({
        statusCode: 403,
        message: 'Only the review owner or admin can delete this review',
      });
    }

    // Remove reviewId from listing.reviewIds and recalculate average rating
    const listing = await Listing.findById(review.listingId);
    if (listing) {
      listing.reviewIds = (listing.reviewIds || []).filter(
        (reviewId) => reviewId.toString() !== id
      );

      if (listing.reviewIds.length > 0) {
        const totalReviews = listing.reviewIds.length;
        const currentRating = listing.ratings || 0;
        const previousTotal = currentRating * (totalReviews + 1);
        listing.ratings = parseFloat(((previousTotal - review.stars) / totalReviews).toFixed(2));
      } else {
        listing.ratings = 0;
      }

      await listing.save();
    }

    // Remove reviewId from booking
    const booking = await Booking.findById(review.bookingId);
    if (booking) {
      booking.reviewId = undefined;
      await booking.save();
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({ message: 'Review deleted', data: review });
  } catch (error) {
    next(error);
  }
};
