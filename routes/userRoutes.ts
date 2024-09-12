import { Router } from 'express';
import { getAllUsersList, getAllUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/usersList', checkJwt, getAllUsersList);
router.get('/users', checkJwt, getAllUsers);
router.get('/users/:id', checkJwt, getUser);
router.post('/users', checkJwt, checkPermission("Users"), createUser)
router.put('/users/:id', checkJwt, checkPermission("Users"), updateUser);
router.delete('/users/:id', checkJwt, checkPermission("Users"), deleteUser);

export default router;
