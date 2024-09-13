import { Router } from 'express';
import { getSetting, saveSetting } from '../controllers/settingController';
import { checkJwt } from '../middlewares/authenticate';

const router = Router();

router.get('/settings', checkJwt, getSetting);
router.post('/settings', checkJwt, saveSetting);

export default router;
