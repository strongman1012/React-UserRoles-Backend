import { Router } from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUsers } from '../controllers/userController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/users', checkJwt, getAllUsers);
router.get('/users/:id', checkJwt, getUser);
router.post('/users', checkJwt, checkPermission("Users"), createUser)
router.put('/users/:id', checkJwt, checkPermission("Users"), updateUser);
router.delete('/users', checkJwt, checkPermission("Users"), deleteUsers);

export default router;
