import { RequestHandler } from 'express';
import Listing from '../models/Listings';
import { DeletionRequestEnum } from '../utils/enums';
import { string } from 'joi';
import { uploadOnCloudinary } from '../utils/cloudinary';

// Create a new listing
export const createListing: RequestHandler = async (req, res, next) => {
  try {
    let { name, description, geoLocation, price, serviceType } = req.body;
    geoLocation = JSON.parse(req.body.geoLocation);
    if (!name) return next({ statusCode: 400, message: 'Name is required' });
    if (!description) return next({ statusCode: 400, message: 'Description is required' });
    if (!geoLocation?.type || !geoLocation?.coordinates)
      return next({ statusCode: 400, message: 'Geo location is required' });
    if (price == null) return next({ statusCode: 400, message: 'Price is required' });
    const files = req.files as Express.Multer.File[];

    const photos = await Promise.all(
      files.map(async (file) => {
        const result = await uploadOnCloudinary(file.path);
        return { url: result.url };
      })
    );
    const listing = new Listing({
      name,
      description,
      geoLocation,
      price,
      serviceType,
      userId: req.auth.uid,
      photos: photos || [],
    });
    const savedListing = await listing.save();
    res.status(201).json({ message: 'Listing created', data: savedListing });
  } catch (error) {
    next(error);
  }
};

// Update a listing by ID
export const updateListing: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) return next({ statusCode: 404, message: 'Listing not found' });
    if (listing.userId.toString() !== req.auth?._id.toString())
      return next({ statusCode: 403, message: 'Unauthorized' });

    // Only these fields are allowed to change
    const { name, description, serviceType, price, geoLocation } = req.body;

    // Check if anything actually changed
    const isSame =
      (!name || name === listing.name) &&
      (!description || description === listing.description) &&
      (!serviceType || serviceType === listing.serviceType) &&
      (!price || price === listing.price) &&
      (!geoLocation || JSON.stringify(geoLocation) === JSON.stringify(listing.geoLocation));

    if (isSame) {
      res.status(200).json({ message: 'No changes detected', data: listing });
      return;
    }

    // Build update payload with only allowed fields
    const updatePayload: Record<string, any> = {};
    if (name) updatePayload.name = name;
    if (description) updatePayload.description = description;
    if (serviceType) updatePayload.serviceType = serviceType;
    if (price) updatePayload.price = price;
    if (geoLocation) updatePayload.geoLocation = geoLocation;

    const updated = await Listing.findByIdAndUpdate(id, updatePayload, { new: true });
    res.status(200).json({ message: 'Listing updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// Get all listings
export const getAllListings: RequestHandler = async (req, res, next) => {
  try {
    const { serviceType, status, lat, lng, radiusKm, minRating } = req.query;

    const matchFilter: Record<string, any> = {};
    if (serviceType) matchFilter.serviceType = serviceType;
    if (status) matchFilter.status = status;
    if (minRating) matchFilter.ratings = { $gte: parseFloat(minRating as string) };

    // --- Geolocation search ---
    if (lat && lng && radiusKm) {
      const radiusInMeters = parseFloat(radiusKm as string) * 1000;

      const listings = await Listing.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
            },
            distanceField: 'distanceInMeters',
            maxDistance: radiusInMeters,
            spherical: true,
            query: matchFilter,
          },
        },
        {
          $addFields: {
            distanceInKm: { $divide: ['$distanceInMeters', 1000] },
          },
        },
        { $sort: { ratings: -1 } },
        { $project: { bookingIds: 0, userId: 0 } },
      ]);

      res.status(200).json({
        message: 'Listings fetched',
        count: listings.length,
        data: listings,
      });
      return;
    }

    // --- Regular filter ---
    const listings = await Listing.find(matchFilter)
      .select('-bookingIds -userId')
      .sort({ ratings: -1 });

    res.status(200).json({
      message: 'Listings fetched',
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};
// Get a single listing by ID
export const getListingById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).select('-bookingIds -userId');
    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }
    res.status(200).json({ message: 'Listing fetched', data: listing });
  } catch (error) {
    next(error);
  }
};

export const requestDeleteListing: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }

    if (listing.userId.toString() !== req.auth?._id.toString()) {
      return next({ statusCode: 403, message: 'Unauthorized' });
    }

    const updated = await Listing.findByIdAndUpdate(
      id,
      { deletionRequest: { status: DeletionRequestEnum.PENDING, requestedAt: new Date() } },
      { new: true }
    );

    res.status(200).json({
      message: 'Deletion request submitted, awaiting admin approval',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewDeleteListing: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'Approved' | 'Rejected'

    if (![DeletionRequestEnum.APPROVED, DeletionRequestEnum.REJECTED].includes(action)) {
      return next({ statusCode: 400, message: 'Invalid action. Use Approved or Rejected' });
    }

    if (action === DeletionRequestEnum.APPROVED) {
      const deleted = await Listing.findByIdAndDelete(id);
      if (!deleted) {
        return next({ statusCode: 404, message: 'Listing not found' });
      }
      res.status(200).json({ message: 'Listing deleted after admin approval' });
      return;
    }

    const listing = await Listing.findByIdAndUpdate(
      id,
      { deletionRequest: { status: DeletionRequestEnum.REJECTED, reviewedAt: new Date() } },
      { new: true }
    );

    if (!listing) {
      return next({ statusCode: 404, message: 'Listing not found' });
    }

    res.status(200).json({ message: 'Deletion request rejected', data: listing });
  } catch (error) {
    next(error);
  }
};

export const getDeletionRequests: RequestHandler = async (req, res, next) => {
  try {
    const listings = await Listing.find({ 'deletionRequest.status': DeletionRequestEnum.PENDING })
      .select('-bookingIds -userId')
      .sort({ 'deletionRequest.requestedAt': 1 });

    res.status(200).json({
      message: 'Deletion requests fetched',
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};
