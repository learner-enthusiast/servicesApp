import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import Account from '../models/Account';
import Listing from '../models/Listings';
import Booking from '../models/Bookings';
import Review from '../models/Review';

import {
  BookingStatusEnum,
  ListingStatusEnum,
  PaymentStatusEnum,
  UserRoleEnum,
  UserTypeEnum,
} from '../utils/enums';

import { generateListings } from './listingsgenerator';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI!;

/* Helpers */

const hash = (pw: string) => bcrypt.hash(pw, 10);

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const pastDate = (days: number) => new Date(Date.now() - Math.max(days, 1) * 86400000);

const futureDate = (days: number) => new Date(Date.now() + Math.max(days, 1) * 86400000);

/* Users */

const SERVICE_PROVIDERS = [
  'ravi_movers',
  'priya_cleaners',
  'suresh_electrician',
  'anita_plumber',
  'deepak_parking',
  'mohan_carwash',
  'sunita_cleaning',
  'rajesh_electrician',
  'kavita_plumber',
  'arun_movers',
];

const CUSTOMERS = [
  'customer_arjun',
  'customer_meena',
  'customer_rohit',
  'customer_sita',
  'customer_vijay',
  'customer_pooja',
  'customer_nikhil',
  'customer_divya',
  'customer_suresh',
  'customer_ananya',
];

/* Listings */

const LISTINGS_DATA = generateListings(5000);

/* Reviews */

const REVIEW_COMMENTS = [
  'Excellent service! Very professional and on time.',
  'Good work overall. Would recommend to others.',
  'Decent experience. Got the job done without issues.',
  'Very satisfied. The team was courteous and efficient.',
  'Quick response and quality work. Will book again.',
  'Outstanding! Exceeded my expectations completely.',
  'Reliable and affordable. Happy with the results.',
];

/* Seeder */

const seed = async () => {
  await mongoose.connect(MONGO_URI);

  console.log('Connected to MongoDB');

  await Promise.all([
    Account.deleteMany({}),
    Listing.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);

  /* Admin */

  await Account.create({
    username: 'admin',
    password: await hash('admin123'),
    role: UserRoleEnum.ADMIN,
  });

  /* Providers */

  const providers = await Account.insertMany(
    await Promise.all(
      SERVICE_PROVIDERS.map(async (username) => ({
        username,
        password: await hash('provider123'),
        role: UserRoleEnum.USER,
        type: UserTypeEnum.SERVICE_PROVIDER,
      }))
    )
  );

  /* Customers */

  const customers = await Account.insertMany(
    await Promise.all(
      CUSTOMERS.map(async (username) => ({
        username,
        password: await hash('customer123'),
        role: UserRoleEnum.USER,
        type: UserTypeEnum.CUSTOMER,
      }))
    )
  );

  /* Listings */

  const listings = await Listing.insertMany(
    LISTINGS_DATA.map(([name, description, serviceType, price, coordinates], i) => {
      const provider = providers[i % providers.length];

      return {
        name,
        description,
        serviceType,
        price,
        status: ListingStatusEnum.ACTIVE,
        geoLocation: { type: 'Point', coordinates },
        userId: provider._id,
        ratings: 0,
        bookingIds: [],
        reviewIds: [],
        photos: [],
      };
    })
  );

  console.log(`Listings created: ${listings.length}`);

  /* Generate bookings + reviews */

  const bookings: any[] = [];
  const reviews: any[] = [];
  const listingRatings: Record<string, number[]> = {};

  for (const listing of listings) {
    const bookingCount = randomBetween(0, 25);
    for (let i = 0; i < bookingCount; i++) {
      const customer = pickRandom(customers);

      let status;
      let scheduledDate;
      let originalDate;
      let isCompleted = false;

      const rand = Math.random();

      if (rand < 0.6) {
        status = BookingStatusEnum.COMPLETED;
        scheduledDate = pastDate(randomBetween(5, 180));
        originalDate = new Date(scheduledDate.getTime() - randomBetween(3, 20) * 86400000);
        isCompleted = true;
      } else if (rand < 0.85) {
        status = BookingStatusEnum.CONFIRMED;
        scheduledDate = futureDate(randomBetween(1, 30));
        originalDate = new Date(scheduledDate.getTime() - randomBetween(1, 5) * 86400000);
      } else {
        status = BookingStatusEnum.REQUESTED;
        scheduledDate = futureDate(randomBetween(10, 40));
        originalDate = new Date();
      }

      const bookingId = new mongoose.Types.ObjectId();

      let reviewId: mongoose.Types.ObjectId | undefined;
      let stars: number | undefined;

      if (isCompleted && Math.random() < 0.7) {
        reviewId = new mongoose.Types.ObjectId();
        stars = randomBetween(3, 5);
      }

      bookings.push({
        _id: bookingId,
        listingId: listing._id,
        customerId: customer._id,
        status,
        finalPrice: listing.price,
        paymentStatus: isCompleted ? PaymentStatusEnum.PAID : PaymentStatusEnum.UNPAID,
        scheduledDate,
        originalDate,
        isCancelled: false,
        rescheduleCount: isCompleted ? randomBetween(0, 2) : 0,
        reviewId: reviewId || null,
      });

      if (reviewId && stars) {
        reviews.push({
          _id: reviewId,
          listingId: listing._id,
          bookingId: bookingId,
          userId: customer._id,
          description: pickRandom(REVIEW_COMMENTS),
          stars,
          beforePhotos: [],
          afterPhotos: [],
        });

        if (!listingRatings[listing._id.toString()]) listingRatings[listing._id.toString()] = [];

        listingRatings[listing._id.toString()].push(stars);
      }
    }
  }

  /* Insert bookings & reviews */

  await Booking.insertMany(bookings);
  await Review.insertMany(reviews);

  /* Rating updates */

  const ratingUpdates = Object.entries(listingRatings).map(([id, stars]) => {
    const avg = stars.reduce((a, b) => a + b, 0) / stars.length;

    return {
      updateOne: {
        filter: { _id: id },
        update: { ratings: Math.round(avg * 10) / 10 },
      },
    };
  });

  await Listing.bulkWrite(ratingUpdates);

  console.log(`Bookings created: ${bookings.length}`);
  console.log(`Reviews created: ${reviews.length}`);

  await mongoose.disconnect();

  console.log('Seed complete');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
