import { Router } from 'express';
import { getUserAreas, getSelectedAreas, saveList } from '../controllers/areaListController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/areaList/getUserAreas/:role_id', checkJwt, getUserAreas);
router.get('/areaList/getSelectedAreas/:role_id', checkJwt, getSelectedAreas);
router.post('/areaList/save', checkJwt, checkPermission('Security Roles'), saveList);

export default router;
