import { Router } from 'express';
import { verifyAuth } from '../middleware/verifyAuth';
import { recordTemplateView } from '../controllers/TemplateController.js';


const router = Router();


// router.post('/:id/view', verifyAuth, recordTemplateView)

export default router;
