import dotenv from 'dotenv';
import 'dotenv/config';
dotenv.config();
import app from './utils/app'; // (server)
import mongo from './utils/mongo'; // (database)
import { PORT } from './constants/index';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import listingRoutes from './routes/listings';
import reviewRoutes from './routes/reviews';
import locationRoutes from './routes/location';
const bootstrap = async () => {
  await mongo.connect();
  app.get('/', (req, res) => {
    res.status(200).send('Hello, world!');
  });

  app.get('/healthz', (req, res) => {
    res.status(204).end();
  });

  app.use('/auth', authRoutes);
  app.use('/booking', bookingRoutes);
  app.use('/listing', listingRoutes);
  app.use('/review', reviewRoutes);
  app.use('/location', locationRoutes);
  // add rest of routes here...

  app.listen(PORT, () => {
    console.log(`✅ Server is listening on port: ${PORT}`);
  });
};

bootstrap();
