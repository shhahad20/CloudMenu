import { Router } from 'express';
import { signup, signin } from '../controllers/AuthController.js';
const router = Router();
// POST /auth/signup
router.post('/signup', signup);
// POST /auth/signin
router.post('/signin', signin);
export default router;
