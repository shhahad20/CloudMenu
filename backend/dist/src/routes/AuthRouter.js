import { Router } from 'express';
import { signup, signin, signout, forgotPassword, resetPassword, confirmEmail, changeUserRole, deleteUser } from '../controllers/AuthController.js';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
const router = Router();
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/logout', verifyAuth, signout);
router.post('/forgot-password', forgotPassword);
// Note: no verifyAuth here—the reset link token is a one-time recovery token
router.post('/reset-password', resetPassword);
router.get('/confirm-email', confirmEmail);
// For partial updates to user roles, we use PATCH instead of PUT
// because we are not replacing the entire user object, just updating a field
router.patch('/users/:id/role', verifyAuth, requireAdmin, changeUserRole);
router.delete('/users/:id', verifyAuth, requireAdmin, deleteUser);
export default router;
