import express from 'express';
import { sendContact } from '../controllers/ContactController.js';

const router = express.Router();


router.post('/', sendContact);

export default router;
