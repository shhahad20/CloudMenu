import express from 'express';

import { requireAdmin } from '../middleware/requireAdmin.js';
import { getPlans, updatePlan } from '../controllers/PlansController.js';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { updateMyPlan } from '../controllers/ProfileController.js';

const router = express.Router();

// router.get('/', requireAuth, getPlans);
// router.put('/:name', requireAuth, requireAdmin, updatePlan);

router.get('/', getPlans);
router.put('/:name', requireAdmin, updatePlan);


router.patch(
    '/me/plan',
    verifyAuth,
    updateMyPlan
  );

export default router;
