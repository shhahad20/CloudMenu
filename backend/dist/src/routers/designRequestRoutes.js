import express from "express";
import { createRequest } from "../controllers/designRequestController.js";
import { isLoggedIn } from "../middleware/authentication.js";
const router = express.Router();
// POST request to create a new design request
router.post("/", isLoggedIn, createRequest);
export default router;
