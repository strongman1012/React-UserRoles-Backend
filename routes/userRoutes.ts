import { Router } from 'express';
import { getAllUsers, getUser, updateUser, deleteUser } from '../controllers/userController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/users', checkJwt, getAllUsers); // Get all users
router.get('/users/:id', checkJwt, getUser); // Get a user by ID
router.put('/users/:id', checkJwt, checkPermission("Users"), updateUser); // Update a user by ID
router.delete('/users/:id', checkJwt, checkPermission("Users"), deleteUser); // Delete a user by ID

export default router;
