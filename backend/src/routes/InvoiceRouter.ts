import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { listInvoices, getInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/', verifyAuth, listInvoices);
router.get('/:id', verifyAuth, getInvoice);

export default router;
