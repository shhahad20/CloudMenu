import express from 'express';
import { isLoggedIn } from '../middleware/authentication.js';
import { isSuperAdmin } from '../middleware/superAdmin.js';
import { copyMenuTemplate, createMenu, deleteMenu, getAllMenuTemplates, getAllUserMenus, getMenuById, updateMenu } from '../controllers/menuController.js';
const router = express.Router();
// Routes for Menus
router.get('/', getAllMenuTemplates);
router.get('/my-menus', isLoggedIn, getAllUserMenus);
router.get('/:id', getMenuById);
router.post('/add-menu', isLoggedIn, isSuperAdmin, createMenu);
router.put('/:id', isLoggedIn, updateMenu);
router.delete('/:id', isLoggedIn, deleteMenu);
router.post('/copy-template', isLoggedIn, copyMenuTemplate);
export default router;
