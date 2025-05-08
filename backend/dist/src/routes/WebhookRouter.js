import express from "express";
import { stripeWebhook, } from "../controllers/WebhookController.js";
const router = express.Router();
// Stripe requires the raw body so no JSON parser here
router.post("/", express.raw({ type: 'application/json' }), stripeWebhook);
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
// router.post(
//   '/',
//   express.raw({ type: 'application/json' }),
//   async (req, res) => {
//     const sig = req.headers['stripe-signature'] as string;
//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err: any) {
//       console.error('Webhook signature verification failed.', err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
//     // Only handle checkout.session.completed
//     if (event.type === 'checkout.session.completed') {
//       await handleCheckoutSessionCompleted(event.data.object as any);
//     }
//     res.json({ received: true });
//   }
// );
export default router;
