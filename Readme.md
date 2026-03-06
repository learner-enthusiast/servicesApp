# 🏠 BookLocal — Local Services Marketplace

> **Find Trusted Local Services Near You.**

A full-stack MERN application that connects **customers** with **local service providers** — from plumbing to photography. Built for hackathon with AI-powered features, geolocation search, real-time booking management, and a review system with before/after photo evidence.

---

## 📑 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Team](#-team)

---

## 🎯 Problem Statement

Finding reliable local service providers (plumbers, electricians, cleaners, tutors, etc.) is often a frustrating experience — scattered across WhatsApp groups, word-of-mouth, and unreliable directories. Customers lack:

- **Transparent pricing** and service comparison
- **Verified reviews** with visual proof of work
- **Easy booking and scheduling** with real-time status tracking
- **Location-based discovery** of nearby providers

Service providers, on the other hand, struggle with:

- **Online presence** and customer acquisition
- **Booking management** and scheduling
- **Competitive pricing** insights

## 💡 Solution

**BookLocal** is a marketplace that solves both sides:

| For Customers                             | For Service Providers                  |
| ----------------------------------------- | -------------------------------------- |
| 🔍 Search services by type & location     | 📋 Create and manage service listings  |
| 📍 Geolocation-based nearby discovery     | 🤖 AI-generated descriptions & pricing |
| 📅 Book, reschedule, or cancel with ease  | 📊 View and manage incoming bookings   |
| ⭐ Leave reviews with before/after photos | 🖼️ Showcase work via listing photos    |
| 🗺️ Mapbox-powered location search         | 📈 Competitive pricing insights        |

---

## 🛠️ Tech Stack

### Frontend

| Technology               | Purpose                      |
| ------------------------ | ---------------------------- |
| **React 19**             | UI framework                 |
| **TypeScript**           | Type safety                  |
| **React Router v7**      | Client-side routing          |
| **Zustand**              | Lightweight state management |
| **Tailwind CSS 3**       | Utility-first styling        |
| **Material UI (MUI) v6** | Component library            |
| **Lucide React**         | Icon library                 |
| **Axios**                | HTTP client                  |

### Backend

| Technology                  | Purpose                     |
| --------------------------- | --------------------------- |
| **Node.js + Express**       | REST API server             |
| **TypeScript**              | Type safety                 |
| **MongoDB + Mongoose**      | Database & ODM              |
| **JWT**                     | Authentication              |
| **bcrypt**                  | Password hashing            |
| **Joi**                     | Request validation          |
| **Multer**                  | File upload handling        |
| **Cloudinary**              | Cloud image storage         |
| **Mapbox API**              | Geocoding & location search |
| **Google Gemini 2.0 Flash** | AI-powered suggestions      |

---

## 🏗️ Architecture

```
┌─────────────────────┐         ┌─────────────────────────────┐
│                     │  HTTP   │                             │
│   React Frontend    │◄───────►│     Express REST API        │
│   (Port 3000)       │         │     (Port 3001)             │
│                     │         │                             │
│  ┌───────────────┐  │         │  ┌────────┐  ┌───────────┐ │
│  │ Zustand Store │  │         │  │  JWT   │  │   Joi     │ │
│  │ Auth Context  │  │         │  │  Auth  │  │ Validate  │ │
│  │ React Router  │  │         │  └────┬───┘  └─────┬─────┘ │
│  └───────────────┘  │         │       │            │        │
└─────────────────────┘         │  ┌────▼────────────▼─────┐  │
                                │  │     Controllers       │  │
                                │  │  Auth | Booking |     │  │
                                │  │  Listing | Review |   │  │
                                │  │  Location | AI        │  │
                                │  └────┬──────────────────┘  │
                                │       │                     │
                                └───────┼─────────────────────┘
                                        │
                    ┌───────────────┬────┴────┬────────────────┐
                    │               │         │                │
               ┌────▼────┐   ┌─────▼───┐ ┌───▼─────┐   ┌─────▼─────┐
               │ MongoDB │   │Cloudinary│ │ Mapbox  │   │  Gemini   │
               │ Atlas   │   │  Images  │ │Geocoding│   │  AI API   │
               └─────────┘   └─────────┘ └─────────┘   └───────────┘
```

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication with bearer token
- Role-based access control: **User** and **Admin**
- User types: **Customer** and **Service Provider**
- Protected routes on both frontend and backend
- Token-based auto-login

