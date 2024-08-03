import { Router } from 'express';
import { login, register, logout, azureAdLogin } from '../controllers/authController';
import { authenticate, azureAuthenticate } from '../middlewares/authenticate';

const router = Router();

router.post('/login', authenticate, login);
router.post('/azure-login', azureAuthenticate, azureAdLogin);
router.post('/register', register);
router.post('/logout', logout);

export default router;
