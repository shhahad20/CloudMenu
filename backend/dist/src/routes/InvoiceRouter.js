import express from 'express';
import { verifyAuth } from '../middleware/verifyAuth.js';
import { listInvoices, getInvoice, createInvoice } from '../controllers/InvoiceController.js';
const router = express.Router();
router.get('/', verifyAuth, listInvoices);
router.get('/:id', verifyAuth, getInvoice);
router.post('/', verifyAuth, createInvoice);
export default router;
