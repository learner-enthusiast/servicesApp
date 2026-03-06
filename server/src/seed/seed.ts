import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Account from '../models/Account';
import Review from '../models/Review';
import Listing from '../models/Listings';
import Booking from '../models/Bookings';
import dotenv from 'dotenv';
dotenv.config();

import {
  BookingStatusEnum,
  ListingStatusEnum,
  PaymentStatusEnum,
  ServiceTypeEnum,
  UserRoleEnum,
  UserTypeEnum,
} from '../utils/enums';

const MONGO_URI = process.env.MONGODB_URI!;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hash = (pw: string) => bcrypt.hash(pw, 10);
const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
};
const futureDate = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
};

// ─── Accounts ─────────────────────────────────────────────────────────────────

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

// ─── Listings ─────────────────────────────────────────────────────────────────
// [name, description, serviceType, price, [lng, lat], locationLabel]

const LISTINGS_DATA: [string, string, string, number, [number, number]][] = [
  // Kolkata
  [
    'Ravi Packers & Movers',
    'Professional packing and moving service in Kolkata. Experienced staff handling furniture, fragile items, and full home relocations with care and efficiency.',
    ServiceTypeEnum.PACKERS_AND_MOVERS,
    4500,
    [88.3639, 22.5726], // Kolkata city centre
  ],
  [
    'QuickClean Home Services',
    'Deep cleaning service covering bathrooms, kitchens, and full apartments in the Salt Lake area. All professional equipment provided.',
    ServiceTypeEnum.CLEANING,
    1200,
    [88.4126, 22.5958], // Salt Lake, Kolkata
  ],
  [
    'Suresh Electrical Works',
    'Licensed electrician based in Howrah offering wiring, switchboard repairs, inverter installation, and emergency electrical fault resolution.',
    ServiceTypeEnum.ELECTRICAL,
    800,
    [88.3105, 22.5958], // Howrah
  ],
  [
    'Anita Plumbing Solutions',
    'Pipe repairs, leakage fixing, bathroom fittings, water tank cleaning, and drain unblocking across South Kolkata.',
    ServiceTypeEnum.PLUMBING,
    700,
    [88.3697, 22.5121], // South Kolkata / Behala
  ],
  [
    'Anandamayee Car Parking',
    'Secure covered car parking near Serampore Railway Station. 24/7 CCTV, monthly and daily passes available.',
    ServiceTypeEnum.CAR_WASHING,
    3000,
    [88.3396, 22.7513], // Serampore
  ],

  // Serampore & Hooghly district
  [
    'SparkFix Electricals – Serampore',
    'Fan installation, AC servicing, MCB replacement, and full wiring solutions for homes and offices in Serampore and nearby areas.',
    ServiceTypeEnum.ELECTRICAL,
    950,
    [88.3421, 22.7489], // Serampore
  ],
  [
    'FreshHome Deep Cleaning – Chandannagar',
    'Post-construction cleaning, sofa shampooing, carpet cleaning, and move-in/move-out services in Chandannagar.',
    ServiceTypeEnum.CLEANING,
    1800,
    [88.3676, 22.8677], // Chandannagar
  ],
  [
    'Deepak Safe Parking – Hooghly',
    'Gated parking lot with full-time attendant near Hooghly Court. Suitable for cars and bikes. Daily, weekly, and monthly passes.',
    ServiceTypeEnum.CAR_WASHING,
    1500,
    [88.3959, 22.9053], // Hooghly
  ],
  [
    'Mohan Express Car Wash – Chinsurah',
    'Premium hand car wash and interior cleaning service. Mobile van available for doorstep service in Chinsurah and surroundings.',
    ServiceTypeEnum.CAR_WASHING,
    600,
    [88.3892, 22.8896], // Chinsurah
  ],
  [
    'Sunita Home Cleaners – Rishra',
    'Affordable home cleaning, kitchen deep clean, and bathroom sanitization service for Rishra and Konnagar residents.',
    ServiceTypeEnum.CLEANING,
    900,
    [88.3522, 22.7097], // Rishra
  ],

  // Kalyani & Nadia
  [
    'Rajesh Wiring & Repairs – Kalyani',
    'All electrical work including full home wiring, meter room fixes, and installation of geysers and fans in Kalyani township.',
    ServiceTypeEnum.ELECTRICAL,
    850,
    [88.4342, 22.9754], // Kalyani
  ],
  [
    'Kavita Pipe & Tap Works – Naihati',
    'Trusted plumber for overhead tank fitting, pipeline installation, drainage repair, and bathroom renovation in Naihati.',
    ServiceTypeEnum.PLUMBING,
    750,
    [88.4219, 22.8894], // Naihati
  ],
  [
    'Arun Relocation Services – Barrackpore',
    'Hassle-free household relocation services across North 24 Parganas. Packing, loading, transport, and unpacking included.',
    ServiceTypeEnum.PACKERS_AND_MOVERS,
    5200,
    [88.3718, 22.7622], // Barrackpore
  ],
  [
    'ClearDrain Plumbing – Baranagar',
    'Emergency drain unblocking, pipe leak sealing, and bathroom fitting services in Baranagar and Belgharia.',
    ServiceTypeEnum.PLUMBING,
    680,
    [88.3785, 22.6439], // Baranagar
  ],
  [
    'TotalMove Packers – Dum Dum',
    'Local and intercity moving service with GPS-tracked vehicles. Furniture disassembly and reassembly included.',
    ServiceTypeEnum.PACKERS_AND_MOVERS,
    3800,
    [88.4271, 22.6512], // Dum Dum
  ],
];

