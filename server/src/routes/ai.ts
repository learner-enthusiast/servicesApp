import { Router } from 'express';
import { suggestDescription, suggestPricing } from '../controllers/ai';
import checkBearerToken from '../middlewares/check-bearer-token';

const router = Router();
router.use(checkBearerToken);
router.post('/suggest-description', suggestDescription);
router.post('/suggest-pricing', suggestPricing);

export default router;
