import express from 'express';
import { createPricing, deletePricing, getPricing, getPricingById, updatePricing } from '../controllers/pricingController.js';
import { isLoggedIn } from '../middleware/authentication.js';
import { isSuperAdmin } from '../middleware/superAdmin.js';

const router = express.Router();

// Routes for pricing
router.get('/', getPricing);
router.get('/:id/:name?', getPricingById);
router.post('/add-pricing', isLoggedIn, isSuperAdmin, createPricing);
router.put('/:id',isLoggedIn, isSuperAdmin, updatePricing);
router.delete('/:id',isLoggedIn, isSuperAdmin, deletePricing);

export default router;
 