// ─── Review Comments ──────────────────────────────────────────────────────────

const REVIEW_COMMENTS = [
  'Excellent service! Very professional and on time.',
  'Good work overall. Would recommend to others.',
  'Decent experience. Got the job done without issues.',
  'Very satisfied. The team was courteous and efficient.',
  'Quick response and quality work. Will book again.',
  'Average service. Some delays but work was acceptable.',
  'Outstanding! Exceeded my expectations completely.',
  'Reliable and affordable. Happy with the results.',
  'The crew was hardworking and took good care of our belongings.',
  'Arrived on time and finished ahead of schedule. Impressed!',
  'Charged a fair price and did not cut corners. Recommended.',
  'Had a small issue but it was resolved promptly. Good service.',
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  await Promise.all([
    Account.deleteMany({}),
    Listing.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data\n');

  // ── Admin ──────────────────────────────────────────────────────────────────
  await Account.create({
    username: 'admin',
    password: await hash('admin123'),
    role: UserRoleEnum.ADMIN,
  });
  console.log('👤 Created admin');

  // ── Service Providers ──────────────────────────────────────────────────────
  const providerAccounts = await Promise.all(
    SERVICE_PROVIDERS.map(async (username) =>
      Account.create({
        username,
        password: await hash('provider123'),
        role: UserRoleEnum.USER,
        type: UserTypeEnum.SERVICE_PROVIDER,
      })
    )
  );
  console.log(`🔧 Created ${providerAccounts.length} service providers`);

  // ── Customers ──────────────────────────────────────────────────────────────
  const customerAccounts = await Promise.all(
    CUSTOMERS.map(async (username) =>
      Account.create({
        username,
        password: await hash('customer123'),
        role: UserRoleEnum.USER,
        type: UserTypeEnum.CUSTOMER,
      })
    )
  );
  console.log(`🙋 Created ${customerAccounts.length} customers`);

  // ── Listings ───────────────────────────────────────────────────────────────
  const listings = await Promise.all(
    LISTINGS_DATA.map(([name, description, serviceType, price, coordinates], idx) => {
      const provider = providerAccounts[idx % providerAccounts.length];
      return Listing.create({
        name,
        description,
        serviceType,
        price,
        status: ListingStatusEnum.ACTIVE,
        geoLocation: { type: 'Point', coordinates },
        userId: provider._id,
        ratings: 0,
        photos: [],
        bookingIds: [],
        reviewIds: [],
      });
    })
  );
  console.log(`📋 Created ${listings.length} listings`);

  // Link listings → providers
  for (const listing of listings) {
    await Account.findByIdAndUpdate(listing.userId, {
      $push: { listingIds: listing._id },
    });
  }

  // ── Bookings + Reviews ─────────────────────────────────────────────────────
  let totalBookings = 0;
  let totalReviews = 0;
  const listingStarAccumulator: Record<string, number[]> = {};

  for (const customer of customerAccounts) {
    // Each customer gets 3–5 completed + 1 upcoming + 1 requested
    const numCompleted = randomBetween(3, 5);
    const totalNeeded = numCompleted + 2; // +1 upcoming CONFIRMED, +1 REQUESTED
    const shuffled = [...listings].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(totalNeeded, listings.length));

    for (let i = 0; i < chosen.length; i++) {
      const listing = chosen[i];

      let status: string;
      let scheduledDate: Date;
      let isCompleted = false;

      if (i < numCompleted) {
        // Completed past bookings
        status = BookingStatusEnum.COMPLETED;
        scheduledDate = pastDate(randomBetween(5, 90));
        isCompleted = true;
      } else if (i === numCompleted) {
        // One upcoming confirmed booking
        status = BookingStatusEnum.CONFIRMED;
        scheduledDate = futureDate(randomBetween(3, 20));
      } else {
        // One requested (pending approval)
        status = BookingStatusEnum.REQUESTED;
        scheduledDate = futureDate(randomBetween(21, 40));
      }

      const booking = await Booking.create({
        listingId: listing._id,
        customerId: customer._id,
        status,
        finalPrice: listing.price,
        paymentStatus: isCompleted ? PaymentStatusEnum.PAID : PaymentStatusEnum.UNPAID,
        scheduledDate,
        originalDate: isCompleted ? pastDate(randomBetween(91, 120)) : undefined,
        isCancelled: false,
        rescheduleCount: isCompleted ? randomBetween(0, 1) : 0,
      });

      totalBookings++;

      await Listing.findByIdAndUpdate(listing._id, { $push: { bookingIds: booking._id } });
      await Account.findByIdAndUpdate(customer._id, { $push: { bookingIds: booking._id } });

      // ── Review: ONLY customers, ONLY on COMPLETED bookings ──
      if (isCompleted) {
        const stars = randomBetween(3, 5);

        const review = await Review.create({
          listingId: listing._id,
          bookingId: booking._id,
          userId: customer._id, // always the customer who made the booking
          description: pickRandom(REVIEW_COMMENTS),
          stars,
          beforePhotos: [],
          afterPhotos: [],
        });

        totalReviews++;

        await Booking.findByIdAndUpdate(booking._id, { reviewId: review._id });
        await Listing.findByIdAndUpdate(listing._id, { $push: { reviewIds: review._id } });

        const lid = listing._id.toString();
        if (!listingStarAccumulator[lid]) listingStarAccumulator[lid] = [];
        listingStarAccumulator[lid].push(stars);
      }
    }
  }

  // ── Recalculate listing average ratings ───────────────────────────────────
  for (const [listingId, stars] of Object.entries(listingStarAccumulator)) {
    const avg = stars.reduce((s, v) => s + v, 0) / stars.length;
    await Listing.findByIdAndUpdate(listingId, {
      ratings: Math.round(avg * 10) / 10,
    });
  }

  // ── Cancelled bookings: 1–2 per provider listing for realism ─────────────
  for (const provider of providerAccounts) {
    const providerListings = listings.filter(
      (l) => l.userId.toString() === provider._id.toString()
    );
    if (!providerListings.length) continue;

    const numCancelled = randomBetween(1, 2);
    for (let c = 0; c < numCancelled && c < providerListings.length; c++) {
      const listing = providerListings[c];
      const customer = pickRandom(customerAccounts);

      const cancelled = await Booking.create({
        listingId: listing._id,
        customerId: customer._id,
        status: BookingStatusEnum.CANCELLED,
        finalPrice: listing.price,
        paymentStatus: PaymentStatusEnum.UNPAID,
        scheduledDate: pastDate(randomBetween(10, 60)),
        isCancelled: true,
        cancelledBy: pickRandom(['customer', 'provider']),
        cancelledAt: pastDate(randomBetween(1, 9)),
        rescheduleCount: 0,
      });

      totalBookings++;
      await Listing.findByIdAndUpdate(listing._id, { $push: { bookingIds: cancelled._id } });
      await Account.findByIdAndUpdate(customer._id, { $push: { bookingIds: cancelled._id } });
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n📅 Bookings created:  ${totalBookings}`);
  console.log(`⭐ Reviews created:   ${totalReviews}`);
  console.log('\n✅ Seeding complete!');
  console.log('─────────────────────────────────────────────────');
  console.log('  admin                / admin123');
  console.log('');
  console.log('  customer_arjun       / customer123');
  console.log('  customer_meena       / customer123');
  console.log('  customer_rohit       / customer123');
  console.log('  customer_sita        / customer123');
  console.log('  customer_vijay       / customer123');
  console.log('  customer_pooja       / customer123');
  console.log('  customer_nikhil      / customer123');
  console.log('  customer_divya       / customer123');
  console.log('  customer_suresh      / customer123');
  console.log('  customer_ananya      / customer123');
  console.log('');
  console.log('  ravi_movers          / provider123');
  console.log('  priya_cleaners       / provider123');
  console.log('  suresh_electrician   / provider123');
  console.log('  anita_plumber        / provider123');
  console.log('  deepak_parking       / provider123');
  console.log('  mohan_carwash        / provider123');
  console.log('  sunita_cleaning      / provider123');
  console.log('  rajesh_electrician   / provider123');
  console.log('  kavita_plumber       / provider123');
  console.log('  arun_movers          / provider123');
  console.log('─────────────────────────────────────────────────\n');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
