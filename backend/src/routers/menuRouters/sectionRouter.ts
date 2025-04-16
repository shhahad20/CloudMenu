import express from 'express';
import * as SectionController from '../../controllers/menuControllers/SectionController.js';
import { isLoggedIn } from '../../middleware/authentication.js';

const router = express.Router();

router.get('/',isLoggedIn, SectionController.getMenuSections );
router.get('/:id', isLoggedIn,SectionController.getMenuSection);
router.get('/all/:id', isLoggedIn,SectionController.getMenuSectionsOfTemplate);

router.post('/',isLoggedIn, SectionController.createSection);
router.put('/',isLoggedIn, SectionController.updateMeunSection);
router.delete('/:id',isLoggedIn, SectionController.deleteMenuSection);

export default router;
