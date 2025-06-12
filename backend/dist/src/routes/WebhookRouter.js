import express from "express";
import { stripeWebhook, } from "../controllers/WebhookController.js";
const router = express.Router();
// Stripe requires the raw body so no JSON parser here
router.post("/", stripeWebhook);
export default router;
