import { Router } from 'express';
import { signup, signin, signout } from '../controllers/AuthController.js';
import { verifyAuth } from '../middleware/verifyAuth.js';
const router = Router();
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/logout', verifyAuth, signout);
export default router;
