import { Router } from 'express';
import { getSelectedAreas, saveList, getApplicationRoles, saveApplicationRoles } from '../controllers/areaListController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.get('/areaList/getSelectedAreas/:role_id', checkJwt, getSelectedAreas);
router.post('/areaList/save', checkJwt, checkPermission('Security Roles'), saveList);
router.get('/applicationRoles/:role_id', checkJwt, getApplicationRoles);
router.post('/applicationRoles/save', checkJwt, saveApplicationRoles);

export default router;
