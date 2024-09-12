import { Router } from 'express';
import { saveSetting } from '../controllers/settingController';
import { checkJwt } from '../middlewares/authenticate';

const router = Router();

router.post('/settings', checkJwt, saveSetting);

export default router;
