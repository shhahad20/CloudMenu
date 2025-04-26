import { Router } from 'express';
import { signup, signin, signout, forgotPassword, resetPassword, confirmEmail } from '../controllers/AuthController.js';
import { verifyAuth } from '../middleware/verifyAuth.js';
const router = Router();
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/logout', verifyAuth, signout);
router.post('/forgot-password', forgotPassword);
// Note: no verifyAuth here—the reset link token is a one-time recovery token
router.post('/reset-password', resetPassword);
router.get('/confirm-email', confirmEmail);
export default router;
