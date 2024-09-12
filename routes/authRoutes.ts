import { Router } from 'express';
import { login, loginWithToken, register, logout, azureAdLogin } from '../controllers/authController';
import { authenticate, azureAuthenticate } from '../middlewares/authenticate';
import { checkJwt } from '../middlewares/authenticate';

const router = Router();

router.post('/login', authenticate, login);
router.post('/loginWithToken', loginWithToken);
router.post('/azure-login', azureAuthenticate, azureAdLogin);
router.post('/register', register);
router.post('/logout', logout);

export default router;