### 📋 Listings (Service Providers)

- Create listings with name, description, price, service type, location, and photos
- 40+ service categories (Plumbing, Electrical, Cleaning, Salon, Photography, etc.)
- Upload up to **5 photos** per listing via Cloudinary
- Toggle listing status (Active / Inactive)
- Request listing deletion (admin approval flow)
- **Geospatial indexing** (2dsphere) for location-based queries
- View own listings with pagination

### 📍 Location & Geosearch

- **Mapbox-powered** place autocomplete search
- Reverse geocoding (coordinates → address)
- Nearby service discovery using MongoDB `$geoNear` aggregation
- Location-aware search with configurable radius

### 📅 Bookings (Customers)

- Book a service with a preferred scheduled date
- Booking status lifecycle:
  ```
  REQUESTED → CONFIRMED → IN_PROGRESS → COMPLETED
       │
       ├── CANCELLED (by customer or provider)
       └── RESCHEDULED → RESCHEDULEDANDAPPROVED
  ```
- Reschedule bookings (with count tracking and original date preservation)
- Cancel bookings with reason tracking (who cancelled)
- View booking details with listing name via aggregation pipeline
- Service providers can approve, confirm, and complete bookings

### ⭐ Reviews & Ratings

- Customers can leave reviews after booking completion
- Star rating (1–5) with description
- **Before/After photo evidence** (max 2 each) uploaded to Cloudinary
- Replace individual photos without losing position
- Reviews aggregated with user details (username, photo) via MongoDB pipeline
- Listing-level review fetching by `listingId`

### 🤖 AI-Powered Features (Google Gemini)

- **Description Suggestions**: Generate 3 professional, SEO-friendly listing descriptions based on service type and location
- **Pricing Suggestions**: AI analyzes competitor listings in the area and suggests Budget / Standard / Premium pricing tiers with reasoning

### 👤 Role-Based Dashboards

| Role                 | Dashboard Features                                        |
| -------------------- | --------------------------------------------------------- |
| **Customer**         | Browse listings, manage bookings, leave reviews           |
| **Service Provider** | Manage listings, handle incoming bookings, AI suggestions |
| **Admin**            | View all reviews, approve/reject listing deletions        |

---

## 📸 Screenshots

> _Add screenshots here_

| Landing Page                        | Dashboard                               | Listing Detail                      |
| ----------------------------------- | --------------------------------------- | ----------------------------------- |
| ![Landing](screenshots/landing.png) | ![Dashboard](screenshots/dashboard.png) | ![Listing](screenshots/listing.png) |

| Booking Detail                      | Review with Photos                | AI Suggestions            |
| ----------------------------------- | --------------------------------- | ------------------------- |
| ![Booking](screenshots/booking.png) | ![Review](screenshots/review.png) | ![AI](screenshots/ai.png) |

---

## 📡 API Documentation

### Base URL

```
http://localhost:3001
```

### Authentication

| Method | Endpoint                 | Description            | Auth |
| ------ | ------------------------ | ---------------------- | ---- |
| `POST` | `/auth/register`         | Register a new account | ❌   |
| `POST` | `/auth/login`            | Login with credentials | ❌   |
| `GET`  | `/auth/login-with-token` | Auto-login with JWT    | ✅   |

### Listings

