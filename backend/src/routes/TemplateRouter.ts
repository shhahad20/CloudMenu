import { Router } from "express";
import {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
  listLibraryTemplates,
  listUserTemplates,
  getLibraryTemplate,
  recordTemplateView,
  recordLibraryView,
} from "../controllers/TemplateController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = Router();
router.get("/lib", listLibraryTemplates);
router.get("/lib/:id", getLibraryTemplate);
router.post('/lib/:id/view', recordLibraryView)
// Protect all routes below this middleware
router.use(verifyAuth);

router.get("/", listUserTemplates);

router.post("/", uploadMiddleware, createTemplate);
router.get("/:id", getTemplate);
router.patch("/:id", uploadMiddleware, updateTemplate);
router.delete("/:id", deleteTemplate);

router.post("/clone/:libraryId", verifyAuth, cloneTemplate);


router.post('/:id/view', verifyAuth, recordTemplateView)


export default router;
