import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import Review from '../models/Review';
import Booking from '../models/Bookings';
import Listing from '../models/Listings';
import { BookingStatusEnum } from '../utils/enums';
import { deleteOnCloudinary, uploadMultipleToCloudinary } from '../utils/cloudinary';
// Create a new review
export const createReview: RequestHandler = async (req, res, next) => {
  try {
    const { bookingId, description, stars } = req.body;
    const userId = req.auth?.uid;

    if (!userId) {
      return next({ statusCode: 401, message: 'Unauthorized' });
    }

    if (!bookingId) {
      return next({ statusCode: 400, message: 'bookingId is required' });
    }

    if (!description) {
      return next({ statusCode: 400, message: 'description is required' });
    }

    if (stars == null) {
      return next({ statusCode: 400, message: 'stars is required' });
    }

    if (stars < 1 || stars > 5) {
      return next({ statusCode: 400, message: 'stars must be between 1 and 5' });
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
      stars: stars,
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

    (listing.reviewIds as Types.ObjectId[]).push(savedReview._id);

    // Calculate new average rating
    const totalReviews = listing.reviewIds.length;
    const currentRating = listing.ratings || 0;
    const previousTotal = currentRating * (totalReviews - 1);
    listing.ratings = parseFloat(((previousTotal + stars) / totalReviews).toFixed(2));

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

    if (review.userId.toString() !== req.auth?.uid.toString()) {
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

    const isOwner = review.userId.toString() === req.auth?.uid.toString();
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
      listing.reviewIds = ((listing.reviewIds || []) as Types.ObjectId[]).filter(
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

// Get all reviews by listing ID
export const getReviewsByListingId: RequestHandler = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }

    const reviews = await Review.find({ listingId }).sort({ createdAt: -1 }).populate('userId');

    res.status(200).json({
      message: 'Reviews fetched',
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
const getPublicIdFromUrl = (url: string): string => {
  // e.g. https://res.cloudinary.com/xxx/image/upload/v123/abc123.jpg → abc123
  const parts = url.split('/');
  const fileWithExt = parts[parts.length - 1];
  const publicId = fileWithExt.split('.')[0];
  return publicId;
};

// Upload / Update before photos (max 2)
export const uploadBeforePhotos: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next({ statusCode: 400, message: 'At least one photo is required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return next({ statusCode: 404, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.auth?.uid?.toString()) {
      return next({ statusCode: 403, message: 'You can only update your own reviews' });
    }

    const existingCount = review.beforePhotos?.length || 0;

    if (existingCount + files.length > 2) {
      return next({
        statusCode: 400,
        message: `Max 2 before photos allowed. You already have ${existingCount}.`,
      });
    }

    const uploaded = await uploadMultipleToCloudinary(files);

    const newPhotos = uploaded.map((photo, index) => ({
      url: photo.url,
      isPrimary: existingCount === 0 && index === 0,
      uploadedAt: photo.uploadedAt,
    }));

    review.beforePhotos = [...(review.beforePhotos || []), ...newPhotos];
    const updatedReview = await review.save();

    res.status(200).json({ message: 'Before photos uploaded', data: updatedReview });
  } catch (error) {
    next(error);
  }
};

// Upload / Update after photos (max 2)
export const uploadAfterPhotos: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next({ statusCode: 400, message: 'At least one photo is required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return next({ statusCode: 404, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.auth?.uid?.toString()) {
      return next({ statusCode: 403, message: 'You can only update your own reviews' });
    }

    const existingCount = review.afterPhotos?.length || 0;

    if (existingCount + files.length > 2) {
      return next({
        statusCode: 400,
        message: `Max 2 after photos allowed. You already have ${existingCount}.`,
      });
    }

    const uploaded = await uploadMultipleToCloudinary(files);

    const newPhotos = uploaded.map((photo, index) => ({
      url: photo.url,
      isPrimary: existingCount === 0 && index === 0,
      uploadedAt: photo.uploadedAt,
    }));

    review.afterPhotos = [...(review.afterPhotos || []), ...newPhotos];
    const updatedReview = await review.save();

    res.status(200).json({ message: 'After photos uploaded', data: updatedReview });
  } catch (error) {
    next(error);
  }
};

// Replace a specific before photo by index (delete old from Cloudinary, upload new)
export const replaceBeforePhoto: RequestHandler = async (req, res, next) => {
  try {
    const { id, photoIndex } = req.params;
    const files = req.files as Express.Multer.File[];
    const index = parseInt(photoIndex);

    if (!files || files.length === 0) {
      return next({ statusCode: 400, message: 'A photo is required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return next({ statusCode: 404, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.auth?.uid?.toString()) {
      return next({ statusCode: 403, message: 'You can only update your own reviews' });
    }

    if (!review.beforePhotos || index < 0 || index >= review.beforePhotos.length) {
      return next({ statusCode: 400, message: 'Invalid photo index' });
    }

    // Delete old photo from Cloudinary
    const oldPhoto = review.beforePhotos[index];
    const publicId = getPublicIdFromUrl(oldPhoto.url);
    await deleteOnCloudinary(publicId);

    // Upload new photo
    const uploaded = await uploadMultipleToCloudinary(files);

    review.beforePhotos[index] = {
      url: uploaded[0].url,
      isPrimary: oldPhoto.isPrimary,
      uploadedAt: uploaded[0].uploadedAt,
    };

    const updatedReview = await review.save();
    res.status(200).json({ message: 'Before photo replaced', data: updatedReview });
  } catch (error) {
    next(error);
  }
};

// Replace a specific after photo by index (delete old from Cloudinary, upload new)
export const replaceAfterPhoto: RequestHandler = async (req, res, next) => {
  try {
    const { id, photoIndex } = req.params;
    const files = req.files as Express.Multer.File[];
    const index = parseInt(photoIndex);

    if (!files || files.length === 0) {
      return next({ statusCode: 400, message: 'A photo is required' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return next({ statusCode: 404, message: 'Review not found' });
    }

    if (review.userId.toString() !== req.auth?.uid?.toString()) {
      return next({ statusCode: 403, message: 'You can only update your own reviews' });
    }

    if (!review.afterPhotos || index < 0 || index >= review.afterPhotos.length) {
      return next({ statusCode: 400, message: 'Invalid photo index' });
    }

    // Delete old photo from Cloudinary
    const oldPhoto = review.afterPhotos[index];
    const publicId = getPublicIdFromUrl(oldPhoto.url);
    await deleteOnCloudinary(publicId);

    // Upload new photo
    const uploaded = await uploadMultipleToCloudinary(files);

    review.afterPhotos[index] = {
      url: uploaded[0].url,
      isPrimary: oldPhoto.isPrimary,
      uploadedAt: uploaded[0].uploadedAt,
    };

    const updatedReview = await review.save();
    res.status(200).json({ message: 'After photo replaced', data: updatedReview });
  } catch (error) {
    next(error);
  }
};