| Method  | Endpoint                      | Description                     | Auth | Role             |
| ------- | ----------------------------- | ------------------------------- | ---- | ---------------- |
| `GET`   | `/listing`                    | Get all listings (with filters) | ✅   | Any              |
| `GET`   | `/listing/me`                 | Get my listings                 | ✅   | Service Provider |
| `GET`   | `/listing/:id`                | Get listing by ID               | ✅   | Any              |
| `POST`  | `/listing`                    | Create listing (with photos)    | ✅   | Service Provider |
| `PUT`   | `/listing/:id`                | Update listing                  | ✅   | Service Provider |
| `PATCH` | `/listing/:id/images`         | Update listing images           | ✅   | Any              |
| `PATCH` | `/listing/:id/status`         | Toggle active/inactive          | ✅   | Service Provider |
| `PATCH` | `/listing/:id/request-delete` | Request deletion                | ✅   | Service Provider |
| `PATCH` | `/listing/:id/review-delete`  | Approve/reject deletion         | ✅   | Admin            |
| `GET`   | `/listing/deletion-requests`  | Get all deletion requests       | ✅   | Admin            |

### Bookings

| Method  | Endpoint                          | Description                | Auth | Role                |
| ------- | --------------------------------- | -------------------------- | ---- | ------------------- |
| `POST`  | `/booking`                        | Create a booking           | ✅   | Customer            |
| `GET`   | `/booking/me`                     | Get my bookings (customer) | ✅   | Customer            |
| `GET`   | `/booking/sp/me`                  | Get my bookings (provider) | ✅   | Service Provider    |
| `GET`   | `/booking/:id`                    | Get booking by ID          | ✅   | Any                 |
| `PATCH` | `/booking/:id/cancel`             | Cancel a booking           | ✅   | Customer / Provider |
| `PATCH` | `/booking/:id/approve`            | Approve a booking          | ✅   | Service Provider    |
| `PATCH` | `/booking/:id/reschedule`         | Reschedule a booking       | ✅   | Customer            |
| `PATCH` | `/booking/:id/approve-reschedule` | Approve reschedule         | ✅   | Service Provider    |

### Reviews

| Method   | Endpoint                           | Description                  | Auth | Role     |
| -------- | ---------------------------------- | ---------------------------- | ---- | -------- |
| `GET`    | `/review`                          | Get all reviews              | ✅   | Admin    |
| `GET`    | `/review/:id`                      | Get review by ID             | ✅   | Any      |
| `GET`    | `/review/listing/:listingId`       | Get reviews by listing       | ✅   | Any      |
| `POST`   | `/review`                          | Create a review              | ✅   | Customer |
| `PUT`    | `/review/:id`                      | Update a review              | ✅   | Customer |
| `DELETE` | `/review/:id`                      | Delete a review              | ✅   | Admin    |
| `POST`   | `/review/:id/before-photos`        | Upload before photos (max 2) | ✅   | Customer |
| `POST`   | `/review/:id/after-photos`         | Upload after photos (max 2)  | ✅   | Customer |
| `PATCH`  | `/review/:id/before-photos/:index` | Replace a before photo       | ✅   | Customer |
| `PATCH`  | `/review/:id/after-photos/:index`  | Replace an after photo       | ✅   | Customer |

### Location

| Method | Endpoint                | Description                 | Auth |
| ------ | ----------------------- | --------------------------- | ---- |
| `GET`  | `/location/suggestions` | Place autocomplete (Mapbox) | ✅   |
| `GET`  | `/location/reverse`     | Reverse geocode coordinates | ✅   |

### AI

| Method | Endpoint                      | Description             | Auth |
| ------ | ----------------------------- | ----------------------- | ---- |
| `POST` | `/api/ai/suggest-description` | AI listing descriptions | ✅   |
| `POST` | `/api/ai/suggest-pricing`     | AI pricing suggestions  | ✅   |

---

## 🗄️ Database Schema

