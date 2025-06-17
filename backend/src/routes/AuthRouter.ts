import { Router } from 'express';
import { signup, signin, signout, forgotPassword, resetPassword, confirmEmail, changeUserRole, deleteUser, updateUser, refreshToken } from '../controllers/AuthController.js';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// PUBLIC ROUTES
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh-token', refreshToken); // <- NEW!
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',    resetPassword);
router.get('/confirm-email', confirmEmail);

// PROTECTED ROUTES
router.get('/logout', verifyAuth,signout); 
// For partial updates to user roles, we use PATCH instead of PUT
// because we are not replacing the entire user object, just updating a field
router.patch(
    '/users/:id/role',
    verifyAuth,
    requireAdmin,
    changeUserRole
  );
  router.patch(
    '/users/:id',
    verifyAuth,
    updateUser
  );
  router.delete(
    '/users/:id',
    verifyAuth,
    requireAdmin,
    deleteUser
  );
export default router;
