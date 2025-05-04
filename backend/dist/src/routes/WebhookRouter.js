// src/routes/webhook.ts
import express from 'express';
import { stripeWebhook } from '../controllers/WebhookController.js';
const router = express.Router();
// Stripe requires the raw body so no JSON parser here
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
export default router;
