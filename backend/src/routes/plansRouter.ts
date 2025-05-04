import express from 'express';

import { requireAdmin } from '../middleware/requireAdmin.js';
import { getPlans, updatePlan } from '../controllers/plansController.js';

const router = express.Router();

// router.get('/', requireAuth, getPlans);
// router.put('/:name', requireAuth, requireAdmin, updatePlan);

router.get('/', getPlans);
router.put('/:name', requireAdmin, updatePlan);

export default router;
