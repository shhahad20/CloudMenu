import express from 'express';
import * as SectionController from '../../controllers/menuControllers/SectionController.js';
const router = express.Router();
router.get('/', SectionController.getMenuSections);
router.get('/:id');
router.post('/');
router.put('/:id');
router.delete('/:id');
export default router;
