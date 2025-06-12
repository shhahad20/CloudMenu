import express from "express";
import {
  handleCheckoutSessionCompleted,
  stripeWebhook,
} from "../controllers/WebhookController.js";
import { stripe } from "../config/stripe.js";

const router = express.Router();

// Stripe requires the raw body so no JSON parser here
router.post("/", stripeWebhook);



export default router;
