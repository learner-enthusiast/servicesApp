import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';

// Load env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Account from '../models/Account';
import Listing from '../models/Listings';
import Booking from '../models/Bookings';
import Review from '../models/Review';
import {
  BookingStatusEnum,
  DeletionRequestEnum,
  ListingStatusEnum,
  ServiceTypeEnum,
  UserTypeEnum,
} from '../utils/enums';

// ─── Helper ────────────────────────────────────────────────────────────────────
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomEl<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function futureDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}
function pastDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

// ─── Raw Seed Data ─────────────────────────────────────────────────────────────
const PASSWORD = 'Password@123';

const usersData = [
  // Admins
  { name: 'Admin One', email: 'admin1@example.com', role: 'admin' },
  { name: 'Admin Two', email: 'admin2@example.com', role: 'admin' },
  // Service Provider
  {
    name: 'Alice Service_provider',
    email: 'alice@example.com',
    type: UserTypeEnum.SERVICE_PROVIDER,
    role: 'user',
  },
  {
    name: 'Bob Service_provider',
    email: 'bob@example.com',
    type: UserTypeEnum.SERVICE_PROVIDER,
    role: 'user',
  },
  {
    name: 'Charlie Service_provider',
    email: 'charlie@example.com',
    type: UserTypeEnum.SERVICE_PROVIDER,
    role: 'user',
  },
  {
    name: 'Diana Service_provider',
    email: 'diana@example.com',
    type: UserTypeEnum.SERVICE_PROVIDER,
    role: 'user',
  },
  // Customers
  { name: 'Eve Customer', email: 'eve@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Frank Customer', email: 'frank@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Grace Customer', email: 'grace@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Hank Customer', email: 'hank@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Ivy Customer', email: 'ivy@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Jack Customer', email: 'jack@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Karen Customer', email: 'karen@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Leo Customer', email: 'leo@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Mona Customer', email: 'mona@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Nick Customer', email: 'nick@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  {
    name: 'Olivia Customer',
    email: 'olivia@example.com',
    type: UserTypeEnum.CUSTOMER,
    role: 'user',
  },
  { name: 'Paul Customer', email: 'paul@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Quinn Customer', email: 'quinn@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
  { name: 'Rita Customer', email: 'rita@example.com', type: UserTypeEnum.CUSTOMER, role: 'user' },
];

import { Types } from 'mongoose';

export const listingsData = [
  {
    name: 'Expert Plumbing Services',
    description: 'Professional plumbing solutions for leak repairs, installations and maintenance.',
    serviceType: ServiceTypeEnum.PLUMBING,
    price: 499,
    geoLocation: { type: 'Point', coordinates: [88.3639, 22.5726] },
    photos: [{ url: 'https://picsum.photos/seed/plumbing1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  {
    name: 'AC Installation & Repair',
    description: 'Complete AC servicing including gas refill, installation and deep cleaning.',
    serviceType: ServiceTypeEnum.AC_SERVICE,
    price: 899,
    geoLocation: { type: 'Point', coordinates: [88.4089, 22.6298] },
    photos: [
      { url: 'https://picsum.photos/seed/ac1/800/600', isPrimary: true },
      { url: 'https://picsum.photos/seed/ac2/800/600', isPrimary: false },
    ],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  {
    name: 'Home Cleaning Services',
    description: 'Deep home cleaning for kitchen, bathroom and full apartment sanitization.',
    serviceType: ServiceTypeEnum.CLEANING,
    price: 1299,
    geoLocation: { type: 'Point', coordinates: [88.34, 22.5448] },
    photos: [{ url: 'https://picsum.photos/seed/cleaning1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  {
    name: 'Professional Wedding Photography',
    description: 'Capture your special moments with cinematic wedding photography.',
    serviceType: ServiceTypeEnum.PHOTOGRAPHY,
    price: 25000,
    geoLocation: { type: 'Point', coordinates: [88.3639, 22.5726] },
    photos: [
      { url: 'https://picsum.photos/seed/photo1/800/600', isPrimary: true },
      { url: 'https://picsum.photos/seed/photo2/800/600', isPrimary: false },
    ],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  {
    name: 'Certified Home Tutor (Maths & Science)',
    description: 'Experienced tutor for classes 6–12, CBSE & ICSE boards.',
    serviceType: ServiceTypeEnum.HOME_TUTOR,
    price: 600,
    geoLocation: { type: 'Point', coordinates: [88.37, 22.56] },
    photos: [{ url: 'https://picsum.photos/seed/tutor1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 6
  {
    name: 'Electrical Wiring & Repair',
    description: 'Certified electrician for wiring, switchboard repair and installations.',
    serviceType: ServiceTypeEnum.ELECTRICAL,
    price: 699,
    geoLocation: { type: 'Point', coordinates: [88.355, 22.58] },
    photos: [{ url: 'https://picsum.photos/seed/electric1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 7
  {
    name: "Men's Salon at Home",
    description: 'Haircut, beard styling and grooming services at your doorstep.',
    serviceType: ServiceTypeEnum.MENS_SALON,
    price: 299,
    geoLocation: { type: 'Point', coordinates: [88.39, 22.6] },
    photos: [{ url: 'https://picsum.photos/seed/salon1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 8
  {
    name: "Women's Salon & Bridal Makeup",
    description: 'Professional bridal and party makeup with hairstyling.',
    serviceType: ServiceTypeEnum.WOMENS_SALON,
    price: 3500,
    geoLocation: { type: 'Point', coordinates: [88.41, 22.59] },
    photos: [{ url: 'https://picsum.photos/seed/womens1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 9
  {
    name: 'Car Washing & Detailing',
    description: 'Complete car washing and interior detailing at home.',
    serviceType: ServiceTypeEnum.CAR_WASHING,
    price: 499,
    geoLocation: { type: 'Point', coordinates: [88.365, 22.61] },
    photos: [{ url: 'https://picsum.photos/seed/car1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 10
  {
    name: 'Packers and Movers Service',
    description: 'Safe and secure home shifting services with insurance coverage.',
    serviceType: ServiceTypeEnum.PACKERS_AND_MOVERS,
    price: 4500,
    geoLocation: { type: 'Point', coordinates: [88.33, 22.57] },
    photos: [{ url: 'https://picsum.photos/seed/movers1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 11
  {
    name: 'Interior Design Consultation',
    description: 'Modern interior design solutions for home and office.',
    serviceType: ServiceTypeEnum.INTERIOR_DESIGN,
    price: 5000,
    geoLocation: { type: 'Point', coordinates: [88.375, 22.585] },
    photos: [{ url: 'https://picsum.photos/seed/interior1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 12
  {
    name: 'Pest Control Services',
    description: 'Termite and cockroach control with eco-safe chemicals.',
    serviceType: ServiceTypeEnum.PEST_CONTROL,
    price: 1199,
    geoLocation: { type: 'Point', coordinates: [88.345, 22.595] },
    photos: [{ url: 'https://picsum.photos/seed/pest1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 13
  {
    name: 'Physiotherapy at Home',
    description: 'Certified physiotherapist for pain relief and post-surgery recovery.',
    serviceType: ServiceTypeEnum.PHYSIOTHERAPY,
    price: 800,
    geoLocation: { type: 'Point', coordinates: [88.36, 22.555] },
    photos: [{ url: 'https://picsum.photos/seed/physio1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 14
  {
    name: 'DJ & Sound Setup',
    description: 'Complete DJ and sound system setup for parties and weddings.',
    serviceType: ServiceTypeEnum.DJ_SOUND,
    price: 7000,
    geoLocation: { type: 'Point', coordinates: [88.395, 22.575] },
    photos: [{ url: 'https://picsum.photos/seed/dj1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },

  // 15
  {
    name: 'Waterproofing & Terrace Repair',
    description: 'Professional terrace waterproofing with 5-year warranty.',
    serviceType: ServiceTypeEnum.WATERPROOFING,
    price: 10000,
    geoLocation: { type: 'Point', coordinates: [88.38, 22.565] },
    photos: [{ url: 'https://picsum.photos/seed/waterproof1/800/600', isPrimary: true }],
    status: ListingStatusEnum.ACTIVE,
    userId: new Types.ObjectId(),
    deletionRequest: { status: DeletionRequestEnum.NONE },
  },
];

const reviewDescriptions = [
  'Absolutely wonderful stay! Everything was clean and the host was very responsive.',
  'Great location, but the WiFi was a bit spotty. Would still recommend.',
  'One of the best vacations I have ever had. The views were incredible!',
  'Decent place for the price. Nothing fancy but gets the job done.',
  'The photos do not do it justice — even more beautiful in person.',
  'Had a small issue with check-in but the host resolved it quickly.',
  'Perfect for a weekend getaway. Very peaceful and relaxing.',
  'The kitchen was fully stocked which was a huge plus for us.',
  'A bit noisy at night due to the road nearby, but otherwise great.',
  'We will definitely be back! Our kids loved the pool.',
  'Exceeded expectations in every way. Five stars across the board.',
  'Good value for money. Clean, comfortable, and well-maintained.',
  'The host went above and beyond to make us feel welcome.',
  'Location was perfect — walking distance to everything we needed.',
  'Lovely space with great natural light. Highly recommend for couples.',
  'Could use some minor repairs but overall a pleasant stay.',
  'Amazing sunset views from the terrace. Truly unforgettable.',
  'Felt like home away from home. Will recommend to all my friends.',
  'The amenities listed were all accurate. No surprises — in a good way.',
  'Comfortable beds, hot water, great coffee — what more do you need?',
  'Not the cleanest place I have stayed at. Room for improvement.',
  'Fantastic for remote work. The desk setup and internet were solid.',
  'We hosted a small gathering here and it was perfect for that.',
  'Quiet neighbourhood, friendly locals, and a beautiful property.',
  'The host provided a really helpful local guide. Nice touch!',
];

// ─── Main Seed Function ────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI;
  if (!uri) {
    throw new Error(
      'MongoDB URI not found in environment variables (MONGO_URI / MONGODB_URI / DB_URI)'
    );
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  // ── 1. Clear all collections ──────────────────────────────────────────────
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    Review.deleteMany({}),
    Booking.deleteMany({}),
    Listing.deleteMany({}),
    Account.deleteMany({}),
  ]);

  // ── 2. Create Accounts ────────────────────────────────────────────────────
  console.log('👤 Creating accounts...');
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  const accounts = await Account.insertMany(
    usersData.map((u) => ({
      name: u.name,
      email: u.email,
      password: hashedPassword,
      role: u.role,
      ...(u.type && { type: u.type }),
    }))
  );
  console.log(`   → ${accounts.length} accounts created`);

  const admins = accounts.filter((a: any) => a.role === 'admin');
  const hosts = accounts.filter((a: any) => a.type === UserTypeEnum.SERVICE_PROVIDER);
  const customers = accounts.filter((a: any) => a.type === UserTypeEnum.CUSTOMER);

  // ── 3. Create Listings (assigned to hosts) ────────────────────────────────
  console.log('🏠 Creating listings...');
  const listings = await Listing.insertMany(
    listingsData.map((l, i) => ({
      ...l,
      hostId: hosts[i % hosts.length]._id,
      ratings: 0,
      reviewIds: [],
    }))
  );
  console.log(`   → ${listings.length} listings created`);

  // ── 4. Create Bookings ────────────────────────────────────────────────────
  console.log('📅 Creating bookings...');

  interface BookingDoc {
    _id: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    listingId: mongoose.Types.ObjectId;
    status: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalPrice: number;
    reviewId?: mongoose.Types.ObjectId;
  }

  const bookingsRaw: any[] = [];

  // Give each customer 3–5 bookings across random listings
  for (const customer of customers) {
    const numBookings = randomInt(3, 5);
    const usedListings = new Set<string>();

    for (let b = 0; b < numBookings; b++) {
      let listing = randomEl(listings);
      // Avoid duplicate listing for same customer
      let attempts = 0;
      while (usedListings.has(listing._id.toString()) && attempts < 20) {
        listing = randomEl(listings);
        attempts++;
      }
      usedListings.add(listing._id.toString());

      const isCompleted = Math.random() < 0.6;
      const isPending = !isCompleted && Math.random() < 0.5;
      const status = isCompleted
        ? BookingStatusEnum.COMPLETED
        : isPending
          ? BookingStatusEnum.IN_PROGRESS
          : BookingStatusEnum.CONFIRMED;

      const daysAgo = randomInt(10, 120);
      const stayLength = randomInt(1, 7);
      const checkIn = isCompleted ? pastDate(daysAgo + stayLength) : futureDate(randomInt(5, 60));
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + stayLength);

      const guests = randomInt(1, (listing as any).maxGuests || 4);
      const totalPrice = ((listing as any).price || 100) * stayLength;

      bookingsRaw.push({
        customerId: customer._id,
        listingId: listing._id,
        status,
        checkIn,
        checkOut,
        guests,
        totalPrice,
      });
    }
  }

  // Also create a few cancelled bookings
  for (let i = 0; i < 5; i++) {
    const customer = randomEl(customers);
    const listing = randomEl(listings);
    const daysAgo = randomInt(5, 60);
    bookingsRaw.push({
      customerId: customer._id,
      listingId: listing._id,
      status: BookingStatusEnum.CANCELLED || 'cancelled',
      checkIn: pastDate(daysAgo + 3),
      checkOut: pastDate(daysAgo),
      guests: randomInt(1, 3),
      totalPrice: ((listing as any).price || 100) * 3,
    });
  }

  const bookings: BookingDoc[] = (await Booking.insertMany(bookingsRaw)) as any;
  console.log(`   → ${bookings.length} bookings created`);

  // ── 5. Create Reviews (only for completed bookings) ───────────────────────
  console.log('⭐ Creating reviews...');

  const completedBookings = bookings.filter(
    (b) => b.status === BookingStatusEnum.COMPLETED || b.status === 'completed'
  );

  const reviewDocs: any[] = [];

  for (const booking of completedBookings) {
    const star = randomInt(2, 5); // Weighted toward positive
    const description = randomEl(reviewDescriptions);

    reviewDocs.push({
      bookingId: booking._id,
      listingId: booking.listingId,
      userId: booking.customerId,
      description,
      star,
      stars: star, // in case your schema uses `stars`
    });
  }

  const reviews = await Review.insertMany(reviewDocs);
  console.log(`   → ${reviews.length} reviews created`);

  // ── 6. Back-fill booking.reviewId ─────────────────────────────────────────
  console.log('🔗 Linking reviews → bookings...');
  const bulkBookingOps = reviews.map((review: any) => ({
    updateOne: {
      filter: { _id: review.bookingId },
      update: { $set: { reviewId: review._id } },
    },
  }));
  await Booking.bulkWrite(bulkBookingOps);

  // ── 7. Back-fill listing.reviewIds + recalculate ratings ──────────────────
  console.log('📊 Updating listing ratings...');

  // Group reviews by listing
  const reviewsByListing = new Map<string, { ids: mongoose.Types.ObjectId[]; stars: number[] }>();

  for (const review of reviews) {
    const lid = (review as any).listingId.toString();
    if (!reviewsByListing.has(lid)) {
      reviewsByListing.set(lid, { ids: [], stars: [] });
    }
    const entry = reviewsByListing.get(lid)!;
    entry.ids.push((review as any)._id);
    entry.stars.push((review as any).star || (review as any).stars);
  }

  const bulkListingOps = Array.from(reviewsByListing.entries()).map(([listingId, data]) => {
    const avgRating = parseFloat(
      (data.stars.reduce((sum, s) => sum + s, 0) / data.stars.length).toFixed(2)
    );
    return {
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(listingId) },
        update: {
          $set: {
            reviewIds: data.ids,
            ratings: avgRating,
          },
        },
      },
    };
  });
  await Listing.bulkWrite(bulkListingOps);

  // ── 8. Summary ────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║          🌱  SEED COMPLETE               ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Admins:      ${String(admins.length).padStart(3)}                        ║`);
  console.log(`║  Hosts:       ${String(hosts.length).padStart(3)}                        ║`);
  console.log(`║  Customers:   ${String(customers.length).padStart(3)}                        ║`);
  console.log(`║  Listings:    ${String(listings.length).padStart(3)}                        ║`);
  console.log(`║  Bookings:    ${String(bookings.length).padStart(3)}                        ║`);
  console.log(`║  Reviews:     ${String(reviews.length).padStart(3)}                        ║`);
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  All passwords: ${PASSWORD.padEnd(23)} ║`);
  console.log('╚══════════════════════════════════════════╝\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

// ─── Run ────────────────────────────────────────────────────────────────────────
seed().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
