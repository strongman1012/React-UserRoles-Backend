import { Router } from 'express';
import { getAllList, saveList } from '../controllers/areaListController';
import { checkJwt } from '../middlewares/authenticate';
import { checkPermission } from '../middlewares/checkPermission';

const router = Router();

router.post('/areaList/getAll', checkJwt, getAllList);
router.post('/areaList/save', checkJwt, checkPermission('Security Roles'), saveList);

export default router;
