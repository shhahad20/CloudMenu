import express from 'express';
const router = express.Router();
// Routes for items
router.get('/:userId');
router.get('/:userId/:name');
router.post('/:userId/add-item');
router.put('/:userId/:id');
router.delete('/:userId/:id');
export default router;