```
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│   Account    │       │   Listing     │       │   Booking    │
├──────────────┤       ├───────────────┤       ├──────────────┤
│ username     │──┐    │ name          │    ┌──│ listingId    │
│ password     │  │    │ description   │    │  │ customerId   │──┐
│ role         │  │    │ serviceType   │    │  │ status       │  │
│ type         │  ├───►│ userId        │◄───┘  │ finalPrice   │  │
│ defaultLoc   │  │    │ geoLocation   │       │ scheduledDate│  │
│ photo        │  │    │ price         │       │ reviewId     │──┼──┐
│ bookingIds[] │  │    │ ratings       │       │ reschedule   │  │  │
│ listingIds[] │  │    │ photos[]      │       │ cancelledBy  │  │  │
└──────────────┘  │    │ status        │       └──────────────┘  │  │
                  │    │ bookingIds[]  │                         │  │
                  │    │ reviewIds[]   │       ┌──────────────┐  │  │
                  │    │ deletionReq   │       │   Review     │  │  │
                  │    └───────────────┘       ├──────────────┤  │  │
                  │                            │ listingId    │  │  │
                  │                            │ bookingId    │  │  │
                  └───────────────────────────►│ userId       │◄─┘  │
                                               │ description  │◄────┘
                                               │ stars (1-5)  │
                                               │ beforePhotos│
                                               │ afterPhotos │
                                               └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** (Atlas or local Community Server)
- **Cloudinary** account (for image uploads)
- **Mapbox** account (for location services)
- **Google AI Studio** API key (for Gemini AI features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-team/booklocal.git
cd booklocal

# 2. Install server dependencies
cd server
npm install

# 3. Install client dependencies
cd ../client
npm install
```

### Configuration

```bash
# 4. Create environment file
cp server/.env.example server/.env
# Edit server/.env with your credentials (see Environment Variables below)
```

### Running

```bash
# Terminal 1 — Start the server
cd server
npm run dev
# ✅ Server is listening on port: 3001

# Terminal 2 — Start the client
cd client
npm run dev
# ✅ Client is running on http://localhost:3000
```

### Building for Production

