import express from 'express';
import {
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getAllUsers,
  toggleUserBlock,
  toggleUserAdmin,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', protect, updateUserProfile);
router.get('/addresses', protect, getUserAddresses);
router.post('/addresses', protect, addUserAddress);
router.put('/addresses/:id', protect, updateUserAddress);
router.delete('/addresses/:id', protect, deleteUserAddress);

// Admin Routes
router.get('/', protect, admin, getAllUsers);
router.put('/:id/block', protect, admin, toggleUserBlock);
router.put('/:id/admin', protect, admin, toggleUserAdmin);

export default router;
