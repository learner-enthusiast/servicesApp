import { Router } from 'express';
import {
  createListing,
  updateListing,
  getAllListings,
  getListingById,
  requestDeleteListing,
  reviewDeleteListing,
  getDeletionRequests,
  getMyListings,
  updateListingStatus,
  updateListingImages,
} from '../controllers/listings';
import checkUserType from '../middlewares/check-userType';
import errorHandler from '../middlewares/error-handler';
import checkBearerToken from '../middlewares/check-bearer-token';
import checkRole from '../middlewares/check-roles';
import { multerUpload } from '../middlewares/multer';

const router = Router();
router.use(checkBearerToken);
router.patch('/:id/review-delete', checkRole('ADMIN'), reviewDeleteListing);
router.get('/deletion-requests', checkRole('ADMIN'), getDeletionRequests);
// Get all listings
router.get('/', getAllListings);
router.get('/me', getMyListings);

// Get a single listing by ID
router.get('/:id', getListingById);
router.patch('/:id/images', multerUpload.array('photos', 5), updateListingImages);
// Create a new listing (admin or user)
router.use(checkUserType('SERVICE_PROVIDER'));
router.post('/', multerUpload.array('photos', 5), createListing);

// Update a listing (admin or user)
router.put('/:id', updateListing);

// Delete a listing (admin only)
router.patch('/:id/request-delete', requestDeleteListing);
router.patch('/:id/status', updateListingStatus);

router.use(errorHandler);
export default router;
