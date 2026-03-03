import express from 'express';
import checkBearerToken from '../middlewares/check-bearer-token';
import errorHandler from '../middlewares/error-handler';
import register from '../controllers/auth/register';
import login from '../controllers/auth/login';
import loginWithToken from '../controllers/auth/login-with-token';
import { multerUpload } from '../middlewares/multer';

// initialize router
const router = express.Router();

// POST at route: http://localhost:8080/auth/register
router.post('/register', multerUpload.single('image'), register);

// POST at path: http://localhost:8080/auth/login
router.post('/login', [], login);

// GET at path: http://localhost:8080/auth/account
router.get('/login', [checkBearerToken], loginWithToken);

router.use(errorHandler);

export default router;
