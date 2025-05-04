// src/routes/checkout.ts
import express from 'express';
import { createCheckoutSession } from '../controllers/CheckoutController.js';
import { AuthRequest, verifyAuth } from '../middleware/verifyAuth.js';

const router = express.Router();

/**
 * POST /api/checkout
 * Body:
 *   {
 *     items: [{ id, name, price, quantity }],
 *     currency: 'USD' | 'SAR'
 *   }
 * Returns:
 *   { url: string } – redirect the user to this Stripe Checkout page
 */
router.post(
    "/",
    verifyAuth,                       // ← use your verifyAuth middleware
    async (req: AuthRequest, res) => {
      // now req.user is guaranteed
      return createCheckoutSession(req, res);
    }
  );
export default router;