```bash
# Build server
cd server
npm run build
npm start

# Build client
cd client
npm run build
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=3001
ORIGIN=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db_name>

# JWT
JWT_SECRET=your_jwt_secret_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mapbox
MAPBOX_ACCESS_TOKEN=your_mapbox_token
MAPBOX_BASE_URL=https://api.mapbox.com

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📁 Project Structure

```
booklocal/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── @types/                  # TypeScript interfaces
│   │   ├── components/
│   │   │   ├── AuthModal.tsx        # Login/Register modal
│   │   │   ├── CreateListingForm.tsx# New listing form
│   │   │   ├── Header.tsx           # App header/navbar
│   │   │   ├── ListingCard.tsx      # Listing preview card
│   │   │   ├── LocationSearch.tsx   # Mapbox location autocomplete
│   │   │   ├── MyListings.tsx       # Provider's listings grid
│   │   │   ├── OnlineIndicator.tsx  # Online status indicator
│   │   │   ├── Pagination.tsx       # Pagination controls
│   │   │   ├── ProtectedRoute.tsx   # Auth guard
│   │   │   ├── SearchBarComponent.tsx
│   │   │   └── UserMyBookings.tsx   # Customer's bookings list
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Auth state provider
│   │   ├── hooks/
│   │   │   └── useLocalStorage.ts   # LocalStorage hook
│   │   ├── pages/
│   │   │   ├── Admin.tsx            # Admin dashboard
│   │   │   ├── Customer.tsx         # Customer dashboard
│   │   │   ├── Dashboard.tsx        # Role-based dashboard router
│   │   │   ├── IndividualBookingPage.tsx
│   │   │   ├── IndividualListingPage.tsx
│   │   │   └── ServiceProvider.tsx  # Provider dashboard
│   │   ├── store/
│   │   │   ├── useModalStore.ts     # Modal state (Zustand)
│   │   │   └── useNavigationStore.ts
│   │   ├── utils/
│   │   │   ├── api.ts              # All API functions
│   │   │   ├── axios.ts            # Axios instance config
│   │   │   └── enum.ts             # Frontend enums
│   │   └── App.tsx                  # Root component & routes
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── @types/
│   │   │   ├── index.ts            # Shared interfaces
│   │   │   └── express.d.ts        # Express type extensions
│   │   ├── constants/
│   │   │   └── index.ts            # Environment config
│   │   ├── controllers/
│   │   │   ├── ai.ts               # Gemini AI suggestions
│   │   │   ├── auth/
│   │   │   │   ├── login.ts
│   │   │   │   ├── login-with-token.ts
│   │   │   │   └── register.ts
│   │   │   ├── booking.ts          # Booking CRUD + actions
│   │   │   ├── listings.ts         # Listing CRUD + geosearch
│   │   │   ├── location.ts         # Mapbox geocoding
│   │   │   └── reviews.ts          # Review CRUD + photo upload
│   │   ├── middlewares/
│   │   │   ├── check-bearer-token.ts
│   │   │   ├── check-roles.ts
│   │   │   ├── check-userType.ts
│   │   │   ├── error-handler.ts
│   │   │   └── multer.ts           # File upload config
│   │   ├── models/
│   │   │   ├── Account.ts          # User model
│   │   │   ├── Bookings.ts         # Booking model
│   │   │   ├── Listings.ts         # Listing model (2dsphere)
│   │   │   └── Review.ts           # Review model
│   │   ├── routes/
│   │   │   ├── ai.ts
│   │   │   ├── auth.ts
│   │   │   ├── bookings.ts
│   │   │   ├── listings.ts
│   │   │   ├── location.ts
│   │   │   └── reviews.ts
│   │   ├── seed/
│   │   │   └── seed.ts             # Database seeder
│   │   ├── utils/
│   │   │   ├── app.ts              # Express app setup
│   │   │   ├── cloudinary.ts       # Cloudinary upload/delete
│   │   │   ├── crypt.ts            # bcrypt helpers
│   │   │   ├── enums.ts            # All enums
│   │   │   ├── joi.ts              # Validation schemas
│   │   │   ├── jwt.ts              # JWT sign/verify
│   │   │   └── mongo.ts            # MongoDB connection
│   │   └── index.ts                # Server entry point
│   └── package.json
│
└── package.json                     # Root package
```

---

## 🧪 Service Categories

BookLocal supports **40+ service types** across 7 categories:

| Category                 | Services                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🏠 **Home Services**     | Plumbing, Electrical, Carpentry, Painting, Cleaning, Appliance Repair, Pest Control, AC Service, Geyser Repair, Chimney Cleaning, Water Purifier, Inverter Battery |
| 💇 **Personal Care**     | Men's Salon, Women's Salon, Massage Therapy, Mehendi                                                                                                               |
| 🏥 **Health & Wellness** | Physiotherapy, Doctor Home Visit, Nurse/Caretaker, Dietician                                                                                                       |
| 📚 **Education**         | Home Tutor, Music Classes, Spoken English                                                                                                                          |
| 🚗 **Vehicles**          | Car Washing, Bike Service, Puncture Repair, Driving Lessons                                                                                                        |
| 🎉 **Events & Misc**     | Photography, Catering, Tent & Decoration, DJ/Sound, Packers & Movers, Courier Pickup                                                                               |
| 🔨 **Construction**      | Tiling, False Ceiling, Waterproofing, Interior Design                                                                                                              |

---

## 🤖 AI Features Deep Dive

### Description Generator

- Input: Service type + optional location
- Output: 3 unique, professional, SEO-friendly descriptions
- Model: Google Gemini 2.0 Flash

### Pricing Advisor

- Analyzes competitor listings within configurable radius using `$geoNear`
- Provides competitor stats (count, min, max, average price)
- Suggests **3 pricing tiers**: Budget, Standard, Premium
- Each tier includes a price and reasoning

---

## 👥 Team

| Name          | Role                 | GitHub                                         |
| ------------- | -------------------- | ---------------------------------------------- |
| Your Name     | Full Stack Developer | [@your-github](https://github.com/your-github) |
| Team Member 2 | Frontend Developer   | [@member2](https://github.com/member2)         |
| Team Member 3 | Backend Developer    | [@member3](https://github.com/member3)         |

---

## 📄 License

This project was built for **[Hackathon Name]** — March 2026.

---

<p align="center">
  Built with ❤️ using MERN Stack + AI
</p>
