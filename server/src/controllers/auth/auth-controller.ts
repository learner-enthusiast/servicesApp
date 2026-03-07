import { type RequestHandler } from 'express';
import Account from '../../models/Account';
import Listing from '../../models/Listings';
import Review from '../../models/Review';

export const getUsersByType: RequestHandler = async (req, res, next) => {
  try {
    const {
      userType: type,
      name,
      page = 1,
      limit = 10,
    } = req.query as {
      userType: string;
      name?: string;
      page?: string | number;
      limit?: string | number;
    };

    if (!type || !['CUSTOMER', 'SERVICE_PROVIDER'].includes(type)) {
      return next({
        statusCode: 400,
        message: 'Invalid or missing type',
      });
    }

    const query: any = { type };

    if (name) {
      query.username = { $regex: name, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      Account.find(query).skip(skip).limit(Number(limit)).select('-password'),
      Account.countDocuments(query),
    ]);

    res.status(200).json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const getOverviewStats: RequestHandler = async (req, res, next) => {
  try {
    // Total customers and service providers
    const [customerCount, providerCount] = await Promise.all([
      Account.countDocuments({ type: 'CUSTOMER' }),
      Account.countDocuments({ type: 'SERVICE_PROVIDER' }),
    ]);

    // Listings grouped by serviceType, active, and rated >= 4
    const listingsStats = await Listing.aggregate([
      {
        $group: {
          _id: '$serviceType',
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] },
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$status', 'INACTIVE'] }, 1, 0] },
          },
          rated4OrMore: {
            $sum: { $cond: [{ $gte: ['$ratings', 4] }, 1, 0] },
          },
        },
      },
    ]);

    // Total listings, active, inactive
    const [totalListings, activeListings, inactiveListings] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'ACTIVE' }),
      Listing.countDocuments({ status: 'INACTIVE' }),
    ]);

    // Total reviews
    const totalReviews = await Review.countDocuments();

    // Bookings by status
    const bookingsByStatus = await import('../../models/Bookings').then(({ default: Booking }) =>
      Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    );

    // Listings with no bookings
    const Booking = (await import('../../models/Bookings')).default;
    const listingsWithNoBookings = await Listing.countDocuments({
      _id: { $nin: await Booking.distinct('listingId') },
    });

    // Most popular service type by bookings
    const mostPopularServiceType = await Booking.aggregate([
      {
        $lookup: {
          from: 'listings',
          localField: 'listingId',
          foreignField: '_id',
          as: 'listing',
        },
      },
      { $unwind: '$listing' },
      {
        $group: {
          _id: '$listing.serviceType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    // Average review rating overall
    const avgReviewRating = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    res.status(200).json({
      customers: customerCount,
      serviceProviders: providerCount,
      totalListings,
      activeListings,
      inactiveListings,
      listingsByServiceType: listingsStats,
      totalReviews,
      bookingsByStatus,
      listingsWithNoBookings,
      mostPopularServiceType: mostPopularServiceType[0]?._id || null,
      avgReviewRating: avgReviewRating[0]?.avg || null,
    });
  } catch (error) {
    next(error);
  }
};
