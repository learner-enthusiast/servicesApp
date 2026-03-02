import { Router } from 'express';
import {
  getPlaceSuggestions,
  getCoordinates,
  getAddressFromCoordinates,
  getNearbyListings,
} from '../controllers/location';
import checkBearerToken from '../middlewares/check-bearer-token';
import errorHandler from '../middlewares/error-handler';

const router = Router();

router.use(checkBearerToken);

// GET /location/suggestions?query=new+york
router.get('/suggestions', getPlaceSuggestions);

// GET /location/coordinates?address=new+york+city
router.get('/coordinates', getCoordinates);

// GET /location/reverse?longitude=-73.9857&latitude=40.7484
router.get('/reverse', getAddressFromCoordinates);

// GET /location/nearby?longitude=-73.9857&latitude=40.7484&radius=10
router.get('/nearby', getNearbyListings);

router.use(errorHandler);

export default router;
