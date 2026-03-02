import { Router } from 'express';
import {
  createReview,
  updateReview,
  getAllReviews,
  getReviewById,
  deleteReview,
} from '../controllers/reviews';
import checkRole from '../middlewares/check-roles';
import errorHandler from '../middlewares/error-handler';
import checkBearerToken from '../middlewares/check-bearer-token';
import checkUserType from '../middlewares/check-userType';

const router = Router();
router.use(checkBearerToken);
// Get all reviews
router.get('/', checkRole('admin'), getAllReviews);

// Get a single review by ID
router.get('/:id', getReviewById);

// Create a new review (user only)
router.post('/', checkRole('user'), checkUserType('CUSTOMER'), createReview);

// Update a review (user only)
router.put('/:id', checkRole('user'), checkUserType('CUSTOMER'), updateReview);

// Delete a review (user only)
router.delete('/:id', deleteReview);
router.use(errorHandler);

export default router;
