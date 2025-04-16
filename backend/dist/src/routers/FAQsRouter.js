import express from 'express';
import { isLoggedIn } from '../middleware/authentication.js';
import { isSuperAdmin } from '../middleware/superAdmin.js';
import { createFAQ, deleteFAQ, getAllFAQs, getFAQById, updateFAQ } from '../controllers/FAQsController.js';
import { isAdmin } from '../middleware/admin.js';
const router = express.Router();
// Routes for FAQs
router.get('/', getAllFAQs);
router.get('/:id', getFAQById);
router.post('/add-faq', isLoggedIn, isSuperAdmin || isAdmin, createFAQ);
router.put('/:id', isLoggedIn, isSuperAdmin || isAdmin, updateFAQ);
router.delete('/:id', isLoggedIn, isSuperAdmin || isAdmin, deleteFAQ);
export default router;
