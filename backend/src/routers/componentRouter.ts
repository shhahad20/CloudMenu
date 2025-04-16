import express from "express";
import { isLoggedIn } from "../middleware/authentication.js";
import {
  createComp,
  deleteCompData,
  getCompById,
  getCompData,
  updateComp,
} from "../controllers/componentControllers/simpleCompController.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = express.Router();

router.get("/", isLoggedIn, getCompData);
router.get("/:id", isLoggedIn, getCompById);

router.post("/", isLoggedIn, uploadMiddleware, createComp);
router.delete("/:id", isLoggedIn, deleteCompData);
router.put("/:id", isLoggedIn,uploadMiddleware, updateComp);

export default router;
