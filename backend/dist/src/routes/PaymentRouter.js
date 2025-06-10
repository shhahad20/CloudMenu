import express from "express";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyPayment } from "../controllers/PaymentController.js";
const router = express.Router();
router.get("/verify", verifyAuth, verifyPayment);
export default router;
