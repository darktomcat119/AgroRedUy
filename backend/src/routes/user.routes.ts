import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// GET /users - Get all users (admin only) - TODO: Implement
router.get('/', authenticateToken, (_req, res) => {
  res.json({
    success: true,
    message: 'Get all users - To be implemented',
    data: []
  });
});

// GET /users/:id - Get user by ID
router.get('/:id', authenticateToken, userController.getUserById.bind(userController));

// GET /users/:id/profile - Get user profile (public information)
router.get('/:id/profile', userController.getUserProfile.bind(userController));

// PUT /users/:id - Update user
router.put('/:id', authenticateToken, userController.updateUser.bind(userController));

// DELETE /users/:id - Delete user
router.delete('/:id', authenticateToken, userController.deleteUser.bind(userController));

export default router;
