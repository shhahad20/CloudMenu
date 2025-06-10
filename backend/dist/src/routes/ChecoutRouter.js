import express from "express";
import { createCheckoutSession, getSession, } from "../controllers/CheckoutController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
const router = express.Router();
router.post("/session", verifyAuth, createCheckoutSession);
router.get("/session/:id", getSession);
export default router;
