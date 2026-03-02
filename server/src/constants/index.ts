const PORT = process.env.PORT || 8080;

// For "MongoDB Atlas": edit MONGO_URI in -> .env file
// For "MongoDB Community Server": edit <DB_NAME> in -> MONGO_URI below
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/<DB_NAME>';
const MONGO_OPTIONS = {};
const ORIGIN = process.env.ORIGIN;
const JWT_SECRET = process.env.JWT_SECRET || 'unsafe_secret';
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
const MAPBOX_BASE_URL = process.env.MAPBOX_BASE_URL || 'https://api.mapbox.com';

export { ORIGIN, PORT, MONGO_URI, MONGO_OPTIONS, JWT_SECRET, MAPBOX_ACCESS_TOKEN, MAPBOX_BASE_URL };
