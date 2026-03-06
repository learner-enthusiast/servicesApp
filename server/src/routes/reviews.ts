import { Router } from 'express';
import {
  createReview,
  updateReview,
  getAllReviews,
  getReviewById,
  getReviewsByListingId,
  deleteReview,
  uploadBeforePhotos,
  uploadAfterPhotos,
  replaceBeforePhoto,
  replaceAfterPhoto,
} from '../controllers/reviews';
import checkRole from '../middlewares/check-roles';
import errorHandler from '../middlewares/error-handler';
import checkBearerToken from '../middlewares/check-bearer-token';
import checkUserType from '../middlewares/check-userType';
import { multerUpload } from '../middlewares/multer';

const router = Router();
router.use(checkBearerToken);

// Get all reviews
router.get('/', checkRole('ADMIN'), getAllReviews);

// Get all reviews by listing ID
router.get('/listing/:listingId', getReviewsByListingId);

// Upload before photos (max 2)
router.post(
  '/:id/before-photos',
  checkRole('USER'),
  checkUserType('CUSTOMER'),
  multerUpload.array('photos', 2),
  uploadBeforePhotos
);

// Upload after photos (max 2)
router.post(
  '/:id/after-photos',
  checkRole('USER'),
  checkUserType('CUSTOMER'),
  multerUpload.array('photos', 2),
  uploadAfterPhotos
);

// Replace a specific before photo by index
router.patch(
  '/:id/before-photos/:photoIndex',
  checkRole('USER'),
  checkUserType('CUSTOMER'),
  multerUpload.array('photos', 1),
  replaceBeforePhoto
);

// Replace a specific after photo by index
router.patch(
  '/:id/after-photos/:photoIndex',
  checkRole('USER'),
  checkUserType('CUSTOMER'),
  multerUpload.array('photos', 1),
  replaceAfterPhoto
);

// Get a single review by ID
router.get('/:id', getReviewById);

// Create a new review (user only)
router.post('/', checkRole('USER'), checkUserType('CUSTOMER'), createReview);

// Update a review (user only)
router.put('/:id', checkRole('USER'), checkUserType('CUSTOMER'), updateReview);

// Delete a review (admin only)
router.delete('/:id', checkRole('ADMIN'), deleteReview);

router.use(errorHandler);

export default router;
